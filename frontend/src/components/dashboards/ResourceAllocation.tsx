'use client';

import React, { useState, useEffect } from 'react';
import { Users, Activity, Loader, AlertTriangle, Shield, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import api from '@/services/api';

export default function ResourceAllocation() {
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

  const getUtilizationScore = (taskCount: number, opCount: number) => {
     const score = taskCount * 10 + opCount * 25; // Weighted score
     if (score > 80) return { label: 'CRITICAL LOAD', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', percent: Math.min(score, 100) };
     if (score > 40) return { label: 'OPTIMAL YIELD', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', percent: score };
     return { label: 'AVAILABLE', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', percent: Math.max(score, 5) };
  };

  const formattedName = (name: string) => (name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

  // Map user to their resources
  const userLoad = data.users.map((user: any) => {
     const userTasks = data.tasks.filter((t: any) => t.assignedTo?.id === user.id || t.assignedToId === user.id);
     const userOps = data.operations.filter((o: any) => o.assignedManager === user.name || o.assignedManager === formattedName(user.name));
     const userCampaigns = data.campaigns.filter((c: any) => c.assignedTeam === user.name || c.assignedTeam === formattedName(user.name));
     
     return {
        ...user,
        tasks: userTasks,
        operations: userOps,
        campaigns: userCampaigns,
        load: getUtilizationScore(userTasks.length, userOps.length)
     };
  }).sort((a, b) => b.load.percent - a.load.percent); // Sort by highest load first

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/40 h-full bg-[#0a0a0f]">
        <Loader className="animate-spin mb-4 text-purple-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest">Scanning Global Personnel Vectors...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white p-8 overflow-y-auto animate-in fade-in duration-700 custom-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Cpu className="text-purple-400" size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Resource Allocation</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Human Capital Workload Telemetry</p>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {userLoad.map(u => (
            <div key={u.id} className="bg-[#12141c]/50 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
               
               <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg font-black text-indigo-400">
                        {formattedName(u.name).substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{formattedName(u.name)}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           {u.role === 'admin' && <Shield size={10} className="text-rose-400" />}
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{u.role}</span>
                        </div>
                     </div>
                  </div>
                  
                  <span className={`text-[8px] font-black px-2 py-1 rounded-sm border uppercase tracking-widest ${u.load.bg} ${u.load.color}`}>
                     {u.load.label}
                  </span>
               </div>

               {/* Load Meter */}
               <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                     <span className="text-white/30">Bandwidth Saturation</span>
                     <span className={u.load.color}>{u.load.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className={`h-full opacity-80 ${u.load.bg.split(' ')[0].replace('/10', '')}`} style={{ width: `${u.load.percent}%` }} />
                  </div>
               </div>

               {/* Assignments */}
               <div className="space-y-2 relative z-10 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between text-xs bg-white/[0.02] rounded-xl px-4 py-3">
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Active Tasks
                     </span>
                     <span className="font-black text-white">{u.tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white/[0.02] rounded-xl px-4 py-3">
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} className="text-blue-500" /> Ops Assigned
                     </span>
                     <span className="font-black text-white">{u.operations.length}</span>
                  </div>
                  {(u.campaigns.length > 0) && (
                     <div className="flex justify-end pt-1">
                        <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1">
                           + {u.campaigns.length} Marketing Campaigns <ChevronRight size={10} />
                        </span>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}
