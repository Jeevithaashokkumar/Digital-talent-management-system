'use client';

import React from 'react';
import { 
  Users, 
  Layers, 
  BarChart, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Network, 
  Cpu, 
  Database, 
  PieChart as PieChartIcon, 
  ArrowUpRight,
  UserPlus,
  LayoutGrid,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

export default function ResourceAllocation() {
  const departments = [
    { name: 'Engineering Matrix', allocation: 45, status: 'High Load', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Marketing Hive', allocation: 25, status: 'Steady', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { name: 'Global Operations', allocation: 20, status: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Neural Research', allocation: 10, status: 'Concept', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const teamCapacity = [
    { user: 'PREETHI', load: 82, tasks: 12, status: 'Warning' },
    { user: 'SYSTEM', load: 15, tasks: 42, status: 'Optimal' },
    { user: 'ADMIN ALPHA', load: 45, tasks: 8, status: 'Steady' },
    { user: 'OPERATOR X', load: 68, tasks: 15, status: 'Active' },
  ];

  const optimizationMetrics = [
    { metric: 'Avg Task Velocity', value: '1.2h', trend: '-15%', icon: <Zap />, color: 'text-amber-400' },
    { metric: 'Matrix Utilization', value: '88%', trend: '+4%', icon: <PieChartIcon />, color: 'text-indigo-400' },
    { metric: 'Redundancy Factor', value: '1.4x', trend: 'Stable', icon: <Layers />, color: 'text-emerald-400' },
  ];

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
               <Layers size={36} className="text-amber-400" /> Resource Allocation
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 mb-1">Human Capital Deployment & Workload Optimization Matrix</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 border border-white/5 rounded-xl text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <UserPlus size={16} className="text-amber-400"/> Re-balance Load
            </button>
            <button className="px-8 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2">
               <Database size={16}/> Matrix Optimization
            </button>
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {optimizationMetrics.map((om, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden transition-all hover:bg-white/[0.03] group">
            <div className="flex justify-between items-center mb-6">
               <div className={`p-4 bg-white/5 rounded-2xl ${om.color} shadow-xl group-hover:scale-110 transition-transform`}>
                  {om.icon}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-emerald-400 flex items-center gap-1`}>
                  {om.trend} <ArrowUpRight size={14} />
               </span>
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 italic">{om.metric}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{om.value}</h3>
          </div>
        ))}
      </div>

      {/* Capacity & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         {/* Team Capacity Table */}
         <div className="lg:col-span-8 flex flex-col bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} /> Matrix Operative Workload
               </h4>
               <button className="text-white/20 hover:text-white transition-all"><MoreHorizontal /></button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Operative</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Directive Load</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Active Assets</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {teamCapacity.map((cap, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="p-6 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 uppercase text-[10px] font-black">
                                 {cap.user.charAt(0)}
                              </div>
                              <span className="text-sm font-black text-white tracking-tight leading-none uppercase">{cap.user}</span>
                           </td>
                           <td className="p-6 w-1/3">
                              <div className="space-y-2">
                                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${cap.load > 75 ? 'bg-rose-500' : 'bg-emerald-500'} shadow-lg transition-all duration-1000 origin-left`} 
                                      style={{ width: `${cap.load}%` }}
                                    ></div>
                                 </div>
                                 <p className="text-[9px] font-black text-white/30 tracking-widest uppercase">{cap.load}% Total Capacity</p>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className="text-xs font-black text-white uppercase">{cap.tasks} Directives</span>
                           </td>
                           <td className="p-6 text-right">
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5 bg-white/5 ${cap.status === 'Warning' ? 'text-rose-400' : cap.status === 'Optimal' ? 'text-emerald-400' : 'text-white/40'}`}>
                                 {cap.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Department Breakdown */}
         <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Departmental Allocation</h4>
            <div className="grid grid-cols-1 gap-4">
               {departments.map((dept, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-white/20 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 ${dept.bg} rounded-xl ${dept.color} shadow-lg shadow-black/20`}>
                           <LayoutGrid size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none mb-1">{dept.name}</p>
                           <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{dept.status}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <h4 className="text-xl font-black text-white tracking-tighter">{dept.allocation}%</h4>
                     </div>
                  </div>
               ))}
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-rose-600 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-amber-500/20">
               <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 relative z-10 italic">Optimization Engine</p>
               <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none relative z-10 italic">Workload Balancer Active</h4>
               <p className="text-[10px] font-bold text-white/40 mt-3 relative z-10">Matrix currently optimizing 42 task chains across 12 sectors.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
