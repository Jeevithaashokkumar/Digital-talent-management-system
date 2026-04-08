'use client';

import React, { useEffect, useState } from 'react';
import { useQueryStore } from '@/store/useQueryStore';
import { Send, Clock, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export default function UserQueryModule() {
  const { queries, loading, error, submitQuery, fetchUserQueries } = useQueryStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserQueries();
  }, [fetchUserQueries]);

  useEffect(() => {
    const unreadQueries = queries.filter(q => q.status === 'replied' && !q.isRead);
    unreadQueries.forEach(q => useQueryStore.getState().markAsRead(q.id));
  }, [queries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    await submitQuery({ title, message });
    setTitle('');
    setMessage('');
    (window as any).addToast?.('Tactical Query Transmitted', 'success');
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar space-y-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Query Interface</h2>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Direct communication channel with Command Core.</p>
        </div>

        {/* Submit Form */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
             <Send size={20} className="text-indigo-400" /> Dispatch New Query
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Subject Identifier</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your inquiry..."
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/30 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Tactical Detail</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your query in detail..."
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/30 transition-all min-h-[120px] font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !title || !message}
              className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs"
            >
              {loading ? 'Transmitting...' : 'Initialize Query'}
            </button>
          </form>
        </div>

        {/* Query List */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Clock size={20} className="text-amber-400" /> Active Logs
          </h3>
          <div className="grid gap-6">
            {queries.map((q) => (
              <div key={q.id} className="bg-black/20 border border-white/5 rounded-3xl p-8 hover:bg-white/[0.02] transition-all group border-l-4" style={{ borderLeftColor: q.status === 'replied' ? '#10b981' : '#6366f1' }}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-black text-white tracking-tight">{q.title}</h4>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${q.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {q.status}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">{q.message}</p>
                
                {q.adminReply && (
                  <div className="mt-6 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <MessageSquare size={12} /> Command Core Response
                    </p>
                    <p className="text-white/80 text-sm italic font-medium">{q.adminReply}</p>
                  </div>
                )}
                
                <div className="mt-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
                   Timestamp: {new Date(q.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {queries.length === 0 && !loading && (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <AlertCircle size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/20 font-black uppercase tracking-[0.2em]">No tactical queries logged.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
