'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Flag, Hash, User } from 'lucide-react';
import { useState } from 'react';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  listId: string | null;
}

export default function CreateCardModal({ isOpen, onClose, onSubmit, listId }: CreateCardModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const handleClear = () => {
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
    onClose();
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
            className="relative w-full max-w-xl bg-[#1e202e] border border-white/10 rounded-[3rem] shadow-3xl overflow-hidden p-10 flex flex-col gap-8"
          >
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white flex items-center gap-4">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-2xl shadow-xl">
                  <Plus size={28} />
                </div>
                Engage New Task
              </h2>
              <button onClick={handleClear} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-all border border-white/5">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Mission Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Task name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/10 shadow-inner font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
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
                    <option value="medium" className="bg-[#1e202e]">Standard Operational</option>
                    <option value="high" className="bg-[#1e202e]">Critical Breach</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={14} /> Neural Deadline
                  </label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Hash size={14} /> Meta Tags
                  </label>
                  <input 
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="tag1, tag2..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={14} /> Assignee
                  </label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white/40 flex items-center gap-3 italic">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/20">JD</div>
                    Auto-Assigned to Master
                  </div>
                </div>
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
                className="flex-[2] px-8 py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-600/40 text-lg"
              >
                Launch Mission
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
