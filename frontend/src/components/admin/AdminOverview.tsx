'use client';

import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Zap,
  Shield
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

interface AdminOverviewProps {
  stats: any;
}

export default function AdminOverview({ stats }: AdminOverviewProps) {
  const cards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: <Users className="text-blue-400" />, color: 'from-blue-500/20 to-blue-600/5', trend: '+12%' },
    { title: 'Active Missions', value: stats.activeMissions || 0, icon: <Target className="text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-600/5', trend: '+5%' },
    { title: 'Tasks Completed', value: stats.completedTasks || 0, icon: <CheckCircle2 className="text-fuchsia-400" />, color: 'from-fuchsia-500/20 to-fuchsia-600/5', trend: '+28%' },
    { title: 'Pending Tasks', value: stats.pendingTasks || 0, icon: <Clock className="text-amber-400" />, color: 'from-amber-500/20 to-amber-600/5', trend: '-8%' },
  ];

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                {card.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${card.trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter">Elite Performance</h4>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Tasks completed by top members.</p>
              </div>
              <Activity className="text-emerald-500 opacity-20" size={32} />
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.productivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(name) => (name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim()}
                    tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 900 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="completed" radius={[10, 10, 0, 0]}>
                    {stats.productivity?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ffffff10'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Global Progress */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl flex flex-col justify-between">
           <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter">System Velocity</h4>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Daily task resolution velocity.</p>
           </div>

           <div className="space-y-6 my-10">
              <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                       {stats.completionRate || 0}%
                    </h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                       <ArrowUpRight size={14} /> Global Efficiency
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Status</p>
                    <p className="text-xs font-black text-blue-400 uppercase">Operational</p>
                 </div>
              </div>
              
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                   style={{ width: `${(stats.completedTasks / (stats.totalTasks || 1)) * 100}%` }}
                 />
              </div>
           </div>

           <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group">
              Generate PDF Report <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} />
           </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Mission status distribution */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Strategic Distribution</h4>
           <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.missionDistribution} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="status" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900}}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                    {stats.missionDistribution?.map((entry: any, index: number) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Global Activity Feed */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Global Pulse Feed</h4>
           <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {stats.activity?.map((act: any, i: number) => (
                <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0">
                   <div className={`p-2 rounded-xl bg-white/5 ${act.type === 'mission' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {act.type === 'mission' ? <Target size={14} /> : <Briefcase size={14} />}
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-tight">{act.title}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold mt-1">
                         <span className="text-indigo-400">{(act.user || 'User').replace(/OPERATOR|Operator/gi, 'User').trim()}</span> • {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{act.type}</div>
                </div>
              ))}
              {(!stats.activity || stats.activity.length === 0) && (
                <div className="text-center py-10 opacity-20 italic">No recent system activity detected.</div>
              )}
           </div>
        </div>
      </div>

      {/* Quick Action Panel */}
      <div className="pt-8">
         <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 italic">Command Center Quick Actions</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Broadcast Message', icon: <Zap size={14}/>, color: 'hover:bg-indigo-500/20 hover:text-indigo-400' },
              { label: 'Register User', icon: <Users size={14}/>, color: 'hover:bg-blue-500/20 hover:text-blue-400' },
              { label: 'Global Directive', icon: <Shield size={14}/>, color: 'hover:bg-rose-500/20 hover:text-rose-400' },
              { label: 'System Lockdown', icon: <Clock size={14}/>, color: 'hover:bg-amber-500/20 hover:text-amber-400' },
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
