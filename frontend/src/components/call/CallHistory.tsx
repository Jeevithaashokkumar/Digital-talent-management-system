'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Video, Calendar, Clock, User, Shield, Info, ArrowUpRight, ArrowDownLeft, XCircle, Slash, Activity } from 'lucide-react';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

export default function CallHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/calls/history');
        setHistory(res.data);
      } catch (e) {
        console.error("Failed to fetch call history", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string, isIncoming: boolean) => {
    if (status === 'missed') return <XCircle size={14} className="text-rose-500" />;
    if (status === 'rejected') return <Slash size={14} className="text-amber-500" />;
    return isIncoming ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-indigo-500" />;
  };

  return (
    <div className="h-full bg-[#0a0b10] p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">Signal Logs</h1>
                <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.5em] italic">Historical communication matrix records.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 px-8">
                <Activity className="text-indigo-400" size={20} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{history.length} Total Signals Recorded</span>
            </div>
        </div>

        {loading ? (
            <div className="h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        ) : history.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center">
                <Shield size={64} className="text-white/10 mx-auto mb-8" />
                <h3 className="text-2xl font-black text-white/40 uppercase italic tracking-tighter">No encrypted signals found in history.</h3>
            </div>
        ) : (
            <div className="grid gap-4">
                {history.map((call) => {
                    const isIncoming = call.receiverId === call.caller.id; // Corrected logic might depend on user object
                    // In real app, check against current user ID
                    return (
                        <div key={call.id} className="group bg-[#12141c] hover:bg-[#161925] border border-white/5 hover:border-indigo-500/30 p-6 rounded-[2.5rem] transition-all flex items-center justify-between shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                {call.type === 'video' ? <Video size={100} /> : <Phone size={100} />}
                            </div>

                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/40 transition-colors">
                                    <User size={32} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">
                                        {call.caller.name}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(call.status, isIncoming)}
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                {call.status}
                                            </span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            {formatDistanceToNow(new Date(call.createdAt))} ago
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12 relative z-10 px-8">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Type</p>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-indigo-400">
                                        {call.type === 'video' ? <Video size={16} /> : <Phone size={16} />}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Duration</p>
                                    <span className="text-xs font-black text-white tracking-widest leading-none">
                                        {formatDuration(call.duration)}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Security</p>
                                    <Shield size={16} className="text-emerald-500 mx-auto" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
