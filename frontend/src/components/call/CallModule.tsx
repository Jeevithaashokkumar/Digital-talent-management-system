'use client';

import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Shield, Zap, User, Users } from 'lucide-react';

export default function CallModule() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (inCall) {
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-[#0a0b10] flex flex-col items-center justify-center p-12 relative overflow-hidden">
       {/* Background Grid/Pattern */}
       <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]" />
       </div>

       {!inCall ? (
          <div className="relative z-10 text-center max-w-2xl animate-in zoom-in duration-500">
             <div className="w-40 h-40 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-3xl shadow-indigo-500/20 group hover:scale-105 transition-transform">
                <Shield size={80} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
             </div>
             <h2 className="text-6xl font-black text-white tracking-tighter mb-4 italic uppercase italic">Secure Signal</h2>
             <p className="text-white/30 font-black text-xs uppercase tracking-[0.5em] mb-12 italic">End-to-End Encrypted Voice/Video Link</p>
             
             <div className="grid grid-cols-2 gap-8">
                <button 
                  onClick={() => setInCall(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white p-10 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 group"
                >
                   <Phone size={44} className="group-hover:rotate-12 transition-transform" />
                   <span className="font-black uppercase tracking-widest text-sm">Initiate Voice</span>
                </button>
                <button 
                   onClick={() => setInCall(true)}
                   className="bg-indigo-500 hover:bg-indigo-400 text-white p-10 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 group"
                >
                   <Video size={44} className="group-hover:scale-110 transition-transform" />
                   <span className="font-black uppercase tracking-widest text-sm">Establish Visual</span>
                </button>
             </div>
             
             <div className="mt-16 flex items-center justify-center gap-8 text-white/10 font-black text-[10px] uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2">
                   <Zap size={14} className="text-emerald-500" />
                   <span>Latency: 14ms</span>
                </div>
                <div className="flex items-center gap-2">
                   <Users size={14} className="text-indigo-500" />
                   <span>Matrix Active</span>
                </div>
             </div>
          </div>
       ) : (
          <div className="w-full h-full flex flex-col relative z-10 animate-in fade-in duration-700">
             {/* Main Viewport */}
             <div className="flex-1 bg-white/5 rounded-[4rem] border border-white/10 relative overflow-hidden shadow-3xl">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse">
                         <User size={64} className="text-indigo-400" />
                      </div>
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">Matrix Operator</h3>
                      <div className="flex items-center justify-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                         <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">{formatTime(duration)}</span>
                      </div>
                   </div>
                </div>

                {/* Local Preview */}
                <div className="absolute top-10 right-10 w-64 h-40 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                   {videoOn ? (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-900/20">
                         <User size={40} className="text-white/20" />
                         <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">You (Local)</span>
                         </div>
                      </div>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center">
                         <VideoOff size={32} className="text-white/10" />
                      </div>
                   )}
                </div>

                {/* Overlays */}
                <div className="absolute top-10 left-10 flex flex-col gap-4">
                   <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                      <Shield size={16} className="text-indigo-500" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">SECURE_LINK_ACTIVE</span>
                   </div>
                   <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">RECORDING...</span>
                   </div>
                </div>
             </div>

             {/* Controls */}
             <div className="h-40 flex items-center justify-center gap-8 shrink-0">
                <button 
                   onClick={() => setMicOn(!micOn)}
                   className={`p-8 rounded-[2rem] transition-all border ${micOn ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'}`}
                >
                   {micOn ? <Mic size={28} /> : <MicOff size={28} />}
                </button>
                <button 
                   onClick={() => setInCall(false)}
                   className="p-10 bg-rose-600 hover:bg-rose-500 text-white rounded-[2.5rem] shadow-2xl shadow-rose-500/40 transition-all hover:scale-105 active:scale-95"
                >
                   <PhoneOff size={36} />
                </button>
                <button 
                   onClick={() => setVideoOn(!videoOn)}
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
