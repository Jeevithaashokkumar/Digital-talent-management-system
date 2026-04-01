'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Globe, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Monitor,
  Rocket,
  Layers,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export default function ExecutiveOverlook() {
  const kpis = [
    { label: 'Projected Revenue', value: '$4.2M', trend: '+12.5%', icon: <DollarSign />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Talent Matrix', value: '1,284', trend: '+5.2%', icon: <Users />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'System Efficiency', value: '94.2%', trend: '+2.1%', icon: <Zap />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Client Satisfaction', value: '4.9/5', trend: 'Stable', icon: <Target />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const velocityData = [
    { name: 'Engineering Matrix', velocity: 85, health: 'Optimal' },
    { name: 'Marketing Hive', velocity: 62, health: 'Steady' },
    { name: 'Global Operations', velocity: 94, health: 'High' },
    { name: 'Neural Research', velocity: 45, health: 'Staged' },
  ];

  const riskFactors = [
    { factor: 'Database Shard Sync', level: 'Low', status: 'Secure' },
    { factor: 'APC Node Latency', level: 'Medium', status: 'Monitoring' },
    { factor: 'Talent Acquisition Gap', level: 'High', status: 'Priority' },
  ];

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
               <Monitor size={36} className="text-indigo-400" /> Executive Overlook
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 mb-1">Strategic Command Dashboard & KPI Velocity Interface</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 border border-white/5 rounded-xl text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <BarChart3 size={16} className="text-indigo-400"/> Download Report
            </button>
            <button className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2">
               <Rocket size={16}/> Scale Infrastructure
            </button>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="group bg-[var(--card-bg)] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden transition-all hover:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-4">
               <div className={`p-3 ${kpi.bg} rounded-xl ${kpi.color}`}>
                  {kpi.icon}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 text-emerald-400 flex items-center gap-1`}>
                  {kpi.trend} <ArrowUpRight size={12} />
               </span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Analytics Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         {/* Velocity Matrix */}
         <div className="lg:col-span-8 flex flex-col bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] overflow-hidden p-8 space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} /> Matrix Velocity Matrix
               </h4>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Quarterly Performance Analysis</span>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-6">
               {velocityData.map((data, i) => (
                  <div key={i} className="space-y-3 p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white group-hover:text-indigo-400 transition-colors">{data.name}</span>
                        <span className={`${data.health === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>{data.health} - {data.velocity}%</span>
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${data.health === 'Optimal' ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-1000 group-hover:scale-x-105 origin-left`} 
                          style={{ width: `${data.velocity}%` }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Risk & Health Metrics */}
         <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] p-8 flex-1">
               <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={16} /> Strategic Risk Vectors
               </h4>
               <div className="space-y-4">
                  {riskFactors.map((risk, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all group">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${risk.level === 'High' ? 'bg-rose-500 animate-pulse' : risk.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                           <span className="text-[11px] font-black text-white/60 uppercase tracking-tight group-hover:text-white transition-colors">{risk.factor}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 ${risk.level === 'High' ? 'text-rose-400' : 'text-white/40'}`}>
                           {risk.status}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-500/20 group">
               <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 relative z-10">Matrix Global Reach</p>
               <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none relative z-10 mb-6 italic">Scaling Target 2026: 12.4M</h4>
               <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                     <Globe size={24} className="text-white" />
                  </div>
                  <div>
                     <p className="text-[20px] font-black text-white tracking-tighter">124 Regions</p>
                     <p className="text-[10px] font-bold text-white/60 uppercase">Operational Nodes</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
