'use client';

import React, { useState, useEffect } from 'react';
import { Target, BarChart2, TrendingUp, DollarSign, Activity, Users, Globe, Briefcase, Zap, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import api from '@/services/api';

export default function ExecutiveOverlook() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ campaigns: [], operations: [], tasks: [], users: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, oRes, tRes, uRes] = await Promise.all([
          api.get('/campaigns').catch(() => ({ data: [] })),
          api.get('/operations').catch(() => ({ data: [] })),
          api.get('/tasks').catch(() => ({ data: [] })),
          api.get('/auth/users').catch(() => ({ data: [] }))
        ]);
        setData({ campaigns: cRes.data, operations: oRes.data, tasks: tRes.data, users: uRes.data });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBudget = data.campaigns.reduce((acc: number, c: any) => acc + (c.budget || 0), 0);
  const activeOps = data.operations.filter((o: any) => o.status !== 'completed' && o.status !== 'failed').length;
  const completedTasks = data.tasks.filter((t: any) => t.status === 'completed').length;
  const totalTasks = data.tasks.length;

  // Mocked trend data for visual richness
  const revenueTrend = [
    { name: 'Q1', value: totalBudget * 0.1 },
    { name: 'Q2', value: totalBudget * 0.3 },
    { name: 'Q3', value: totalBudget * 0.7 },
    { name: 'Q4', value: totalBudget }
  ];

  const opStatusCounts = data.operations.reduce((acc: any, op: any) => {
    acc[op.status] = (acc[op.status] || 0) + 1;
    return acc;
  }, {});
  const opDistribution = Object.keys(opStatusCounts).map(key => ({ name: key, count: opStatusCounts[key] })).slice(0, 4);
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/40 h-full bg-[#0a0a0f]">
        <Loader className="animate-spin mb-4 text-emerald-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest">Aggregating Executive Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white p-8 overflow-y-auto animate-in fade-in duration-700 custom-scrollbar">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30">
            <Activity className="text-emerald-400" size={24} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Executive Overlook</h1>
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">C-Suite Macro Visualization Matrix</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#12141c]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <DollarSign className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">FINANCE</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 relative z-10">Total Campaign Budget</p>
          <h3 className="text-3xl font-black text-white tracking-tighter relative z-10">${totalBudget.toLocaleString()}</h3>
        </div>

        <div className="bg-[#12141c]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <Globe className="text-blue-500" size={20} />
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">OPERATIONS</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 relative z-10">Active Directives</p>
          <h3 className="text-3xl font-black text-white tracking-tighter relative z-10">{activeOps} <span className="text-lg text-white/20">/ {data.operations.length}</span></h3>
        </div>

        <div className="bg-[#12141c]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <Target className="text-purple-500" size={20} />
            <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">PRODUCTION</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 relative z-10">Task Completion</p>
          <h3 className="text-3xl font-black text-white tracking-tighter relative z-10">{completedTasks} <span className="text-lg text-white/20">/ {totalTasks}</span></h3>
        </div>

        <div className="bg-[#12141c]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <Users className="text-rose-500" size={20} />
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">PERSONNEL</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 relative z-10">Global Workforce</p>
          <h3 className="text-3xl font-black text-white tracking-tighter relative z-10">{data.users.length}</h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Campaign Burn Chart */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
           <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Financial Trajectory</h4>
           <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-8">Aggregated Campaign Spend Projection</p>
           <div className="h-[250px]">
             {totalBudget > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={revenueTrend}>
                     <defs>
                       <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10, fontWeight: 900}} />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 900 }}
                       itemStyle={{ color: '#10b981' }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                   </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                   <DollarSign size={32} className="mb-2 opacity-20" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Campaign Capital</span>
                </div>
             )}
           </div>
        </div>

        {/* Global Operations Split */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
           <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Operational Division</h4>
           <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-8">Global Operation Status Matrix</p>
           <div className="h-[250px]">
             {opDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                        data={opDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="none"
                     >
                        {opDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                   </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                   <Globe size={32} className="mb-2 opacity-20" />
                   <span className="text-[10px] font-black uppercase tracking-widest">No Active Operations</span>
                </div>
             )}
           </div>
        </div>
      </div>
      
    </div>
  );
}
