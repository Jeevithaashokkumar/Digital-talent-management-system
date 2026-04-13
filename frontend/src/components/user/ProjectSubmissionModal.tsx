'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Target, Shield, Zap, Send, FileText } from 'lucide-react';
import api from '@/services/api';

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectSubmissionModal({ isOpen, onClose, onSuccess }: ProjectSubmissionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/projects', formData);
      onSuccess();
      setFormData({ title: '', description: '', githubLink: '' });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Project deployment failed.');
    } finally {
      setLoading(false);
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
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-[#0c0d15] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Strategic Initiative</span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Submit New Project</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-widest">
                  <Shield size={14} /> {error}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 block px-2">Mission Title</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Zap size={16} />
                  </div>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Enter project designation..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 block px-2">Briefing / Description</label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-white/20">
                    <FileText size={16} />
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Provide a detailed overview of the initiative..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all font-bold resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 block px-2">GitHub Repository URL</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Github size={16} />
                  </div>
                  <input
                    required
                    type="url"
                    value={formData.githubLink}
                    onChange={e => setFormData(p => ({ ...p, githubLink: e.target.value }))}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 text-white placeholder:text-white/10 outline-none focus:border-indigo-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.4em] py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-4 group"
              >
                {loading ? 'Processing...' : (
                  <>Submit Signal <Send size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
