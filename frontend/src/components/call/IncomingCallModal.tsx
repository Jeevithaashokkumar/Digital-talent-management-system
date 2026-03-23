'use client';

import React from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useCallStore } from '@/store/useCallStore';
import { useBoardStore } from '@/store/useBoardStore';

export default function IncomingCallModal() {
  const { isReceivingCall, caller, callType, resetCall, setInCall } = useCallStore();
  const setActiveView = useBoardStore(state => state.setActiveView);
  const displayName = (caller?.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

  if (!isReceivingCall) return null;

  const handleAccept = () => {
    setInCall(true);
    setActiveView('Call');
  };

  const handleReject = () => {
    const socket = (window as any).socket;
    if (socket && caller) {
      socket.emit('reject-call', { to: caller.id });
    }
    resetCall();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a1c26] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10 animate-bounce">
            <User size={48} className="text-indigo-400" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">{displayName}</h2>
          <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center justify-center gap-2">
            {callType === 'video' ? <Video size={14} className="text-indigo-400" /> : <Phone size={14} className="text-emerald-400" />}
            Incoming {callType === 'video' ? 'Visual' : 'Audio'} Signal...
          </p>

          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={handleReject}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-6 rounded-3xl flex items-center justify-center gap-3 border border-rose-500/20 transition-all active:scale-95 group"
            >
              <PhoneOff size={24} className="group-hover:-rotate-12 transition-transform" />
              <span className="font-black uppercase tracking-widest text-[10px]">Decline</span>
            </button>
            <button 
              onClick={handleAccept}
              className="bg-emerald-500 hover:bg-emerald-400 text-white p-6 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group"
            >
              <Phone size={24} className="group-hover:rotate-12 transition-transform" />
              <span className="font-black uppercase tracking-widest text-[10px]">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
