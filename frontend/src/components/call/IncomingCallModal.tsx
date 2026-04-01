'use client';

import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Shield, Zap, BellRing } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useBoardStore } from '@/store/useBoardStore';

const IncomingCallModal = () => {
    const { isReceivingCall, isInCall, caller, callType, resetCall, setInCall } = useCallStore();
    const setActiveView = useBoardStore(state => state.setActiveView);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isReceivingCall) {
            // Premium Tactical/Futuristic notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.loop = true;
            audio.play().catch(e => console.log("Audio play blocked:", e));
            audioRef.current = audio;
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [isReceivingCall]);

    const handleAccept = () => {
        console.log("Accepting call from:", caller?.id);
        if (audioRef.current) audioRef.current.pause();
        // Optimistically set in-call to hide the modal and show the link status
        setInCall(true);
        setActiveView('Call');
    };

    if (!isReceivingCall || !caller || isInCall) return null;

    const handleReject = () => {
        if (audioRef.current) audioRef.current.pause();
        const socket = typeof window !== 'undefined' ? (window as any).socket : null;
        if (socket && caller) {
            socket.emit('reject-call', { to: caller.id, from: (window as any).userId, type: callType });
        }
        resetCall();
    };

    const displayName = (caller.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-[3.5rem] p-10 relative overflow-hidden shadow-3xl shadow-indigo-500/20 ring-1 ring-white/5">
                {/* Visual Radar Pulse */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full animate-ping opacity-20 pointer-events-none" />
                
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                    <Zap size={160} className="text-indigo-400" />
                </div>

                <div className="relative z-10 text-center">
                    <div className="relative inline-block mb-10">
                        <div className="w-28 h-28 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 animate-pulse transition-all">
                            <User size={56} className="text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded-2xl shadow-lg border-4 border-[#12141c] animate-bounce">
                            <BellRing size={20} className="text-white" />
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Inbound Signal Matrix</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{displayName}</h3>
                        <div className="flex items-center justify-center gap-3 mt-3">
                           <div className={`p-1.5 rounded-lg ${callType === 'video' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                             {callType === 'video' ? <Zap size={12} /> : <Shield size={12} />}
                           </div>
                           <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{callType === 'video' ? 'Secure Video Link' : 'Tactical Audio Stream'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <button 
                            onClick={handleReject}
                            className="p-7 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 group active:scale-90"
                        >
                            <PhoneOff size={28} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={handleAccept}
                            className="p-10 bg-indigo-500 text-white rounded-[2.5rem] hover:bg-indigo-400 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/40 group active:scale-95"
                        >
                            <Phone size={36} className="group-hover:animate-bounce" />
                        </button>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-3 py-3 px-6 bg-white/5 rounded-2xl border border-white/5">
                        <Shield size={12} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Signal Encrypted & Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
