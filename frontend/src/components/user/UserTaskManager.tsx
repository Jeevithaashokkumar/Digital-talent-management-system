'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  ArrowRight, 
  Shield, 
  Calendar, 
  Info,
  ChevronRight,
  Zap,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserTaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const { on, emit } = useSocket();

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks/my');
      setTasks(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Personal Directive Sync Failed:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
    on('task-recalibrated', () => fetchMyTasks());
  }, [on]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      emit('task-update', { id, status: newStatus });
      fetchMyTasks();
      
      // Admin Link: Notify via Toast (System Logic)
      if ((window as any).addToast) {
        (window as any).addToast(`Directive updated to: ${newStatus}`, "success");
        if (newStatus === 'completed') {
          (window as any).addToast("Mission Finalized. Signal sent to Command.", "info");
        }
      }
    } catch (error) {
      if ((window as any).addToast) (window as any).addToast("Status Transition Failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
        <Zap className="animate-pulse" size={48} />
        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Syncing Personal Directives...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-4">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Tactical Inbox</h2>
            <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Active directives assigned to your neural profile.</p>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Status</p>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter leading-none flex items-center gap-2">
               <Shield size={12} className="text-emerald-500" /> Operational
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        <AnimatePresence mode='popLayout'>
        {tasks.map((task) => (
          <motion.div 
            layout
            key={task.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-8">
               <motion.div 
                 key={task.status}
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                 task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                 task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                 'bg-white/5 text-white/40 border-white/5'
               }`}>
                 {task.status}
               </motion.div>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">ID: {task.id.slice(0, 8)}</span>
                     <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                  <p className="text-sm font-bold text-white/40 leading-relaxed max-w-2xl">{task.description || 'Mission overview pending briefing. Contact admin for tactical details.'}</p>
                  
                  <div className="flex flex-wrap gap-6 pt-4">
                     <div className="flex items-center gap-3 text-white/60">
                        <Calendar size={16} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                           Expires: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Infinite'}
                        </span>
                     </div>
                     <div className="flex items-center gap-3 text-white/60">
                        <AlertCircle size={16} className={`${task.priority === 'high' ? 'text-rose-500' : 'text-blue-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                           Priority: {task.priority}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="w-full md:w-auto flex flex-col gap-3">
                  {task.status === 'todo' && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                      className="w-full md:w-48 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/20 group/btn"
                    >
                      Initialize <Play size={14} className="fill-white group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  )}
                  {task.status === 'in-progress' && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(task.id, 'completed')}
                      className="w-full md:w-48 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 group/btn"
                    >
                      Finalize <Check size={18} className="group-hover/btn:scale-125 transition-transform" />
                    </motion.button>
                  )}
                  {task.status === 'completed' && (
                    <div className="w-full md:w-48 py-5 bg-white/5 border border-white/5 rounded-2xl text-white/20 font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                      Completed <CheckCircle2 size={16} />
                    </div>
                  )}
                  <button className="w-full md:w-48 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/60 font-black text-[10px] uppercase tracking-widest transition-all">
                     View Briefing
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] p-10 bg-white/[0.02]">
             <Shield className="text-white/10 mx-auto mb-6 animate-pulse" size={48} />
             <h4 className="text-xl font-black text-white/20 uppercase tracking-widest mb-4">Tactical Matrix Clear</h4>
             <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">No directives currently assigned to your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
