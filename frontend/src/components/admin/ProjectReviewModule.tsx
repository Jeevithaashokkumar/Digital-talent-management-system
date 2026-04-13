'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  Search,
  Zap,
  Filter
} from 'lucide-react';
import api from '@/services/api';

export default function ProjectReviewModule() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, reviewed, rejected

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to sync projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/projects/${id}/status`, { status });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      if ((window as any).addToast) (window as any).addToast(`Project status updated to ${status}`, 'success');
    } catch (err) {
      if ((window as any).addToast) (window as any).addToast('Status update failed', 'error');
    }
  };

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-white/10 gap-4">
        <Zap className="animate-pulse" size={48} />
        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Syncing Project Database...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Administrative Authority</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Project Submissions</h2>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
           {['all', 'pending', 'reviewed', 'rejected'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-500"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${
                        project.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        project.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                         {project.status === 'reviewed' ? 'Validated' : project.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">
                        Node ID: {project.id.slice(0, 8)}
                      </span>
                   </div>
                   
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">{project.title}</h3>
                   <p className="text-white/40 text-sm font-medium leading-relaxed max-w-3xl">{project.description}</p>
                   
                   <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-white/20" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{project.user?.name}</span>
                      </div>
                      <a 
                        href={project.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 group/link"
                      >
                        <Github size={14} className="text-white/20 group-hover/link:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black text-white/60 group-hover/link:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                          Source Repository <ExternalLink size={10} />
                        </span>
                      </a>
                   </div>
                </div>

                <div className="flex lg:flex-col items-center justify-center gap-3 shrink-0">
                   {project.status !== 'reviewed' && (
                     <button
                       onClick={() => handleStatusUpdate(project.id, 'reviewed')}
                       className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                     >
                       Approve <CheckCircle2 size={16} />
                     </button>
                   )}
                   {project.status !== 'rejected' && (
                     <button
                       onClick={() => handleStatusUpdate(project.id, 'rejected')}
                       className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-rose-600/20 hover:text-rose-400 rounded-2xl text-white/40 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-rose-500/30"
                     >
                       Reject <XCircle size={16} />
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] p-10 bg-white/[0.02]">
             <Shield className="text-white/10 mx-auto mb-6 opacity-20" size={48} />
             <h4 className="text-xl font-black text-white/20 uppercase tracking-widest">No Projects Found</h4>
             <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">The submission queue is currently operational and empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
