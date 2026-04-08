'use client';

import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Video, 
  Phone, 
  Linkedin, 
  ChevronRight, 
  Send, 
  Mail, 
  ShieldCheck, 
  User as UserIcon,
  Search,
  ExternalLink
} from 'lucide-react';
import { LastSeenBadge, UserStatusIndicator } from '../ui/UserStatusIndicator';

interface UserProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (msg: string) => void;
  onCall?: (type: 'voice' | 'video') => void;
}

export default function UserProfileModal({ user, isOpen, onClose, onSendMessage, onCall }: UserProfileModalProps) {
  const [quickMsg, setQuickMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleSendQuickMsg = () => {
    if (quickMsg.trim() && onSendMessage) {
      onSendMessage(quickMsg);
      setQuickMsg('');
      (window as any).addToast?.(`Signal dispatched to ${user.name}`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-[#0f1118] border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all z-10">
          <X size={18} />
        </button>

        <div className="px-8 pt-10 pb-8 relative z-[2]">
          {/* Header Info */}
          <div className="flex items-start gap-5 mb-8">
            <div className="relative group">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.15)] group-hover:scale-105 transition-transform">
                <UserIcon size={32} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0f1118] rounded-full p-1 border-2 border-[#0f1118]">
                <UserStatusIndicator isOnline={user.isOnline} size={16} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1 group-hover:text-indigo-400 transition-colors">{(user.name || 'Anonymous Operator').replace(/OPERATOR|Operator/gi, 'User').trim()}</h2>
              <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-full px-3 py-1 w-fit mt-2">
                 <ShieldCheck size={12} className="text-indigo-400" />
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{user.role || 'GUEST'}</span>
              </div>
              <div className="flex items-center gap-4 text-white/30">
                 <button className="hover:text-indigo-400 transition-colors"><MessageSquare size={18} /></button>
                 <button onClick={() => onCall?.('video')} className="hover:text-indigo-400 transition-colors"><Video size={18} /></button>
                 <button onClick={() => onCall?.('voice')} className="hover:text-indigo-400 transition-colors"><Phone size={18} /></button>
                 <button className="hover:text-indigo-400 transition-colors"><Linkedin size={18} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[11px] font-bold text-white/40 leading-relaxed italic">{(user.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim()} has been added as a <span className="text-indigo-400">{user.role || 'guest'}</span> in your organization. <span className="text-white/60 hover:underline cursor-pointer">Learn more</span></p>
            
            {/* Last Seen Status Box */}
            {!user.isOnline ? (
              <LastSeenBadge lastSeen={user.lastSeen} />
            ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                        <UserStatusIndicator isOnline={true} size={20} />
                    </div>
                  <div>
                    <p className="text-xs font-black text-emerald-400 tracking-tight uppercase">User is Online</p>
                    <p className="text-[8px] font-bold text-emerald-400/40 uppercase tracking-widest mt-0.5">Signal Matrix Synchronized</p>
                  </div>
                </div>
            )}

            {/* Quick Message */}
            <div className="relative group">
              <input 
                placeholder="Send a quick message" 
                value={quickMsg}
                onChange={e => setQuickMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendQuickMsg()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs font-bold text-white outline-none focus:border-indigo-500/30 transition-all placeholder:text-white/20"
              />
              <button 
                onClick={handleSendQuickMsg}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-indigo-400 transition-colors"
                disabled={!quickMsg.trim()}
              >
                <Send size={16} />
              </button>
            </div>

            {/* Contact Details */}
            <div className="pt-2">
               <button className="flex items-center gap-2 group/contact mb-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover/contact:text-indigo-400 transition-colors">Contact</span>
                  <ChevronRight size={14} className="text-white/20 group-hover/contact:text-indigo-400 transition-all" />
               </button>
               <div className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-2xl p-4 transition-all group/email">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 opacity-60">
                     <Mail size={14} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <p className="text-[10px] text-white/50 font-black tracking-tight truncate">{user.email}</p>
                  </div>
                  <button className="text-white/10 group-hover/email:text-white/30 hover:!text-white transition-all"><ExternalLink size={12} /></button>
               </div>

                <div className="text-center mt-6">
                    <button className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] hover:text-white/40 transition-colors">Show more matrix details</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
