'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserStatusIndicatorProps {
  isOnline: boolean;
  lastSeen?: string | Date;
  size?: number;
  showText?: boolean;
  className?: string;
  isBot?: boolean;
}

export const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ 
  isOnline, 
  lastSeen, 
  size = 12, 
  showText = false,
  className = "",
  isBot = false
}) => {
  if (isBot) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[4px] opacity-60 animate-ping"></div>
        </div>
        {showText && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic animate-pulse">Neural Active</span>}
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex items-center justify-center">
          <CheckCircle2 size={size} className="text-emerald-500 fill-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[2px] opacity-40 animate-pulse"></div>
        </div>
        {showText && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Online</span>}
      </div>
    );
  }

  // Determine if "Away" (Clock) or "Offline" (X)
  // For now, if not online, it's offline (X). We can add "Away" logic later if needed.
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <XCircle size={size} className="text-rose-500/60 fill-rose-500/5 group-hover:text-rose-500 transition-colors" />
      {showText && <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Offline</span>}
    </div>
  );
};

export const LastSeenBadge: React.FC<{ lastSeen?: string | Date }> = ({ lastSeen }) => {
  if (!lastSeen) return null;

  const getTimeAgo = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all">
        <XCircle size={20} className="text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
      <div>
        <p className="text-xs font-black text-white tracking-tight uppercase">Last seen {getTimeAgo(lastSeen)}</p>
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Signal Disruption Detected</p>
      </div>
    </div>
  );
};
