'use client';

import React, { useEffect, useState } from 'react';
import { useQueryStore } from '@/store/useQueryStore';
import { Inbox, MessageSquare, Send, User as UserIcon, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminQueryModule() {
  const { queries, loading, fetchAllQueries, replyToQuery } = useQueryStore();
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchAllQueries();
  }, [fetchAllQueries]);

  const handleReply = async (queryId: string) => {
    const reply = replyText[queryId];
    if (!reply) return;
    await replyToQuery(queryId, reply);
    setReplyText(prev => ({ ...prev, [queryId]: '' }));
    (window as any).addToast?.('Strategic Reply Transmitted', 'success');
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Global Query Stream</h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Tactical oversight and personnel response hub.</p>
          </div>
          <div className="flex gap-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <Inbox className="text-indigo-400" size={20} />
                <div>
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Total Pending</p>
                   <p className="text-sm font-black text-white">{queries.filter(q => q.status === 'pending').length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Query Feed */}
        <div className="space-y-8">
          {queries.map((q) => (
            <div key={q.id} className={`bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden group ${q.status === 'replied' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                      <UserIcon className="text-white/20" size={32} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-white tracking-tighter uppercase">{q.title}</h4>
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                         <UserIcon size={12} /> {q.user?.name} ({q.user?.email})
                      </p>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${q.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400 animate-pulse'}`}>
                      {q.status}
                   </span>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> {new Date(q.createdAt).toLocaleString()}
                   </p>
                </div>
              </div>

              <div className="p-8 bg-black/30 rounded-3xl border border-white/5 mb-8">
                <p className="text-white/80 text-lg leading-relaxed font-medium">{q.message}</p>
              </div>

              {q.status === 'pending' ? (
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Compose Strategic Response</p>
                   <textarea 
                     value={replyText[q.id] || ''}
                     onChange={(e) => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                     placeholder="Transmit authoritative reply..."
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white outline-none focus:border-indigo-500/30 transition-all min-h-[100px] font-medium text-sm"
                   />
                   <button 
                     onClick={() => handleReply(q.id)}
                     className="px-10 py-5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center gap-3"
                   >
                     Deploy Response <Send size={14} />
                   </button>
                </div>
              ) : (
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative overflow-hidden">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle size={14} /> Transmitted Resolution
                   </p>
                   <p className="text-white/60 italic font-medium">{q.adminReply}</p>
                </div>
              )}
            </div>
          ))}

          {queries.length === 0 && !loading && (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
              <Inbox size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/20 font-black uppercase tracking-[0.2em]">Query buffer clear. No personnel inquiries detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
