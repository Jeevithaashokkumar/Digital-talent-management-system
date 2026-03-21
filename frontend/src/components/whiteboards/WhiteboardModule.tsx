'use client';

import { useState, useEffect } from 'react';
import { Plus, Monitor, Trash2, ArrowLeft, Save, Users, Zap, ExternalLink, Calendar, Search } from 'lucide-react';
import api from '@/services/api';
import WhiteboardCanvas from './WhiteboardCanvas';

export default function WhiteboardModule() {
  const [whiteboards, setWhiteboards] = useState<any[]>([]);
  const [activeWhiteboard, setActiveWhiteboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [search, setSearch] = useState('');

  const fetchWhiteboards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/whiteboards');
      setWhiteboards(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhiteboards();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/whiteboards', { title: newTitle.trim() });
      setWhiteboards([...whiteboards, res.data]);
      setActiveWhiteboard(res.data);
      setShowCreateModal(false);
      setNewTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this whiteboard?')) return;
    try {
      await api.delete(`/whiteboards/${id}`);
      setWhiteboards(whiteboards.filter(w => w.id !== id));
      if (activeWhiteboard?.id === id) setActiveWhiteboard(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (activeWhiteboard) {
    return (
      <div className="h-full flex flex-col bg-[#0f111a]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#161926]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setActiveWhiteboard(null); fetchWhiteboards(); }}
              className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-white font-black tracking-tight leading-none mb-1">{activeWhiteboard.title}</h2>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} className="fill-indigo-400" /> Live Collaboration Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1,2].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#161926] bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                    U{i}
                  </div>
                ))}
             </div>
             <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                <Save size={16} /> Save
             </button>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden">
          <WhiteboardCanvas whiteboard={activeWhiteboard} />
        </div>
      </div>
    );
  }

  const filtered = whiteboards.filter(w => w.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-[#0a0b10] p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Whiteboard Nexus</h1>
            <p className="text-white/40 font-medium">Real-time visual strategy and collaborative architecture.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95"
          >
            <Plus size={24} strokeWidth={3} /> New Canvas
          </button>
        </header>

        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your strategic nexus..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white text-lg outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
             <Monitor size={80} strokeWidth={1} className="mb-6 opacity-40" />
             <p className="text-2xl font-black mb-2 tracking-tight">No whiteboards detected.</p>
             <p className="text-sm">Initiate a new collaborative session to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(w => (
              <div 
                key={w.id}
                onClick={() => setActiveWhiteboard(w)}
                className="group relative bg-[#12141c] border border-white/5 hover:border-indigo-500/30 rounded-[2.5rem] p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Monitor size={28} />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(w.id, e)}
                    className="p-2 hover:bg-rose-500/20 rounded-xl text-white/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-black text-white mb-2 truncate group-hover:text-indigo-400 transition-colors">{w.title}</h3>
                <p className="text-white/30 text-sm font-medium mb-6 leading-relaxed">Collaborative strategy node.</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                   <div className="flex items-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(w.createdAt).toLocaleDateString()}
                   </div>
                   <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border border-[#12141c]" />
                      <div className="w-6 h-6 rounded-full bg-amber-500 border border-[#12141c]" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#12141c] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">Initialize New Canvas</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3 pl-1">Whiteboard designation</label>
                <input 
                  autoFocus
                  placeholder="Strategic Roadmap 2026..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                >
                  Create Nexus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
