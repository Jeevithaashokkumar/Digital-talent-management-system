'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Zap } from 'lucide-react';
import { useState } from 'react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export default function CreateListModal({ isOpen, onClose, onSubmit }: CreateListModalProps) {
  const [title, setTitle] = useState('');

  const handleClear = () => {
    setTitle('');
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
            initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#1e202e] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                  <Plus size={24} />
                </div>
                Initialize List
              </h2>
              <button onClick={handleClear} className="text-white/30 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">List Designation</label>
                <input 
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Active Execution"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/10 shadow-inner"
                />
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-4">
                <Zap size={20} className="text-amber-400" />
                <p className="text-sm text-indigo-200 font-medium">This list will be synchronized across all neural nodes in the current Space.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleClear}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all border border-white/5"
                >
                  Abort
                </button>
                <button 
                  onClick={() => { onSubmit(title); handleClear(); }}
                  disabled={!title}
                  className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-500 text-white font-black hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/30"
                >
                  Deploy List
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
