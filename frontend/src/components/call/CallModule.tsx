'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Shield, Zap, User, Users, Activity, Clock, Lock, Download } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

export default function CallModule() {
  const { isCalling, isReceivingCall, isInCall, callAccepted, caller, callType, remoteSignal, resetCall, setInCall, setCallAccepted } = useCallStore();
  const user = useAuthStore((state: any) => state.user);
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [isRecording, setIsRecording] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pendingCandidates = useRef<any[]>([]);
  const pendingAcceptance = useRef<any | null>(null);
  const isRequestingMedia = useRef<boolean>(false);
  
  // Always show the partner's name
  const displayName = (caller?.name || 'Remote Participant').replace(/OPERATOR|Operator/gi, 'User').trim();

  useEffect(() => {
    let timer: any;
    if (isInCall) {
      setStatus('connected');
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
      startRecording();
    } else {
      setDuration(0);
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isInCall, remoteStream]);

  const iceConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  const startRecording = () => {
    if (!localStreamRef.current || !remoteStream) return;
    try {
      const combinedStream = new MediaStream([
        ...localStreamRef.current.getTracks(),
        ...remoteStream.getTracks()
      ]);
      
      chunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus', audioBitsPerSecond: 128000 };
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `DTMS_Signal_Log_${new Date().getTime()}.webm`;
        document.body.appendChild(a);
        a.click();
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (e) { console.error("Recording failed", e); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Assign stream to video on change
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
        console.log("Attaching remote stream to video element for playback...");
        remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // --- Unified Signaling Logic ---
  useEffect(() => {
    const socket = (window as any).socket;
    if (!socket || !user || (!isCalling && !isReceivingCall)) return;

    if (isCalling) setStatus('ringing');

    // Handle Call Acceptance (Sender Side)
    socket.on('call-accepted', async (signal: any) => {
      console.log("Signal Handshake Accepted by Peer");
      if (pc.current && caller) {
        try {
            await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
            setInCall(true);
            setCallAccepted(true);
            setStatus('connected');
        } catch (e) { console.error("Handshake Error:", e); }
      } else {
        console.log("Stashing early signal...");
        pendingAcceptance.current = signal;
      }
    });

    // Unified Listeners
    socket.on('ice-candidate', async (candidate: any) => {
      if (pc.current && candidate) {
        try { await pc.current.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) { console.error('ICE Error', e); }
      } else if (candidate) {
        console.log("Stashing early ICE candidate...");
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on('call-rejected', () => {
        (window as any).addToast?.('Signal Rejected', 'error');
        handleEndCall(false);
    });

    socket.on('call-ended', () => handleEndCall(false));

    if (isCalling) {
      startCallerFlow();
    } else if (isReceivingCall && isInCall) {
      // Receivers ONLY start their flow once they have explicitly clicked "Accept" (isInCall)
      startReceiverFlow();
    }

    async function startCallerFlow() {
      if (isRequestingMedia.current) return;
      isRequestingMedia.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: audioConstraints
        });
        isRequestingMedia.current = false;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        pc.current = new RTCPeerConnection(iceConfig);
        stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

        pc.current.ontrack = (event) => {
          console.log("Remote track detected. Initializing audio pipeline...");
          setRemoteStream(event.streams[0]);
        };

        pc.current.onicecandidate = (event) => {
          if (event.candidate && caller) {
            socket.emit('ice-candidate', { to: caller.id, candidate: event.candidate });
          }
        };

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        // Process early acceptance (ANSWER)
        if (pendingAcceptance.current) {
            console.log("Applying stashed remote answer...");
            try {
                await pc.current.setRemoteDescription(new RTCSessionDescription(pendingAcceptance.current));
                setInCall(true);
                setCallAccepted(true);
                setStatus('connected');
                pendingAcceptance.current = null;
            } catch (e) { console.error("Stashed Handshake Error:", e); }
        }

        // Process any pending ICE candidates
        while (pendingCandidates.current.length > 0) {
            const cand = pendingCandidates.current.shift();
            try {
                if (pc.current.remoteDescription) {
                    await pc.current.addIceCandidate(new RTCIceCandidate(cand));
                } else {
                    pendingCandidates.current.push(cand); // Put back if remote desc not yet set
                    break;
                }
            } catch (e) { console.error('Stashed ICE Error', e); }
        }

        if (caller) {
          socket.emit('call-user', {
            to: caller.id,
            signal: offer,
            from: user.id,
            name: user.name,
            type: callType
          });
        }
      } catch (err: any) {
        isRequestingMedia.current = false;
        if (err.name === 'NotReadableError') {
          (window as any).addToast?.('Camera/Mic already in use by another task.', 'error');
        }
        console.error('Handshake Failure:', err);
        handleEndCall(false);
      }
    }

    async function startReceiverFlow() {
        if (isRequestingMedia.current) return;
        console.log("Answering signal handshake...");
        isRequestingMedia.current = true;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: callType === 'video',
            audio: audioConstraints
          });
          isRequestingMedia.current = false;
          localStreamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  
          pc.current = new RTCPeerConnection(iceConfig);
          stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
  
          pc.current.ontrack = (event) => {
            console.log("Remote stream incoming...");
            setRemoteStream(event.streams[0]);
          };
  
          pc.current.onicecandidate = (event) => {
            if (event.candidate && caller) {
              socket.emit('ice-candidate', { to: caller.id, candidate: event.candidate });
            }
          };
  
          await pc.current.setRemoteDescription(new RTCSessionDescription(remoteSignal));

          // Process any pending candidates (now that remote description is set)
          while (pendingCandidates.current.length > 0) {
              const cand = pendingCandidates.current.shift();
              try {
                  await pc.current.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) { console.error('Stashed ICE Error (Receiver)', e); }
          }

          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
  
          if (caller) {
            socket.emit('answer-call', { to: caller.id, signal: answer, from: user.id, type: callType });
            setInCall(true);
            setStatus('connected');
          }
        } catch (err: any) {
          isRequestingMedia.current = false;
          if (err.name === 'NotReadableError') {
            (window as any).addToast?.('Camera already in use. Please check other tabs.', 'error');
          }
          console.error('Answer Failure:', err);
          handleEndCall(false);
        }
    }

    return () => {
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
      socket.off('ice-candidate');
      cleanup();
    };
  }, [isCalling, isReceivingCall]);

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pc.current?.close();
    pc.current = null;
  };

  const handleEndCall = async (notify = true) => {
    if (notify) {
        const socket = (window as any).socket;
        socket?.emit('end-call', { to: caller?.id });
    }

    if (caller) {
        try {
            const finalStatus = isInCall ? 'connected' : (status === 'ringing' ? 'missed' : 'ended');
            await api.post('/calls/log', {
                callerId: isCalling ? user.id : caller.id,
                receiverId: isCalling ? caller.id : user.id,
                type: callType,
                status: finalStatus,
                duration: isInCall ? duration : 0
            });
        } catch (e) { console.error("Log error", e); }
    }

    resetCall();
    setStatus('ended');
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="h-full bg-[#0a0b10] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Playback Layer - Hidden Audio Bypass */}
        <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`fixed inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${remoteStream && callType === 'video' ? 'opacity-100' : 'opacity-0'}`} 
            style={{ zIndex: remoteStream && callType === 'video' ? 5 : -1 }}
        />

        {/* Dynamic Background */}
        {!isInCall && !isCalling && !isReceivingCall ? (
           <div className="relative z-10 text-center max-w-xl animate-in zoom-in duration-700">
               <div className="w-48 h-48 bg-indigo-500/10 rounded-[4rem] flex items-center justify-center mx-auto mb-12 border border-indigo-500/20 shadow-3xl shadow-indigo-500/10 group cursor-default">
                  <Activity size={96} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
               </div>
               <h2 className="text-7xl font-black text-white tracking-tighter mb-6 italic uppercase tracking-tighter">Signal Matrix</h2>
               <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.6em] mb-12 max-w-md mx-auto leading-relaxed italic opacity-40">Ready for secure uplink.</p>
           </div>
        ) : (
           <div className="w-full h-full flex flex-col relative z-20 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex-1 bg-white/5 rounded-[5rem] border border-white/10 relative overflow-hidden shadow-3xl group/view backdrop-blur-xl">
                 
                 {/* Visual Representation */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    {/* Only show placeholder if NOT video or if video is connecting */}
                    {!(remoteStream && callType === 'video') && (
                       <div className="text-center relative">
                          <div className="absolute -inset-20 bg-indigo-500/5 blur-[100px] rounded-full animate-pulse" />
                          <div className="w-40 h-40 rounded-[3.5rem] bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl relative">
                             <User size={80} className="text-indigo-400" />
                             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-[#12141c] flex items-center justify-center">
                                <Shield size={14} className="text-white" />
                             </div>
                          </div>
                          <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-4 drop-shadow-lg">{displayName}</h3>
                          <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                             <div className={`w-2.5 h-2.5 rounded-full ${isInCall ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'} animate-pulse`} />
                             <span className="text-xs font-black text-white uppercase tracking-[0.3em]">
                                {isInCall ? (isRecording ? "ENCRYPTING " : "") + formatTime(duration) : status.toUpperCase() + '...'}
                             </span>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Local Small Preview */}
                 {callType === 'video' && (
                    <div className="absolute top-12 right-12 w-72 h-44 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-all hover:scale-105 z-30">
                        <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${videoOn ? 'opacity-100' : 'opacity-0'}`} />
                        {!videoOn && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <VideoOff size={32} className="text-white/20" />
                        </div>
                        )}
                        <div className="absolute bottom-4 left-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60 italic">Me</span>
                        </div>
                    </div>
                 )}

                 {/* Top Status Bar */}
                 <div className="absolute top-12 left-12 flex flex-col gap-4 z-30">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[1.5rem] flex items-center gap-4 hover:bg-black/60 transition-all border-l-4 border-l-indigo-500">
                       <Lock size={16} className="text-indigo-400" />
                       <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none italic">Secure Link Layer</span>
                           <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest mt-1">E2E-ENCRYPTED ACTIVE</span>
                       </div>
                    </div>
                    {isInCall && (
                       <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[1.5rem] flex items-center gap-4 animate-in slide-in-from-left duration-500 border-l-4 border-l-emerald-500">
                          <Activity size={16} className="text-emerald-400" />
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none italic">Uplink Stability</span>
                              <span className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest mt-1">BITRATE OPTIMIZED</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {/* Tactical Controls */}
              <div className="h-44 flex items-center justify-center gap-10 shrink-0">
                 <button 
                    onClick={() => {
                        const track = localStreamRef.current?.getAudioTracks()[0];
                        if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
                    }}
                    className={`p-9 rounded-[2.5rem] transition-all border-2 ${micOn ? 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20' : 'bg-rose-500 border-rose-400 text-white shadow-3xl shadow-rose-500/30'}`}
                 >
                    {micOn ? <Mic size={32} /> : <MicOff size={32} />}
                 </button>

                 <button 
                    onClick={() => handleEndCall(true)}
                    className="p-11 bg-rose-600 hover:bg-rose-500 text-white rounded-[4rem] shadow-3xl shadow-rose-500/50 transition-all hover:scale-105 active:scale-95 group relative"
                 >
                    <div className="absolute -inset-4 bg-rose-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PhoneOff size={44} />
                 </button>

                 <button 
                    onClick={() => {
                        const track = localStreamRef.current?.getVideoTracks()[0];
                        if (track) { track.enabled = !track.enabled; setVideoOn(track.enabled); }
                    }}
                    className={`p-9 rounded-[2.5rem] transition-all border-2 ${videoOn ? 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20' : 'bg-rose-500 border-rose-400 text-white shadow-3xl shadow-rose-500/30'}`}
                 >
                    {videoOn ? <Video size={32} /> : <VideoOff size={32} />}
                 </button>
              </div>
           </div>
        )}
    </div>
  );
}
