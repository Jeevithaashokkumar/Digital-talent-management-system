'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Zap,
  Target
} from 'lucide-react';
import api from '@/services/api';
import ProjectSubmissionModal from './ProjectSubmissionModal';

export default function ProjectListModule() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUserProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to sync signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
        <Zap className="animate-pulse" size={48} />
        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Accessing Neural Signal Archive...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Personal Strategic Archive</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Signal Submissions</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 group"
        >
          Initialize Project <Plus size={16} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-500 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-indigo-500/10 transition-colors">
                      <Github size={20} className="text-white/40 group-hover:text-indigo-400" />
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                     project.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                     project.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                     'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                   }`}>
                     {project.status === 'reviewed' ? (
                       <span className="flex items-center gap-1">Validated <CheckCircle2 size={10} /></span>
                     ) : project.status === 'rejected' ? (
                       <span className="flex items-center gap-1">Rejected <XCircle size={10} /></span>
                     ) : (
                       <span className="flex items-center gap-1">Awaiting Review <Clock size={10} className="animate-pulse" /></span>
                     )}
                   </div>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">{project.title}</h3>
                <p className="text-white/40 text-[10px] font-medium leading-relaxed line-clamp-3 uppercase tracking-widest">{project.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">{new Date(project.createdAt).toLocaleDateString()}</span>
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                >
                  Source <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] p-10 bg-white/[0.02]">
             <Zap className="text-white/10 mx-auto mb-6 opacity-20" size={48} />
             <h4 className="text-xl font-black text-white/20 uppercase tracking-widest">No Strategic Signals Found</h4>
             <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em] mt-2">Initialize your first project to begin neural validation.</p>
          </div>
        )}
      </div>

      <ProjectSubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUserProjects}
      />
    </div>
  );
}
