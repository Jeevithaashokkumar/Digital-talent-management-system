'use client';

import React from 'react';
import { Phone, PhoneOff, User, Shield, Zap } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useBoardStore } from '@/store/useBoardStore';

const IncomingCallModal = () => {
    const { isReceivingCall, caller, callType, resetCall, setInCall } = useCallStore();
    const setActiveView = useBoardStore(state => state.setActiveView);


    if (!isReceivingCall || !caller) return null;

    const handleAccept = () => {
        // Navigate to Call view — isReceivingCall stays true so CallModule's answer effect fires
        setActiveView('Call');
        // Close the modal by setting a flag (but don't resetCall — we need the signal!)
        // The modal will auto-hide since CallModule is now rendered
    };

    const handleReject = () => {
        const socket = typeof window !== 'undefined' ? (window as any).socket : null;
        if (socket && caller) {
            socket.emit('reject-call', { to: caller.id });
        }
        resetCall();
    };

    const displayName = (caller.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0a0b10]/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-3xl shadow-indigo-500/20">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={120} className="text-white" />
                </div>

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-xl shadow-indigo-500/10 animate-pulse">
                        <User size={48} className="text-indigo-400" />
                    </div>

                    <div className="mb-8">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block italic">Inbound Signal Matrix</span>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{displayName}</h3>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-2">{callType === 'video' ? 'Secure Video Link' : 'Tactical Audio Stream'}</p>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button 
                            onClick={handleReject}
                            className="p-6 bg-rose-600/20 border border-rose-500/30 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 group"
                        >
                            <PhoneOff size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={handleAccept}
                            className="p-8 bg-indigo-500 text-white rounded-[2rem] hover:scale-105 transition-all shadow-2xl shadow-indigo-500/40 group active:scale-95"
                        >
                            <Phone size={32} className="group-hover:animate-bounce" />
                        </button>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-3">
                        <Shield size={14} className="text-indigo-500" />
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Encrypted Channel Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
