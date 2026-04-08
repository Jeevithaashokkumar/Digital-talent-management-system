'use client';

import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Activity, 
  Settings, 
  CheckCircle2, 
  FileText, 
  Palette, 
  BrainCircuit, 
  Network,
  LogOut,
  Zap,
  CheckSquare,
  Phone,
  MessageSquare,
  Layout,
  Database,
  Laptop,
  Layers
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import { useQueryStore } from '@/store/useQueryStore';

export default function UserSidebar({ onToggleSidebar, isOpen }: any) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const activeView = useBoardStore(state => state.activeView);
  const setActiveView = useBoardStore(state => state.setActiveView);
  const queries = useQueryStore(state => state.queries);
  const fetchUserQueries = useQueryStore(state => state.fetchUserQueries);

  React.useEffect(() => {
    fetchUserQueries();
  }, [fetchUserQueries]);

  const unreadCount = queries.filter(q => q.status === 'replied' && !q.isRead).length;

  const menuItems = [
    { id: 'user-dashboard', label: 'Operational Summary', icon: <LayoutGrid size={20} />, color: 'text-indigo-400' },
    { id: 'Boards', label: 'My Directives', icon: <CheckSquare size={20} />, color: 'text-blue-400' },
    { id: 'Mission Table', label: 'My Missions', icon: <CheckCircle2 size={20} />, color: 'text-emerald-400' },
    { id: 'Doc', label: 'Documents', icon: <FileText size={20} />, color: 'text-amber-400' },
    { id: 'Whiteboard', label: 'Omni Canvas', icon: <Palette size={20} />, color: 'text-fuchsia-400' },
    { id: 'Neural Nodes', label: 'Neural Core', icon: <BrainCircuit size={20} />, color: 'text-rose-400' },
    { id: 'Chat', label: 'Command Chat', icon: <Users size={20} />, color: 'text-cyan-400' },
    { id: 'Call', label: 'Secure Signal', icon: <Phone size={20} />, color: 'text-emerald-500' },
    { id: 'Call History', label: 'Signal Logs', icon: <Activity size={20} />, color: 'text-indigo-400' },
    { id: 'user-queries', label: 'Query Interface', icon: <MessageSquare size={20} />, color: 'text-rose-400', badge: unreadCount },
    { id: 'Marketing Hive', label: 'Marketing Hive', icon: <Layout size={20} />, color: 'text-pink-400' },
    { id: 'Global Operations', label: 'Global Operations', icon: <Database size={20} />, color: 'text-blue-400' },
    { id: 'Executive Overlook', label: 'Executive Overlook', icon: <Laptop size={20} />, color: 'text-indigo-400' },
    { id: 'Resource Allocation', label: 'Resource Allocation', icon: <Layers size={20} />, color: 'text-amber-400' },
  ];

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-24'} bg-[var(--sidebar-bg)] border-r border-white/5 transition-all duration-500 flex flex-col p-8 z-[100] relative overflow-hidden group`}>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="mb-12 flex items-center gap-4 relative">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-[1.25rem] flex items-center justify-center p-1 shadow-2xl shadow-indigo-500/40">
           <Zap className="text-white fill-white" size={24} />
        </div>
        {isOpen && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <h1 className="text-2xl font-black text-white tracking-tighter leading-none italic uppercase">DTMS <span className="text-emerald-500 text-[10px] not-italic ml-1 tracking-[0.2em]">MATRIX</span></h1>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">User v4.0</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2 relative">
         {isOpen && <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 block px-4 italic">Neural Directives</label>}
         {menuItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveView(item.id)}
             className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group/item relative overflow-hidden ${
               activeView === item.id 
                 ? 'bg-white/5 text-white shadow-lg shadow-indigo-500/10' 
                 : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
             }`}
           >
              {activeView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              )}
              <div className={`${activeView === item.id ? item.color : 'text-white/20'} transition-colors group-hover/item:text-white`}>
                {item.icon}
              </div>
              {isOpen && (
                <span className={`text-[11px] font-black uppercase tracking-widest ${activeView === item.id ? 'translate-x-1' : ''} transition-transform`}>
                  {item.label}
                </span>
              )}
              {(item as any).badge > 0 && (
                <div className={`absolute ${isOpen ? 'right-4' : 'right-2 top-2'} min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 rounded-full border-2 border-[var(--sidebar-bg)] shadow-lg shadow-rose-500/20 animate-bounce`}>
                  <span className="text-[9px] font-black text-white leading-none">{(item as any).badge}</span>
                </div>
              )}
           </button>
         ))}
      </nav>

      <div className={`mt-8 ${isOpen ? 'p-6' : 'p-2'} bg-gradient-to-br from-[var(--nav-bg)] to-[var(--sidebar-bg)] border border-white/5 rounded-[2rem] relative overflow-hidden transition-all text-center`}>
         <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500/10 rounded-full blur-xl" />
         {isOpen && (
           <div className="flex items-center gap-4 mb-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center border border-white/5">
                 <div className="text-[10px] font-black text-indigo-400">{user?.name?.charAt(0)}</div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{user?.name}</p>
                 <p className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] opacity-80">Matrix User</p>
              </div>
           </div>
         )}
         <button 
           onClick={() => logout()}
           className={`w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all ${!isOpen && 'px-0'}`}
         >
            {isOpen ? 'Terminate Session' : ''} <LogOut size={14} />
         </button>
      </div>
    </aside>
  );
}
