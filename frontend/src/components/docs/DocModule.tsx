'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Trash2, Clock, User, Search, BookOpen } from 'lucide-react';
import api from '@/services/api';
import DocEditorV2 from './DocEditor';

interface DocListViewProps {
  onDocSelect?: (doc: any) => void;
}

export default function DocModule() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/docs');
      setDocs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/docs', { title: newTitle, content: '' });
      setDocs(prev => [res.data, ...prev]);
      setSelectedDoc(res.data);
      setCreating(false);
      setNewTitle('');
      (window as any).addToast?.('Document created!', 'success');
    } catch (e) {
      (window as any).addToast?.('Failed to create document', 'error');
    }
  };

  const handleSave = async (id: string, content: string, title: string) => {
    try {
      const res = await api.put(`/docs/${id}`, { content, title });
      setDocs(prev => prev.map(d => d.id === id ? { ...d, ...res.data } : d));
      if (selectedDoc?.id === id) setSelectedDoc((prev: any) => ({ ...prev, ...res.data }));
    } catch (e) {
      (window as any).addToast?.('Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/docs/${id}`);
      setDocs(prev => prev.filter(d => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
      (window as any).addToast?.('Document deleted', 'error');
    } catch {
      (window as any).addToast?.('Failed to delete', 'error');
    }
  };

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  // Show editor if a doc is selected
  if (selectedDoc) {
    return (
      <DocEditorV2
        doc={selectedDoc}
        onSave={handleSave}
        onBack={() => { setSelectedDoc(null); fetchDocs(); }}
      />
    );
  }

  // Doc List View
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Documents</h2>
            <p className="text-white/40 text-sm font-medium mt-1">{docs.length} documents in your workspace</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={18} /> New Document
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 text-sm"
          />
        </div>
      </div>

      {/* New Doc Quick Create */}
      {creating && (
        <div className="px-8 mb-4 shrink-0">
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3">
            <FileText size={20} className="text-indigo-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Document title..."
              className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30 font-medium"
            />
            <button onClick={handleCreate} className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-400 transition-all">Create</button>
            <button onClick={() => setCreating(false)} className="text-white/40 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Doc Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-24 text-white/20">
            <BookOpen size={56} className="mb-4" />
            <p className="text-xl font-black mb-2">No documents yet</p>
            <p className="text-sm">Click "New Document" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => {
              const plainText = doc.content?.replace(/<[^>]*>/g, '').substring(0, 120) || '';
              const updatedDate = doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                      <FileText size={20} className="text-indigo-400" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="text-white/0 group-hover:text-white/30 hover:!text-rose-400 transition-all p-1.5 rounded-lg hover:bg-white/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="text-white font-black text-base mb-2 leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {doc.title}
                  </h3>

                  {plainText && (
                    <p className="text-white/35 text-xs leading-relaxed mb-4 line-clamp-3">
                      {plainText || 'Empty document...'}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-white/25 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span>{updatedDate || 'Just now'}</span>
                    </div>
                    <span className="text-indigo-400/50 text-[10px] font-bold uppercase tracking-widest">
                      v{doc.version || 1}
                    </span>
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
