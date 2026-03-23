import React, { useState, useEffect } from 'react';
import { LayoutList, Search, Plus, Filter, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Trash2, X, Calendar, Zap } from 'lucide-react';
import api from '@/services/api';

export default function MissionTableModule() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
   const [users, setUsers] = useState<any[]>([]);
   const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    status: 'not_started', 
    priority: 'medium', 
    dueDate: '',
    assignedUsers: [] as string[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes] = await Promise.all([
        api.get('/missions'),
        api.get('/auth/users')
      ]);
      setMissions(mRes.data);
      setUsers(uRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    try {
      await api.post('/missions', formData);
      fetchData();
      setShowModal(false);
      setFormData({ title: '', description: '', status: 'not_started', priority: 'medium', dueDate: '', assignedUsers: [] });
      (window as any).addToast?.('Mission Objective Logged', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMission = async (id: string) => {
    if (!confirm('Abort this mission? Data will be purged.')) return;
    try {
      await api.delete(`/missions/${id}`);
      setMissions(missions.filter(m => m.id !== id));
      (window as any).addToast?.('Mission Aborted', 'warning');
    } catch (e) {
      console.error(e);
    }
  };

  const getAssignedUserNames = (assignedStr: string) => {
    try {
      const ids = JSON.parse(assignedStr || '[]');
      return users.filter(u => ids.includes(u.id)).map(u => u.name);
    } catch { return []; }
  };

  return (
    <div className="h-full bg-[#0a0b10] p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
              <LayoutList size={56} className="text-emerald-500" /> Mission Control
            </h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] mt-4 ml-1">High-level objective coordination matrix.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus size={24} strokeWidth={3} /> New Mission
          </button>
        </div>

        <div className="bg-[#12141c] border border-white/5 rounded-[3rem] overflow-hidden shadow-3xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Mission Objective</th>
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Priority</th>
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Assigned Team</th>
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Progress</th>
                    <th className="p-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ops</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {missions.map(mission => (
                   <tr key={mission.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-8">
                         <p className="text-xl font-black text-white tracking-tight uppercase">{mission.title}</p>
                         <p className="text-white/30 text-xs font-bold mt-1 line-clamp-1">{mission.description || 'No primary briefing.'}</p>
                      </td>
                      <td className="p-8">
                          <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit ${
                            mission.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            mission.status === 'blocked' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                             {mission.status === 'completed' ? <CheckCircle2 size={14} /> : 
                              mission.status === 'blocked' ? <AlertCircle size={14} /> : <Clock size={14} />}
                             {mission.status.replace('_', ' ')}
                          </span>
                      </td>
                      <td className="p-8">
                          <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit ${
                            mission.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
                            mission.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                             <Zap size={14} /> {mission.priority}
                          </span>
                      </td>
                      <td className="p-8">
                         <div className="flex -space-x-3 overflow-hidden">
                            {getAssignedUserNames(mission.assignedUsers).map((name, i) => (
                               <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-[#12141c] flex items-center justify-center text-[10px] font-black text-white shadow-xl" title={name}>
                                  {name.charAt(0).toUpperCase()}
                               </div>
                            ))}
                            {getAssignedUserNames(mission.assignedUsers).length === 0 && (
                               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Unassigned</span>
                            )}
                         </div>
                      </td>
                      <td className="p-8">
                         <div className="w-48">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{mission.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className={`h-full transition-all duration-1000 ${
                                 mission.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                               }`} style={{ width: `${mission.progress}%` }}></div>
                            </div>
                         </div>
                      </td>
                      <td className="p-8">
                         <button onClick={() => deleteMission(mission.id)} className="p-3 bg-white/5 hover:bg-rose-500 text-white/20 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
                      </td>
                   </tr>
                 ))}
                 
                 {missions.length === 0 && !loading && (
                   <tr>
                     <td colSpan={6} className="p-32 text-center">
                        <p className="text-white/10 font-black text-xl uppercase tracking-widest">No Strategic Missions Identified</p>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Create Mission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#12141c] border border-white/10 w-full max-w-2xl rounded-[3rem] p-12 shadow-3xl animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Initialize Mission</h2>
                <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40"><X/></button>
             </div>
             
             <div className="space-y-8">
                <div>
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Objective Signature</label>
                   <input 
                      autoFocus
                      placeholder="Operation Dark Star..."
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-emerald-500/50 transition-all font-black text-xl"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Strategic Briefing</label>
                   <textarea 
                      placeholder="Aligning core infrastructure for..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-emerald-500/50 transition-all font-bold h-32 resize-none text-lg"
                   />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3">Status</label>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none"
                      >
                         <option value="not_started">Not Started</option>
                         <option value="in_progress">In Progress</option>
                         <option value="completed">Completed</option>
                         <option value="blocked">Blocked</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3">Priority</label>
                      <select 
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none"
                      >
                         <option value="low">Low</option>
                         <option value="medium">Medium</option>
                         <option value="high">High</option>
                      </select>
                   </div>
                   <div className="col-span-2 lg:col-span-1">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3">Target Date</label>
                      <input 
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                      />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Assign Members</label>
                   <div className="flex flex-wrap gap-2">
                      {users.map(u => (
                         <button 
                           key={u.id}
                           onClick={() => {
                              const current = formData.assignedUsers;
                              const next = current.includes(u.id) ? current.filter(id => id !== u.id) : [...current, u.id];
                              setFormData({...formData, assignedUsers: next});
                           }}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                             formData.assignedUsers.includes(u.id) 
                               ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                               : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'
                           }`}
                         >
                            {u.name}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm">Abort</button>
                  <button onClick={handleCreate} className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 uppercase tracking-widest text-sm">Launch Mission</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
