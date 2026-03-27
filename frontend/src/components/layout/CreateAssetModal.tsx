'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Flag, Hash, User, FileText, Folder as FolderIcon, Laptop, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: 'Task' | 'Doc' | 'Folder' | 'Whiteboard';
}

export default function CreateAssetModal({ isOpen, onClose, onSubmit, type }: CreateAssetModalProps) {
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    startDate: '',
    tags: '',
    content: '',
    color: '#6366f1'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        startDate: '',
        tags: '',
        content: '',
        color: '#6366f1'
      });
    }
  }, [isOpen, type]);

  const handleClear = () => {
    onClose();
  };

  const getIcon = () => {
    switch(type) {
      case 'Task': return <Laptop size={28} />;
      case 'Doc': return <FileText size={28} />;
      case 'Folder': return <FolderIcon size={28} />;
      case 'Whiteboard': return <Monitor size={28} />;
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'Task': return 'Engage New Task';
      case 'Doc': return 'Initialize Neural Doc';
      case 'Folder': return 'Create Data Hive';
      case 'Whiteboard': return 'Launch Visual Board';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClear}
            className="absolute inset-0 bg-[#0f111a]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateY: 10, y: 30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-2xl bg-[#1e202e] border border-white/10 rounded-[3rem] shadow-3xl overflow-hidden p-10 flex flex-col gap-8"
          >
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white flex items-center gap-4">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-2xl shadow-xl">
                  {getIcon()}
                </div>
                {getTitle()}
              </h2>
              <button onClick={handleClear} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-all border border-white/5">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">{type} Title</label>
                <input 
                  autoFocus
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder={`${type} identifier...`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/10 shadow-inner font-bold"
                />
              </div>

              {type === 'Doc' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Content Stream</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Initialize neural content..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all min-h-[150px] font-medium"
                  />
                </div>
              )}

              {type === 'Task' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Flag size={14} /> Priority Matrix
                    </label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="low" className="bg-[#1e202e]">Low Protocol</option>
                      <option value="medium" className="bg-[#1e202e]">Standard</option>
                      <option value="high" className="bg-[#1e202e]">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={14} /> Start Date
                    </label>
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all font-bold [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={14} /> Neural Deadline
                    </label>
                    <input 
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all font-bold [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Hash size={14} /> Classification Tags
                </label>
                <input 
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="tag1, tag2..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 mt-auto">
              <button 
                onClick={handleClear}
                className="flex-1 px-8 py-5 rounded-3xl bg-white/5 text-white font-black hover:bg-white/10 transition-all border border-white/5 text-lg"
              >
                Abort
              </button>
              <button 
                onClick={() => { onSubmit(formData); handleClear(); }}
                disabled={!formData.title}
                className="flex-[2] px-8 py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-600/40 text-lg uppercase tracking-widest"
              >
                Launch {type}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
