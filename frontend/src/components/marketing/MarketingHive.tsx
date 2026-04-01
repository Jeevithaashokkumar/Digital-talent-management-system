'use client';

import React from 'react';
import { 
  Rocket, 
  BarChart3, 
  Users, 
  Share2, 
  Image as ImageIcon, 
  Video, 
  Type, 
  TrendingUp, 
  Zap, 
  Globe, 
  Activity, 
  Layers,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  Layout,
  Plus,
  Send,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export default function MarketingHive() {
  const campaigns = [
    { title: 'Cyber Spring 2026', progress: 75, status: 'Active', color: 'bg-indigo-500', icon: <Rocket /> },
    { title: 'Neural Ad-Gen', progress: 42, status: 'Staged', color: 'bg-pink-500', icon: <Zap /> },
    { title: 'Global Talent Push', progress: 15, status: 'Concept', color: 'bg-emerald-500', icon: <Globe /> },
  ];

  const socialMetrics = [
    { label: 'Neural Reach', value: '4.2M+', trend: '+22%', icon: <Users />, color: 'text-blue-400' },
    { label: 'Engagement Pulse', value: '86%', trend: '+12%', icon: <Activity />, color: 'text-rose-400' },
    { label: 'Viral Velocity', value: '1.2M', trend: '+45%', icon: <Zap />, color: 'text-amber-400' },
    { label: 'Network Spread', value: '124', trend: '+8', icon: <Share2 />, color: 'text-indigo-400' },
  ];

  const creativeAssets = [
    { title: 'Interactive Banner A', type: 'Static', status: 'Approved', user: 'PREETHI' },
    { title: 'Neural Video Promo', type: 'Video', status: 'Rendering', user: 'SYSTEM' },
    { title: 'Talent Acquisition Copy', type: 'Text', status: 'Draft', user: 'MARKETING' },
  ];

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
               <Layout size={36} className="text-pink-500" /> Marketing Hive
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3 mb-1">Creative Campaign & Tactical Social Analytics</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 border border-white/5 rounded-xl text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <TrendingUp size={16} className="text-pink-400"/> Daily Pulse
            </button>
            <button className="px-8 py-2 bg-pink-600 hover:bg-pink-500 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all flex items-center gap-2">
               <Plus size={16}/> Launch Campaign
            </button>
         </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((camp, i) => (
          <div key={i} className="group bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden transition-all hover:border-white/10">
            <div className="flex justify-between items-start mb-6">
               <div className={`p-4 ${camp.color} bg-opacity-10 rounded-2xl text-white`}>
                  {camp.icon}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 bg-white/5 text-white/40 flex items-center gap-1.5`}>
                  {camp.status === 'Active' ? <CheckCircle2 size={10} className="text-emerald-400"/> : camp.status === 'Staged' ? <Clock size={10} className="text-amber-400"/> : <Lightbulb size={10} className="text-blue-400"/>}
                  {camp.status}
               </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">{camp.title}</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                  <span>Resource Reach</span>
                  <span>{camp.progress}%</span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${camp.color} shadow-lg transition-all duration-1000 group-hover:scale-x-105 origin-left`} 
                    style={{ width: `${camp.progress}%` }}
                  ></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         {/* Social Metrics */}
         <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Network Analytics</h4>
            <div className="grid grid-cols-1 gap-4">
               {socialMetrics.map((met, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 bg-white/5 rounded-xl ${met.color}`}>
                           {met.icon}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{met.label}</p>
                           <h4 className="text-2xl font-black text-white tracking-tighter">{met.value}</h4>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10">
                           {met.trend} <ArrowUpRight size={14} className="animate-bounce-slow" />
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Creative Queue */}
         <div className="lg:col-span-8 flex flex-col bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Creative Asset Queue</h4>
               <button className="text-white/20 hover:text-white transition-all bg-white/5 p-2 rounded-xl border border-white/5"><MoreHorizontal size={20}/></button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Asset Identifier</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Medium Type</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Status</th>
                        <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Assignee</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {creativeAssets.map((asset, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="p-6 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                asset.type === 'Video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' : 
                                asset.type === 'Text' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 
                                'bg-pink-500/10 text-pink-400 border-pink-500/10'
                              }`}>
                                 {asset.type === 'Video' ? <Video size={16} /> : asset.type === 'Text' ? <Type size={16} /> : <ImageIcon size={16} />}
                              </div>
                              <span className="text-sm font-black text-white tracking-tight leading-none uppercase">{asset.title}</span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-2 text-white/40">
                                 {asset.type === 'Video' ? <Video size={14} /> : asset.type === 'Text' ? <Type size={14} /> : <ImageIcon size={14} />}
                                 <span className="text-[10px] font-black uppercase tracking-widest">{asset.type}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex justify-center">
                                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${asset.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {asset.status}
                                 </span>
                              </div>
                           </td>
                           <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <div className="w-6 h-6 rounded-md bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black text-white/40">
                                    {asset.user.charAt(0)}
                                 </div>
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">{asset.user}</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
