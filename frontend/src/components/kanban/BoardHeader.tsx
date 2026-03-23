'use client';

import React, { useState } from 'react';
import { Star, Users, Share, Filter, MoreHorizontal, Zap, ShieldAlert, Check, X, Shield, Lock, Globe, Cpu, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoardHeader({ title }: { title: string }) {
  const [isStarred, setIsStarred] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const toggleDropdown = (name: string) => setActiveDropdown(activeDropdown === name ? null : name);

  const handleShare = () => {
     try {
        navigator.clipboard.writeText(window.location.href);
        (window as any).addToast?.(`Permeability Link Copied to Clipboard!`, 'success');
     } catch (e) {
        (window as any).addToast?.(`Could not copy link.`, 'error');
     }
  };

  return (
    <div className="h-20 flex items-center justify-between px-8 text-white bg-black/10 backdrop-blur-md border-b border-white/5 shadow-inner relative z-40">
      
      {/* Left Group */}
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-black tracking-tightest hover:bg-white/10 px-4 py-2 rounded-2xl cursor-pointer transition-all active:scale-95 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-indigo-300">
          {title || "Operational Matrix"}
        </h1>
        
        {/* Star Button */}
        <button 
          onClick={() => {
             setIsStarred(!isStarred);
             (window as any).addToast?.(isStarred ? `Matrix Demoted` : `Matrix Marked as Priority`, isStarred ? 'info' : 'success');
          }}
          className={`p-3 rounded-xl transition-all hover:rotate-12 ${isStarred ? 'bg-amber-500/10' : 'hover:bg-white/10'}`}
        >
          <Star size={24} className={isStarred ? "text-amber-400 fill-amber-400" : "text-amber-400/50"} />
        </button>

        <div className="h-8 w-[2px] bg-white/10 mx-2 shadow-glow"></div>

        {/* Project Management Dropdown */}
        <div className="relative">
           <button 
             onClick={() => toggleDropdown('pm')}
             className={`flex items-center gap-3 px-4 py-2 rounded-xl text-lg font-black transition-all ${activeDropdown === 'pm' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/10'}`}
           >
             <Users size={24} className="text-indigo-400" /> Project Management
           </button>
           <AnimatePresence>
             {activeDropdown === 'pm' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 left-0 w-64 bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-2">
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mb-2">View Architectures</h4>
                   <button onClick={() => toggleDropdown('pm')} className="flex items-center justify-between text-sm font-bold p-3 hover:bg-white/10 rounded-xl text-left"><span className="flex items-center gap-2"><BarChart size={16} /> Agile Sprint</span> <Check size={14} className="text-emerald-500" /></button>
                   <button onClick={() => toggleDropdown('pm')} className="flex items-center gap-2 text-sm font-bold p-3 hover:bg-white/10 rounded-xl text-left text-white/50"><Globe size={16} /> Waterfall Chart</button>
                   <button onClick={() => toggleDropdown('pm')} className="flex items-center gap-2 text-sm font-bold p-3 hover:bg-white/10 rounded-xl text-left text-white/50"><Cpu size={16} /> Gantt Network</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Workspace Priority Dropdown */}
        <div className="relative">
           <button 
              onClick={() => toggleDropdown('priority')}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-lg font-black transition-all shadow-lg border ${activeDropdown === 'priority' ? 'bg-rose-500/20 border-rose-500/50' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
           >
             <ShieldAlert size={22} className={`text-rose-400 ${activeDropdown === 'priority' ? '' : 'animate-pulse'}`} /> Workspace Priority
           </button>
           <AnimatePresence>
             {activeDropdown === 'priority' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 left-0 w-56 bg-[#12141c] border border-rose-500/30 rounded-2xl shadow-2xl shadow-rose-500/10 p-4 flex flex-col gap-2">
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-rose-400 mb-2">Threat Vector</h4>
                   <button onClick={() => toggleDropdown('priority')} className="text-sm font-bold p-3 hover:bg-rose-500/20 text-rose-400 rounded-xl text-left border border-transparent hover:border-rose-500/50 transition-all">Defcon 1 (Critical)</button>
                   <button onClick={() => toggleDropdown('priority')} className="text-sm font-bold p-3 hover:bg-amber-500/20 text-amber-500 rounded-xl text-left border border-transparent hover:border-amber-500/50 flex justify-between">Defcon 3 (Elevated) <Check size={14}/></button>
                   <button onClick={() => toggleDropdown('priority')} className="text-sm font-bold p-3 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-left border border-transparent hover:border-emerald-500/50">Defcon 5 (Normal)</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-6">
        
        {/* OP Avatars */}
        <div className="flex -space-x-3 group relative cursor-pointer" onClick={() => toggleDropdown('ops')}>
          {['JD', 'AX', 'MR'].map((initials, i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-xl border-2 border-[#1e1e2e] bg-gradient-to-br ${i === 0 ? 'from-blue-500 to-indigo-500' : i === 1 ? 'from-pink-500 to-rose-500' : 'from-emerald-400 to-teal-500'} flex items-center justify-center text-xs font-black shadow-lg group-hover:translate-x-1 transition-transform`}
            >
              {initials}
            </div>
          ))}
          <div className="w-10 h-10 rounded-xl border-2 border-[#1e1e2e] bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-xs font-black transition-all shadow-lg group-hover:translate-x-2">
            +12
          </div>
          <AnimatePresence>
             {activeDropdown === 'ops' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 right-0 w-64 bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col cursor-default" onClick={e => e.stopPropagation()}>
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Active Operatives (15)</h4>
                      <X size={14} className="text-white/40 hover:text-white cursor-pointer" onClick={() => setActiveDropdown(null)} />
                   </div>
                   <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                       {['Jeevi', 'Admin Alpha', 'User Matrix', 'Sector Cmdr'].map((n, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-xl">
                              <span className="font-bold">{n}</span>
                              <span className="text-[10px] text-emerald-500 font-black uppercase">Online</span>
                           </div>
                       ))}
                   </div>
                   <button className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">Manage Roster</button>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-lg font-black flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
        >
           <Share size={20} /> Share
        </button>
        
        <div className="h-8 w-[2px] bg-white/10 mx-1"></div>
        
        {/* Automation Dropdown */}
        <div className="relative">
           <button 
             onClick={() => toggleDropdown('automation')}
             className={`flex items-center gap-3 px-4 py-2 rounded-xl text-lg font-black transition-all ${activeDropdown === 'automation' ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-white/10'}`}
           >
             <Zap size={22} className={`text-amber-400 ${activeDropdown === 'automation' ? 'animate-bounce' : ''}`} /> <span className="hidden xl:block">Automation</span>
           </button>
           <AnimatePresence>
             {activeDropdown === 'automation' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 right-0 w-72 bg-[#12141c] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 p-4">
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-400 mb-4">Neural Triggers</h4>
                   <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-200">Auto-Assign Overdue</span>
                      <div className="w-8 h-4 bg-amber-500 rounded-full flex items-center justify-end px-0.5"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-3 rounded-xl mb-4 flex justify-between items-center">
                      <span className="text-xs font-bold text-white/40">Sync to Global Ops</span>
                      <div className="w-8 h-4 bg-white/10 rounded-full flex items-center justify-start px-0.5"><div className="w-3 h-3 bg-white/40 rounded-full"></div></div>
                   </div>
                   <button onClick={() => toggleDropdown('automation')} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest">New Protocol</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
           <button 
             onClick={() => toggleDropdown('filter')}
             className={`flex items-center gap-3 px-4 py-2 rounded-xl text-lg font-black transition-all ${activeDropdown === 'filter' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-white/10'}`}
           >
             <Filter size={22} className="text-emerald-400" /> <span className="hidden xl:block">Filter</span>
           </button>
           <AnimatePresence>
             {activeDropdown === 'filter' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 right-0 w-56 bg-[#12141c] border border-emerald-500/30 rounded-2xl shadow-2xl p-4">
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-2">Active Lenses</h4>
                   <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-emerald-500" /> <span className="text-sm font-bold">Assigned to Me</span>
                   </label>
                   <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                      <input type="checkbox" className="accent-emerald-500" /> <span className="text-sm font-bold">Due This Week</span>
                   </label>
                   <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                      <input type="checkbox" className="accent-emerald-500" /> <span className="text-sm font-bold">Critical Priority</span>
                   </label>
                   <button onClick={() => toggleDropdown('filter')} className="mt-3 w-full py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest">Apply Sync</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* More Settings */}
        <div className="relative">
           <button onClick={() => toggleDropdown('more')} className={`p-3 rounded-xl transition-all ${activeDropdown === 'more' ? 'bg-white/20 rotate-90 text-indigo-400' : 'hover:bg-white/10 hover:rotate-90'}`}>
             <MoreHorizontal size={24} />
           </button>
           <AnimatePresence>
             {activeDropdown === 'more' && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-14 right-0 w-48 bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                   <button onClick={() => toggleDropdown('more')} className="w-full text-left p-3 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center gap-3"><Lock size={16}/> Permissions</button>
                   <button onClick={() => toggleDropdown('more')} className="w-full text-left p-3 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center gap-3"><Shield size={16}/> Audit Log</button>
                   <hr className="border-white/10 my-1"/>
                   <button onClick={() => toggleDropdown('more')} className="w-full text-left p-3 hover:bg-rose-500/20 text-rose-500 rounded-xl text-sm font-bold flex items-center gap-3">Purge Board</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
