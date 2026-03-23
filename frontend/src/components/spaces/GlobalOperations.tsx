'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, Search, MapPin, Activity, Shield, Loader, User } from 'lucide-react';
import api from '@/services/api';

export default function GlobalOperations() {
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ operationName: '', department: 'Logistics', priority: 'medium', region: '', assignedManager: '' });

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const res = await api.get('/operations');
      setOperations(res.data);
    } catch (e) {
      console.error('Error fetching operations', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/operations', formData);
      setIsModalOpen(false);
      setFormData({ operationName: '', department: 'Logistics', priority: 'medium', region: '', assignedManager: '' });
      fetchOperations();
    } catch (e) {
      console.error('Failed to create operation', e);
    }
  };

  const filtered = operations.filter(o => o.operationName.toLowerCase().includes(searchQuery.toLowerCase()));

  const getPriorityColor = (p: string) => {
     if (p === 'critical') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
     if (p === 'high') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
     return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white p-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Globe className="text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Global Operations</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Synchronize international infrastructure networks</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text"
              placeholder="Query Network..."
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold text-white placeholder:text-white/20 w-64 focus:outline-none focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 flex items-center gap-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Init Directive
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
         {loading ? (
             <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-4">
                <Loader className="animate-spin text-blue-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Network Nodes...</span>
             </div>
          ) : filtered.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-4">
                <Globe size={48} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Matrix is Empty</span>
             </div>
          ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               {filtered.map(op => (
                  <div key={op.id} className="bg-[#12141c]/50 border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.03] transition-all backdrop-blur-xl group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                     
                     <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                           <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{op.operationName}</h3>
                           <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-md">
                                 <Shield size={10} /> {op.department}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getPriorityColor(op.priority)}`}>
                                 {op.priority}
                              </span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-widest shadow-inner shadow-emerald-500/10">
                              {op.status}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6 relative z-10 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center gap-1.5"><MapPin size={10} /> Region</span>
                           <span className="text-sm font-black text-white uppercase tracking-tight">{op.region}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center gap-1.5"><User size={10} /> Sector Manager</span>
                           <span className="text-sm font-black text-white uppercase tracking-tight">{op.assignedManager || 'UNASSIGNED'}</span>
                        </div>
                     </div>
                  </div>
               ))}
             </div>
          )}
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#12141c] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-3xl">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <Activity className="text-blue-500" /> Establish Operation
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                   <Plus size={24} className="rotate-45" />
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Operation Codename</label>
                     <input type="text" required value={formData.operationName} onChange={e => setFormData({...formData, operationName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g., Project Titan" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Department</label>
                        <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50">
                           <option value="Logistics">Logistics</option>
                           <option value="Security">Security</option>
                           <option value="Facilities">Facilities</option>
                           <option value="IT Infrastructure">IT Infrastructure</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Priority Vector</label>
                        <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50">
                           <option value="low">Low Background</option>
                           <option value="medium">Medium Standard</option>
                           <option value="high">High Velocity</option>
                           <option value="critical">CRITICAL OVERRIDE</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Geographic Region</label>
                        <input type="text" required value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g., EMEA, NA-EAST" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Sector Manager</label>
                        <input type="text" value={formData.assignedManager} onChange={e => setFormData({...formData, assignedManager: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50" placeholder="Assignee Name" />
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 mt-4">
                     Authorize Operation
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
