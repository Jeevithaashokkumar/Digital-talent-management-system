'use client';

import React, { useState, useEffect } from 'react';
import { Target, Plus, Search, Filter, Briefcase, Zap, Flame, Loader } from 'lucide-react';
import api from '@/services/api';

export default function MarketingHive() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ campaignName: '', type: 'Launch', budget: 0, assignedTeam: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (e) {
      console.error('Error fetching campaigns', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', formData);
      setIsModalOpen(false);
      setFormData({ campaignName: '', type: 'Launch', budget: 0, assignedTeam: '' });
      fetchCampaigns();
    } catch (e) {
      console.error('Failed to create campaign', e);
    }
  };

  const filtered = campaigns.filter(c => c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white p-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
              <Flame className="text-pink-400" size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Marketing Hive</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Global Advertising & Brand Expansion Matrix</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text"
              placeholder="Query Campaigns..."
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold text-white placeholder:text-white/20 w-64 focus:outline-none focus:border-pink-500/50 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 flex items-center gap-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Init Campaign
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 bg-[#12141c]/50 rounded-[2.5rem] border border-white/5 backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                <Loader className="animate-spin text-pink-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Compiling Assets...</span>
             </div>
          ) : filtered.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                <Target size={48} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No Active Campaigns Detected</span>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filtered.map(campaign => (
                  <div key={campaign.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.07] hover:border-pink-500/30 transition-all group cursor-pointer relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                           <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{campaign.campaignName}</h3>
                           <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">{campaign.type}</p>
                        </div>
                        <span className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-full uppercase tracking-widest text-white/60">
                           {campaign.status}
                        </span>
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Assigned Team</span>
                           <span className="text-xs font-black text-white">{campaign.assignedTeam || 'None'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Allocated Budget</span>
                           <span className="text-xs font-black text-emerald-400">${campaign.budget.toLocaleString()}</span>
                        </div>
                        {/* Progress Bar Mockup */}
                        <div className="pt-2">
                           <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-widest mb-1.5">
                              <span>Spend Velocity</span>
                              <span className="text-amber-400">Moderate</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 w-[60%]" />
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#12141c] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-3xl">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <Target className="text-pink-500" /> New Campaign
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                   <Plus size={24} className="rotate-45" />
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Campaign Title</label>
                     <input type="text" required value={formData.campaignName} onChange={e => setFormData({...formData, campaignName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-pink-500/50" placeholder="e.g., Q4 Enterprise Push" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-pink-500/50">
                           <option value="Launch">Product Launch</option>
                           <option value="Awareness">Brand Awareness</option>
                           <option value="Conversion">Conversion Funnel</option>
                           <option value="Event">Live Event</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Budget Allocation ($)</label>
                        <input type="number" required value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/50" placeholder="10000" />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Assigned Vanguard Team</label>
                     <input type="text" value={formData.assignedTeam} onChange={e => setFormData({...formData, assignedTeam: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-pink-500/50" placeholder="e.g., Creative Alpha" />
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 mt-4">
                     Deploy Campaign Vector
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
