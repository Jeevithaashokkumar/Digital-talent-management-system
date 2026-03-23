'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Shield, Zap, User, Users } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CallModule() {
  const { isCalling, isReceivingCall, isInCall, callAccepted, caller, callType, remoteSignal, resetCall, setInCall, setCallAccepted } = useCallStore();
  const user = useAuthStore((state: any) => state.user);
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const displayName = (caller?.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

  useEffect(() => {
    let timer: any;
    if (isInCall) {
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  useEffect(() => {
    const initCall = async () => {
      const socket = (window as any).socket;
      if (!socket || !user) return;

      // 1. Get Local Stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // 2. Initialize PeerConnection
        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add tracks
        stream.getTracks().forEach(track => {
          pc.current?.addTrack(track, stream);
        });

        // Handle remote stream
        pc.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        pc.current.onicecandidate = (event) => {
          if (event.candidate && caller) {
            socket.emit('ice-candidate', { to: caller.id, candidate: event.candidate });
          }
        };

        // 3. Signaling logic
        if (isCalling && caller) {
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);
          socket.emit('call-user', { 
            to: caller.id, 
            signal: offer, 
            from: user.id, 
            name: user.name, 
            type: callType 
          });
        } else if (isReceivingCall && remoteSignal) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(remoteSignal));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          socket.emit('answer-call', { to: caller.id, signal: answer });
          setInCall(true); // Officially in call now
        }

        // Listen for accepted/rejected/ice
        socket.on('call-accepted', async (signal: any) => {
           if (pc.current) {
              await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
              setInCall(true);
           }
        });

        socket.on('ice-candidate', async (candidate: any) => {
           if (pc.current && candidate) {
              try {
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) { console.error('Error adding ICE candidate', e); }
           }
        });

      } catch (err) {
        console.error('Failed to get media devices or init connection', err);
        resetCall();
      }
    };

    if (isCalling || isReceivingCall) {
       initCall();
    }

    return () => {
       const socket = (window as any).socket;
       socket?.emit('end-call', { to: caller?.id });
       socket?.off('call-accepted');
       socket?.off('ice-candidate');
       localStreamRef.current?.getTracks().forEach(t => t.stop());
       pc.current?.close();
       pc.current = null;
    };
  }, [isCalling, isReceivingCall]); // Initial trigger

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    const socket = (window as any).socket;
    socket?.emit('end-call', { to: caller?.id });
    resetCall();
  };

  return (
    <div className="h-full bg-[#0a0b10] flex flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        {!isInCall && !isCalling && !isReceivingCall ? (
           <div className="relative z-10 text-center max-w-2xl animate-in zoom-in duration-500">
              <div className="w-40 h-40 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-3xl shadow-indigo-500/20 group hover:scale-105 transition-transform">
                 <Shield size={80} className="text-indigo-400" />
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-4 italic uppercase">Secure Signal</h2>
              <p className="text-white/30 font-black text-xs uppercase tracking-[0.5em] mb-12">Select a User from Chat to Initiate Link</p>
           </div>
        ) : (
           <div className="w-full h-full flex flex-col relative z-10 animate-in fade-in duration-700">
              {/* Main Viewport */}
              <div className="flex-1 bg-white/5 rounded-[4rem] border border-white/10 relative overflow-hidden shadow-3xl">
                 <div className="absolute inset-0 flex items-center justify-center">
                    {remoteStream && callType === 'video' ? (
                       <video 
                         ref={remoteVideoRef} 
                         autoPlay 
                         playsInline 
                         className="w-full h-full object-cover"
                       />
                    ) : (
                       <div className="text-center">
                          <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse">
                             <User size={64} className="text-indigo-400" />
                          </div>
                          <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">{displayName}</h3>
                          <div className="flex items-center justify-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                             <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                                {isInCall ? formatTime(duration) : 'SIGNAL_LINKING...'}
                             </span>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Local Preview */}
                 <div className="absolute top-10 right-10 w-64 h-40 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${videoOn ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {!videoOn && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <VideoOff size={32} className="text-white/10" />
                       </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <span className="text-[8px] font-black text-white uppercase tracking-widest">Local Node</span>
                    </div>
                 </div>

                 {/* Overlays */}
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                       <Shield size={16} className="text-indigo-500" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">SECURE_LINK_{isInCall ? 'VERIFIED' : 'PENDING'}</span>
                    </div>
                    {isInCall && (
                       <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">ENCRYPTING_SIGNAL...</span>
                       </div>
                    )}
                 </div>
              </div>

              {/* Controls */}
              <div className="h-40 flex items-center justify-center gap-8 shrink-0">
                 <button 
                    onClick={() => {
                        const track = localStreamRef.current?.getAudioTracks()[0];
                        if (track) {
                           track.enabled = !track.enabled;
                           setMicOn(track.enabled);
                        }
                    }}
                    className={`p-8 rounded-[2rem] transition-all border ${micOn ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'}`}
                 >
                    {micOn ? <Mic size={28} /> : <MicOff size={28} />}
                 </button>
                 <button 
                    onClick={handleEndCall}
                    className="p-10 bg-rose-600 hover:bg-rose-500 text-white rounded-[2.5rem] shadow-2xl shadow-rose-500/40 transition-all hover:scale-105 active:scale-95"
                 >
                    <PhoneOff size={36} />
                 </button>
                 <button 
                    onClick={() => {
                        const track = localStreamRef.current?.getVideoTracks()[0];
                        if (track) {
                           track.enabled = !track.enabled;
                           setVideoOn(track.enabled);
                        }
                    }}
                    className={`p-8 rounded-[2rem] transition-all border ${videoOn ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'}`}
                 >
                    {videoOn ? <Video size={28} /> : <VideoOff size={28} />}
                 </button>
              </div>
           </div>
        )}
    </div>
  );
}
