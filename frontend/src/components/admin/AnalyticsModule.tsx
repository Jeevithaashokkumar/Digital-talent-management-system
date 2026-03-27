'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Activity, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function AnalyticsModule({ stats }: { stats: any }) {
  const taskStatusData = [
    { name: 'Completed', value: stats.completedTasks || 0, color: '#10b981' },
    { name: 'Pending', value: stats.pendingTasks || 0, color: '#3b82f6' },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Activity size={36} className="text-indigo-500" /> System Metrics
          </h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">Statistical analysis of matrix performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task completion Pie */}
        <div className="lg:col-span-1 bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-8">Resolution Ratio</h4>
           <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* User Productivity Bar */}
        <div className="lg:col-span-2 bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-8">User Efficiency</h4>
           <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.productivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#ffffff40', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#ffffff40', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  />
                  <Bar dataKey="completed" fill="#6366f1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Advanced Trends */}
      <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
         <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-black text-white uppercase tracking-tighter">System Trajectory</h4>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Task Intake</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Resolution</span>
               </div>
            </div>
         </div>
         <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[
                 { day: 'Mon', intake: 12, res: 10 },
                 { day: 'Tue', intake: 19, res: 15 },
                 { day: 'Wed', intake: 15, res: 18 },
                 { day: 'Thu', intake: 22, res: 20 },
                 { day: 'Fri', intake: 30, res: 25 },
               ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#ffffff20', fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#12141c', border: 'none', borderRadius: '16px' }} />
                  <Line type="monotone" dataKey="intake" stroke="#6366f1" strokeWidth={4} dot={false} />
                  <Line type="monotone" dataKey="res" stroke="#10b981" strokeWidth={4} dot={false} />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
