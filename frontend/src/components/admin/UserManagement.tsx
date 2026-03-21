'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  UserX, 
  CheckCircle2,
  Mail,
  Calendar,
  X
} from 'lucide-react';
import api from '@/services/api';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/users', formData);
      fetchUsers();
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'user', password: '' });
      (window as any).addToast?.('New user registered', 'success');
    } catch (e) {
       console.error(e);
    }
  };

  const toggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await api.put(`/users/${user.id}`, { status: newStatus });
      fetchUsers();
      (window as any).addToast?.(`User ${newStatus === 'active' ? 'Initiated' : 'Suspended'}`, 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Eliminate user from systems? All data remains.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      (window as any).addToast?.('User Purged', 'warning');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Users size={36} className="text-blue-500" /> Operator Matrix
          </h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">Manage personnel access and system directives.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
             <input 
               placeholder="Search Operators..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-blue-500/50 transition-all w-64"
             />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-2xl shadow-blue-500/20"
          >
            <UserPlus size={18} /> Add Operator
          </button>
        </div>
      </div>

      <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Operator</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Role</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Joined</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 flex items-center justify-center text-blue-400 font-black text-xs border border-white/5">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white tracking-tight">{user.name}</p>
                      <p className="text-[10px] text-white/30 font-bold">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${user.role === 'admin' ? 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/5' : 'border-blue-500/30 text-blue-400 bg-blue-500/5'} uppercase tracking-widest`}>
                    {user.role}
                   </span>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                       {user.status}
                     </span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {new Date(user.createdAt).toLocaleDateString()}
                   </p>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <button 
                        onClick={() => toggleStatus(user)}
                        className={`p-2 rounded-xl border border-white/5 ${user.status === 'active' ? 'hover:bg-rose-500/20 hover:text-rose-400' : 'hover:bg-emerald-500/20 hover:text-emerald-400'} text-white/40 transition-all`}
                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                         {user.status === 'active' ? <UserX size={16}/> : <CheckCircle2 size={16}/>}
                      </button>
                      <button 
                         onClick={() => deleteUser(user.id)}
                        className="p-2 border border-white/5 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 text-white/40 transition-all"
                      >
                         <Trash2 size={16}/>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div className="p-12 flex justify-center border-t border-white/5">
             <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 bg-black/40">
           <div className="bg-[#12141c] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <UserPlus size={24} className="text-blue-500" /> New System Operator
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all"><X size={20}/></button>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2 px-1">Full Name</label>
                  <input 
                    placeholder="Enter operator name..."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2 px-1">Email Address</label>
                  <input 
                    type="email"
                    placeholder="operator@system.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2 px-1">Access Role</label>
                     <select 
                       value={formData.role}
                       onChange={e => setFormData({...formData, role: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                     >
                       <option value="user" className="bg-[#12141c]">Standard User</option>
                       <option value="admin" className="bg-[#12141c]">System Admin</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2 px-1">Secure Password</label>
                     <input 
                       type="password"
                       placeholder="••••••••"
                       value={formData.password}
                       onChange={e => setFormData({...formData, password: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all"
                     />
                   </div>
                </div>
                
                <div className="pt-6 flex gap-4">
                   <button 
                     onClick={() => setShowModal(false)}
                     className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/60 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                   >
                     Abort
                   </button>
                   <button 
                     onClick={handleCreate}
                     className="flex-1 py-5 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30"
                   >
                     Initialize Access
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
