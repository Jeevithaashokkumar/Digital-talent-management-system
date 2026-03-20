'use client';

import { Star, Users, Share, Filter, MoreHorizontal, Zap, ShieldAlert } from 'lucide-react';

export default function BoardHeader({ title }: { title: string }) {
  return (
    <div className="h-20 flex items-center justify-between px-8 text-white bg-black/10 backdrop-blur-md border-b border-white/5 shadow-inner">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-black tracking-tightest hover:bg-white/10 px-4 py-2 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-indigo-300">
          {title || "Operational Matrix Alpha"}
        </h1>
        <button 
          onClick={() => (window as any).addToast?.(`Matrix Marked as Priority`, 'success')}
          className="hover:bg-white/10 p-3 rounded-xl transition-all hover:rotate-12"
        >
          <Star size={24} className="text-amber-400" />
        </button>
        <div className="h-8 w-[2px] bg-white/10 mx-2 shadow-glow"></div>
        <button 
          onClick={() => (window as any).addToast?.(`Switching Perspective...`, 'info')}
          className="flex items-center gap-3 hover:bg-white/10 px-4 py-2 rounded-xl text-lg font-black transition-all hover:translate-x-1"
        >
          <Users size={24} className="text-indigo-400" /> Project Management
        </button>
        <button 
           onClick={() => (window as any).addToast?.(`Security Protocol Alpha Enabled`, 'error')}
           className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-lg font-black transition-all shadow-lg border border-white/10"
        >
          <ShieldAlert size={22} className="text-rose-400 animate-pulse" /> Workspace Priority
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex -space-x-3">
          {[1,2,3].map(i => (
            <div 
              key={i} 
              onClick={() => (window as any).addToast?.(`Viewing Operative Profile`, 'info')}
              className={`w-10 h-10 rounded-xl border-2 border-[#1e1e2e] bg-gradient-to-br ${i === 1 ? 'from-blue-500 to-indigo-500' : i === 2 ? 'from-pink-500 to-rose-500' : 'from-emerald-400 to-teal-500'} flex items-center justify-center text-xs font-black shadow-lg hover:translate-y-[-4px] transition-transform cursor-pointer`}
            >
              OP
            </div>
          ))}
          <div className="w-10 h-10 rounded-xl border-2 border-[#1e1e2e] bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-black cursor-pointer transition-all shadow-lg">
            +12
          </div>
        </div>
        
        <button 
          onClick={() => (window as any).addToast?.(`Permeability Link Copied`, 'success')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-lg font-black flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95"
        >
           <Share size={20} /> Share
        </button>
        
        <div className="h-8 w-[2px] bg-white/10 mx-1"></div>
        
        <button 
          onClick={() => (window as any).addToast?.(`Engaging Automated Workflows`, 'info')}
          className="flex items-center gap-3 hover:bg-white/10 px-4 py-2 rounded-xl text-lg font-black transition-all group"
        >
          <Zap size={22} className="text-amber-400 group-hover:scale-125 transition-transform" /> <span className="hidden xl:block">Automation</span>
        </button>
        <button 
          onClick={() => (window as any).addToast?.(`Filtering Matrix Data`, 'info')}
          className="flex items-center gap-3 hover:bg-white/10 px-4 py-2 rounded-xl text-lg font-black transition-all group"
        >
          <Filter size={22} className="text-emerald-400 group-hover:scale-125 transition-transform" /> <span className="hidden xl:block">Filter</span>
        </button>
        <button className="hover:bg-white/10 p-3 rounded-xl transition-all hover:rotate-90">
          <MoreHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}
