'use client';

import React from 'react';
import { 
  Database, 
  Globe, 
  Activity, 
  Shield, 
  Server, 
  Cpu, 
  Network, 
  Terminal, 
  Zap, 
  ChevronRight, 
  MoreHorizontal,
  ArrowUpRight,
  Monitor,
  HardDrive,
  Cloud,
  Layers,
  Info
} from 'lucide-react';

export default function GlobalOperations() {
  const regions = [
    { name: 'North America Cluster', status: 'Optimal', latency: '12ms', health: 98, load: 45, color: 'text-emerald-400' },
    { name: 'European Nexus', status: 'Optimal', latency: '18ms', health: 99, load: 32, color: 'text-emerald-400' },
    { name: 'Asia-Pacific Node', status: 'Warning', latency: '45ms', health: 85, load: 78, color: 'text-amber-400' },
  ];

  const systemStats = [
    { label: 'Network Bandwidth', value: '4.2Tbps', trend: '+12%', icon: <Network />, color: 'text-blue-400' },
    { label: 'Neural Core Processing', value: '8.6 PFLOPS', trend: '+5%', icon: <Cpu />, color: 'text-purple-400' },
    { label: 'Blockchain Identity Matrix', value: '100%', trend: 'Stable', icon: <Shield />, color: 'text-emerald-400' },
    { label: 'Database Shard Sync', value: '99.9%', trend: '+0.1%', icon: <Database />, color: 'text-indigo-400' },
  ];

  const operationalFeed = [
    { time: '10:45:22', event: 'Regional Handshake Successful', node: 'NA-WEST-01', level: 'INFO' },
    { time: '10:42:15', event: 'High Load Detected on Neural Core', node: 'APC-SOUTH-04', level: 'WARN' },
    { time: '10:38:09', event: 'Database Partition Re-balancing', node: 'EU-CENTRAL-02', level: 'INFO' },
    { time: '10:35:55', event: 'Intrusion Attempt Nullified', node: 'GATEWAY-PRIMARY', level: 'SECURE' },
  ];

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
               <Database size={36} className="text-blue-400" /> Global Operations
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 mb-1">Matrix Regional Infrastructure & System Integrity Management</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 border border-white/5 rounded-xl text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <Terminal size={16} className="text-blue-400"/> Root Terminal
            </button>
            <button className="px-8 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2">
               <Zap size={16}/> System Reboot
            </button>
         </div>
      </div>

      {/* Regional Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regions.map((reg, i) => (
          <div key={i} className="group bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden transition-all hover:border-white/10">
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl group-hover:bg-blue-500/10 transition-all">
                     <Server size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight">{reg.name}</h3>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${reg.color}`}>{reg.status}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-sm font-black text-white">{reg.latency}</p>
               </div>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                     <span>Node Integrity</span>
                     <span>{reg.health}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 group-hover:scale-x-105 origin-left" 
                       style={{ width: `${reg.health}%` }}
                     ></div>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                     <span>Deployment Load</span>
                     <span>{reg.load}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${reg.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'} shadow-lg transition-all duration-1000 origin-left`} 
                       style={{ width: `${reg.load}%` }}
                     ></div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         {/* System Feed */}
         <div className="lg:col-span-8 flex flex-col bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} /> Matrix Operational Feed
               </h4>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Real-time Live
               </span>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar p-0">
               <table className="w-full text-left">
                  <tbody className="divide-y divide-white/5">
                     {operationalFeed.map((log, i) => (
                        <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                           <td className="p-6">
                              <span className="text-[10px] font-black text-white/20 font-mono tracking-widest">{log.time}</span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded-lg ${log.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' : log.level === 'WARN' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {log.level === 'INFO' ? <Info size={14} /> : log.level === 'WARN' ? <Shield size={14} /> : <Zap size={14} />}
                                 </div>
                                 <span className="text-sm font-black text-white tracking-tight leading-none uppercase">{log.event}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-2 text-white/30">
                                 <Globe size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest font-mono">{log.node}</span>
                              </div>
                           </td>
                           <td className="p-6 text-right">
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5 bg-white/5 text-white/40 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all`}>
                                 {log.level}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Vertical Stats */}
         <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Global Telemetry</h4>
            <div className="grid grid-cols-1 gap-4">
               {systemStats.map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between hover:bg-white/10 transition-all group relative overflow-hidden">
                     <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[30px] rounded-full group-hover:scale-150 transition-transform"></div>
                     <div className="flex justify-between items-center mb-6">
                        <div className={`p-4 bg-white/5 rounded-2xl ${stat.color} shadow-xl group-hover:scale-110 transition-transform`}>
                           {stat.icon}
                        </div>
                        <div className="text-right">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend === 'Stable' ? 'text-indigo-400 bg-indigo-500/10' : 'text-emerald-400 bg-emerald-500/10'} px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1 justify-end`}>
                              {stat.trend} {stat.trend !== 'Stable' && <ArrowUpRight size={14} className="animate-pulse" />}
                           </span>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-4xl font-black text-white tracking-tighter leading-none">{stat.value}</h4>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
