'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  Target,
  Zap,
  Layout,
  ArrowUpRight,
  ClipboardList,
  Loader2,
  Shield,
  FileText,
  Share
} from 'lucide-react';

export default function UserOverview({ stats }: { stats: any }) {
  const loading = !stats || Object.keys(stats).length === 0;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-black uppercase tracking-[0.4em] text-[10px]">Syncing Tactical Data...</p>
      </div>
    );
  }
  const cards = [
    { title: 'Total Assigned', value: stats.totalTasks || 0, icon: <ClipboardList className="text-blue-400" />, color: 'from-blue-500/20 to-blue-600/5' },
    { title: 'In Progress', value: stats.inProgressTasks || 0, icon: <Activity className="text-amber-400" />, color: 'from-amber-500/20 to-amber-600/5' },
    { title: 'Completed', value: stats.completedTasks || 0, icon: <CheckCircle2 className="text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-600/5' },
    { title: 'My Missions', value: stats.activeMissions || 0, icon: <Target className="text-fuchsia-400" />, color: 'from-fuchsia-500/20 to-fuchsia-600/5' },
  ];

  return (
    <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto custom-scrollbar">
       <div className="flex justify-between items-center mb-4">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Operational Summary</h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Mission parameters and directive status.</p>
         </div>
         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
            <Zap className="text-amber-500 animate-pulse" size={20} />
            <div>
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Efficiency Rating</p>
               <p className="text-sm font-black text-white">{stats.completionRate || 0}%</p>
            </div>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4">
              {card.icon}
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{card.value}</h3>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
               {React.cloneElement(card.icon as React.ReactElement, { size: 100 } as any)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Performance Bar */}
         <div className="bg-[var(--sidebar-bg)] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl flex flex-col justify-between h-[350px]">
            <div>
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">Personal Velocity</h4>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Completion trajectory for current directives.</p>
            </div>
            
            <div className="flex-1 flex items-end gap-4 mt-8 px-4">
               {stats.trend?.map((d: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-1000 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                      style={{ height: `${(d.count / (Math.max(...stats.trend.map((x:any)=>x.count)) || 1)) * 100}%`, minHeight: '4px' }}
                    />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">{d.day}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Mission Pulse */}
         <div className="bg-[var(--sidebar-bg)] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl flex flex-col justify-between">
            <div>
               <h4 className="text-xl font-black text-white uppercase tracking-tighter">Strategic Impact</h4>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Contribution to global mission objectives.</p>
            </div>

            <div className="space-y-6 my-10">
               <div className="flex justify-between items-end">
                  <div>
                     <h2 className="text-5xl font-black text-white tracking-tighter leading-none">{stats.completionRate || 0}%</h2>
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ArrowUpRight size={14} /> Peak Performance
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Rank</p>
                     <p className="text-xs font-black text-blue-400 uppercase">Lead User</p>
                  </div>
               </div>
               
               <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${stats.completionRate || 0}%` }}
                  />
               </div>
            </div>

            <button className="w-full py-5 bg-white/5 hover:bg-indigo-500/20 border border-white/5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
               View Performance Logs <Layout size={16} />
            </button>
         </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         {/* Priority Directives (Upcoming Deadlines) */}
         <div className="bg-[var(--sidebar-bg)] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
               <Shield className="text-rose-500" size={20} /> Priority Directives
            </h4>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
               {stats.deadlines?.map((task: any, i: number) => (
                 <div key={i} className="group p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-all">
                    <div>
                       <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{task.title}</p>
                       <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                       </p>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white">
                       <ArrowUpRight size={18} />
                    </button>
                 </div>
               ))}
               {(!stats.deadlines || stats.deadlines.length === 0) && (
                 <div className="text-center py-10 opacity-20 italic">No urgent deadlines detected. Matrix stable.</div>
               )}
            </div>
         </div>

         {/* Neural Activity Feed (Recent personal activity) */}
         <div className="bg-[var(--sidebar-bg)] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
               <Activity className="text-blue-400" size={20} /> Neural Activity Feed
            </h4>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
               {stats.activity?.map((act: any, i: number) => (
                 <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div className="flex-1">
                       <p className="text-xs font-black text-white/80 uppercase tracking-tight">{act.title}</p>
                       <p className="text-[10px] text-white/30 uppercase font-bold mt-1">
                          Status: <span className="text-indigo-400">{act.status}</span> • {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                 </div>
               ))}
               {(!stats.activity || stats.activity.length === 0) && (
                 <div className="text-center py-10 opacity-20 italic">Awaiting tactical engagement logs.</div>
               )}
            </div>
         </div>
      </div>

      {/* User Actions */}
      <div className="pt-8 mb-8">
         <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 italic">Tactical User Actions</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Submit Log', icon: <FileText size={14}/>, color: 'hover:bg-indigo-500/20 hover:text-indigo-400' },
              { label: 'Request Sync', icon: <Zap size={14}/>, color: 'hover:bg-amber-500/20 hover:text-amber-400' },
              { label: 'Share Signal', icon: <Share size={14}/>, color: 'hover:bg-emerald-500/20 hover:text-emerald-400' },
              { label: 'Emergency Exit', icon: <Clock size={14}/>, color: 'hover:bg-rose-500/20 hover:text-rose-400' },
            ].map((btn, i) => (
              <button key={i} className={`flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/5 rounded-3xl text-white/40 font-black text-[10px] uppercase tracking-widest transition-all ${btn.color}`}>
                 {btn.icon} {btn.label}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
}
