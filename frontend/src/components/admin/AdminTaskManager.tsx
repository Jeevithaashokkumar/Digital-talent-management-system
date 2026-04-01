'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ClipboardList,
  Calendar,
  ChevronDown,
  ArrowRight,
  Shield,
  Briefcase
} from 'lucide-react';
import api from '@/services/api';
import { useBoardStore } from '@/store/useBoardStore';

export default function AdminTaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionRate: 0
  });

  const fetchTasks = async () => {
    try {
      const [taskRes, userRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
        api.get('/analytics/admin')
      ]);
      setTasks(taskRes.data);
      setUsers(userRes.data);
      if (statsRes.data.cards) {
         setStats({
           total: statsRes.data.cards.totalTasks || 0,
           completed: statsRes.data.cards.completedTasks || 0,
           pending: statsRes.data.cards.pendingTasks || 0,
           inProgress: statsRes.data.cards.inProgressTasks || 0,
           completionRate: statsRes.data.completionRate || 0
         });
      }
      setLoading(false);
    } catch (error) {
      console.error("Task Matrix Sync Failed:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    (window as any).refreshTasks = fetchTasks;
    return () => { (window as any).refreshTasks = null; };
  }, []);

  const handleEdit = (task: any) => {
     if ((window as any).openCreateAssetModal) {
        (window as any).openCreateAssetModal('Task', task);
     }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Confirm tactical erasure of this directive?")) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
        if ((window as any).addToast) (window as any).addToast("Directive Terminated", "success");
      } catch (error) {
         if ((window as any).addToast) (window as any).addToast("Erasure Collision", "error");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      fetchTasks();
      if ((window as any).addToast) (window as any).addToast(`Status Updated: ${newStatus}`, "success");
    } catch (error) {
      if ((window as any).addToast) (window as any).addToast("Status Sync Error", "error");
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusColors: any = {
    'todo': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-700">
      {/* Matrix Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Directives', value: stats.total, icon: <ClipboardList />, shadow: 'shadow-blue-500/20', color: 'text-blue-400' },
          { label: 'Completed', value: stats.completed, icon: <CheckCircle2 />, shadow: 'shadow-emerald-500/20', color: 'text-emerald-400' },
          { label: 'Tactical Pending', value: stats.pending, icon: <Clock />, shadow: 'shadow-rose-500/20', color: 'text-rose-400' },
          { label: 'In Progress', value: stats.inProgress, icon: <Activity />, shadow: 'shadow-amber-500/20', color: 'text-amber-400' },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`p-3 bg-white/5 rounded-2xl w-fit mb-4 ${card.color} ${card.shadow}`}>
              {card.icon}
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-[2rem]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search Global Directives..." 
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-black text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 ${statusFilter !== 'all' ? 'border-indigo-500/50 text-indigo-400' : ''}`}
            >
              <Filter size={14}/> {statusFilter === 'all' ? 'Filter' : statusFilter}
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e202e] border border-white/10 rounded-2xl shadow-2xl z-[50] overflow-hidden p-2">
                {['all', 'todo', 'in-progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-indigo-500 text-white' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => (window as any).openCreateAssetModal('Task')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={16}/> New Directive
          </button>
        </div>
      </div>

      {/* Global Directive List */}
      <div className="flex-1 min-h-0 bg-[var(--card-bg)] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Directive Title</th>
                <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Assigned Operator</th>
                <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Operational Status</th>
                <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Deadline</th>
                <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="text-sm font-black text-white tracking-tight uppercase">{task.title}</p>
                    <p className="text-[10px] text-white/30 truncate max-w-xs mt-1 font-bold">{task.description || 'No specific mission brief provided.'}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400">
                        {task.assignee?.name.charAt(0) || <Shield size={14}/>}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white/80 tracking-tight leading-none mb-1">{task.assignee?.name || 'Unassigned'}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">{task.assignee?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border appearance-none transition-all focus:outline-none cursor-pointer ${statusColors[task.status] || 'bg-white/5 text-white/40'}`}
                    >
                      <option value="todo" className="bg-[#12141c]">Pending</option>
                      <option value="in-progress" className="bg-[#12141c]">In Progress</option>
                      <option value="completed" className="bg-[#12141c]">Completed</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-white/40">
                      <Calendar size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(task)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all text-indigo-400"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 hover:text-rose-300 transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center opacity-20 italic font-black uppercase tracking-widest text-xs">
                    No active directives matching your tactical parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
