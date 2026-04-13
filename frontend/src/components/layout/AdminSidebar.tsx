'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Target, 
  PieChart, 
  Settings, 
  ShieldCheck,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Network,
  MessageSquare,
  Layout,
  Database,
  Laptop,
  Layers,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import { useQueryStore } from '@/store/useQueryStore';

export default function AdminSidebar() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const activeView = useBoardStore(state => state.activeView);
  const setActiveView = useBoardStore(state => state.setActiveView);
  const queries = useQueryStore(state => state.queries);
  const fetchAllQueries = useQueryStore(state => state.fetchAllQueries);

  React.useEffect(() => {
    fetchAllQueries();
  }, [fetchAllQueries]);

  const unreadCount = queries.filter(q => q.status === 'pending' && !q.isRead).length;

  const menuItems = [
    { id: 'admin-dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} />, color: 'text-blue-400' },
    { id: 'admin-users', label: 'User Matrix', icon: <Users size={20} />, color: 'text-emerald-400' },
    { id: 'admin-tasks', label: 'Global Directives', icon: <CheckSquare size={20} />, color: 'text-fuchsia-400' },
    { id: 'admin-missions', label: 'Strategic Goals', icon: <Target size={20} />, color: 'text-amber-400' },
    { id: 'admin-projects', label: 'Mission Archive', icon: <Network size={20} />, color: 'text-indigo-400' },
    { id: 'admin-analytics', label: 'System Analytics', icon: <PieChart size={20} />, color: 'text-indigo-400' },
    { id: 'admin-queries', label: 'Global Queries', icon: <MessageSquare size={20} />, color: 'text-rose-400', badge: unreadCount },
    { id: 'Call History', label: 'Signal Logs', icon: <Activity size={20} />, color: 'text-indigo-400' },
    { id: 'Knowledge Graph', label: 'Knowledge Matrix', icon: <Network size={20} />, color: 'text-cyan-400' },
    { id: 'Marketing Hive', label: 'Marketing Hive', icon: <Layout size={20} />, color: 'text-pink-400' },
    { id: 'Global Operations', label: 'Global Operations', icon: <Database size={20} />, color: 'text-blue-400' },
    { id: 'Executive Overlook', label: 'Executive Overlook', icon: <Laptop size={20} />, color: 'text-indigo-400' },
    { id: 'Resource Allocation', label: 'Resource Allocation', icon: <Layers size={20} />, color: 'text-amber-400' },
    { id: 'admin-settings', label: 'Core Configuration', icon: <Settings size={20} />, color: 'text-slate-400' },
  ];

  return (
    <div className="w-80 h-full bg-[var(--sidebar-bg)] border-r border-white/5 flex flex-col p-8 z-[100] relative overflow-hidden group">
      {/* Animated Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Brand Header */}
      <div className="mb-12 flex items-center gap-4 relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-fuchsia-600 rounded-[1.25rem] flex items-center justify-center p-1 shadow-2xl shadow-blue-500/40">
           <Zap className="text-white fill-white" size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-black text-white tracking-tighter leading-none italic uppercase">DTMS <span className="text-blue-500 text-sm not-italic ml-1">ADMIN</span></h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">User Center v4.0</p>
        </div>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 space-y-2 relative">
         <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 block px-4 italic">Primary Systems</label>
         {menuItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveView(item.id)}
             className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group/item relative overflow-hidden ${
               activeView === item.id 
                 ? 'bg-white/5 text-white shadow-lg' 
                 : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
             }`}
           >
              {activeView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              )}
              <div className={`${activeView === item.id ? item.color : 'text-white/20'} transition-colors group-hover/item:text-white`}>
                {item.icon}
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${activeView === item.id ? 'translate-x-1' : ''} transition-transform`}>
                {item.label}
              </span>
              {(item as any).badge > 0 && (
                <div className="absolute right-4 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 rounded-full border-2 border-[var(--sidebar-bg)] shadow-lg shadow-rose-500/20 animate-bounce">
                  <span className="text-[9px] font-black text-white leading-none">{(item as any).badge}</span>
                </div>
              )}
           </button>
         ))}
      </nav>

      {/* Admin Token */}
      <div className="mt-8 p-6 bg-gradient-to-br from-[var(--nav-bg)] to-[var(--sidebar-bg)] border border-white/5 rounded-[2rem] relative overflow-hidden">
         <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl" />
         <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/5">
               <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
               <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{user?.name}</p>
               <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-80 flex items-center gap-1">
                   <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" /> Global Admin
               </span>
            </div>
         </div>
         <button 
           onClick={() => logout()}
           className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
         >
            Force De-auth <LogOut size={14} />
         </button>
      </div>
    </div>
  );
}
