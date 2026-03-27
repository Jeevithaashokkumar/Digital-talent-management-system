'use client';

import { 
  Search, Bell, User, LayoutGrid, ChevronDown, 
  Plus, MoreHorizontal, Settings, LogOut, Grid, 
  Layers, Rocket, Database, Briefcase, Zap, 
  PieChart, Brain, Info, LayoutList, Terminal, 
  Layout, Laptop, Sun, Moon, Type, Globe,
  Calendar, GanttChart
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore, LANGUAGES, Language } from '@/store/useSettingsStore';
import { useEffect } from 'react';

import NotificationDropdown from './NotificationDropdown';
import SearchPopover from './SearchPopover';
import ProfileDropdown from './ProfileDropdown';
import SystemInfoModal from './SystemInfoModal';
import SettingsDropdown from './SettingsDropdown';

export default function Navbar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { activeView, setActiveView } = useBoardStore();
  const { theme, language, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeLang = LANGUAGES.find(l => l.code === language);

  const menuData: any = {
    'Spaces': [
      { name: 'Engineering Matrix', icon: Terminal, color: 'text-emerald-400' },
      { name: 'Marketing Hive', icon: Layout, color: 'text-pink-400' },
      { name: 'Global Operations', icon: Database, color: 'text-blue-400' }
    ],
    'Dashboards': [
      { name: 'Executive Overlook', icon: Laptop, color: 'text-indigo-400' },
      { name: 'Resource Allocation', icon: Layout, color: 'text-amber-400' }
    ],
    'Brain': [
      { name: 'Neural Nodes', icon: Brain, color: 'text-purple-400' },
      { name: 'Knowledge Graph', icon: Info, color: 'text-slate-400' },
      { name: 'Mission Table', icon: LayoutList, color: 'text-emerald-400' }
    ]
  };

  return (
    <>
    <nav className="h-16 bg-[var(--nav-bg)] backdrop-blur-2xl border-b border-[var(--card-border)] flex items-center justify-between px-6 text-white shadow-2xl z-50 relative shrink-0 transition-colors duration-500">
      <div className="flex items-center gap-4 lg:gap-8">
        <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl" onClick={() => (window as any).toggleSidebar?.()}>
           <Grid size={24} />
        </button>
        <div className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-xl cursor-pointer transition-all active:scale-95 group">
          <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2 rounded-lg shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
            <Grid size={24} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            DTMS MATRIX
          </span>
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          {Object.keys(menuData).map(item => (
            <div key={item} className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-lg font-black transition-all hover:bg-white/10 ${activeMenu === item ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}
              >
                {item} <ChevronDown size={18} className={`opacity-50 transition-transform duration-300 ${activeMenu === item ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeMenu === item && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#1e202e] border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden"
                  >
                    <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-indigo-500/5 blur-[40px] rounded-full"></div>
                    <div className="relative space-y-1">
                      {menuData[item].map((sub: any) => (
                        <button 
                          key={sub.name}
                          onClick={() => {
                            setActiveMenu(null);
                            setActiveView(sub.name === 'Engineering Matrix' ? 'Boards' : sub.name);
                            (window as any).addToast?.(`Redirection: ${sub.name} Perspective`, 'info');
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all group"
                        >
                          <sub.icon size={20} className={`${sub.color} group-hover:scale-110 transition-transform`} />
                          <span className="font-bold text-sm text-white/80 group-hover:text-white">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {isAdmin && (
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'Create' ? null : 'Create')}
              className="bg-indigo-500 hover:bg-indigo-400 px-6 py-2 rounded-xl text-lg font-black flex items-center gap-2 ml-4 transition-all shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95"
            >
              <Plus size={20} /> Create
            </button>
            
            <AnimatePresence>
              {activeMenu === 'Create' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-72 bg-[#1e202e] border border-white/10 rounded-3xl shadow-3xl p-6"
                >
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Launch New Action</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Task', i: Laptop, c: 'bg-blue-500', action: () => (window as any).openCreateAssetModal?.('Task') },
                      { l: 'Doc', i: Layout, c: 'bg-emerald-500', action: () => setActiveView('Doc') },
                      { l: 'Folder', i: Layout, c: 'bg-amber-500', action: () => setActiveView('Folder') },
                      { l: 'Whiteboard', i: Layout, c: 'bg-pink-500', action: () => setActiveView('Whiteboard') }
                    ].map(btn => (
                      <button 
                        key={btn.l} 
                        onClick={() => {
                          setActiveMenu(null);
                          btn.action();
                        }}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/10 transition-all group border border-transparent hover:border-white/10"
                      >
                        <div className={`w-12 h-12 ${btn.c} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all`}>
                          <btn.i size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{btn.l}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>

        {/* View Switcher */}
        <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 mx-4">
          {[
            { id: 'Boards', label: 'Board', icon: LayoutGrid },
            { id: 'Mission Table', label: 'List', icon: LayoutList },
            { id: 'Gantt', label: 'Gantt', icon: GanttChart },
            { id: 'Calendar', label: 'Calendar', icon: Calendar },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => {
                setActiveView(view.id);
                (window as any).addToast?.(`Switching to ${view.label} View`, 'info');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeView === view.id 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              <view.icon size={16} />
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <SearchPopover />
        
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'Notifications' ? null : 'Notifications')}
            className={`p-2.5 rounded-xl transition-all relative ${activeMenu === 'Notifications' ? 'bg-indigo-500/20 shadow-lg shadow-indigo-500/10' : 'hover:bg-white/10'}`}
          >
            <Bell size={24} className={activeMenu === 'Notifications' ? 'text-indigo-400' : 'text-indigo-300'} />
            <span className="absolute top-2 right-2 w-3 h-3 bg-pink-500 rounded-full border-2 border-[#1e1e2e]"></span>
          </button>
          
          <AnimatePresence>
            {activeMenu === 'Notifications' && (
              <NotificationDropdown onClose={() => setActiveMenu(null)} />
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsInfoOpen(true)}
          className="hover:bg-white/10 p-2.5 rounded-xl transition-all text-slate-300 hover:text-white"
        >
          <Info size={24} />
        </button>

        {/* System Settings (Theme, Font, Language) */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'Settings' ? null : 'Settings')}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${activeMenu === 'Settings' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10 text-slate-300 hover:text-white'}`}
            title="System Settings"
          >
            <Settings size={24} className={activeMenu === 'Settings' ? 'text-indigo-400' : 'text-slate-300 transform transition-transform hover:rotate-90'} />
          </button>
          <AnimatePresence>
            {activeMenu === 'Settings' && (
              <SettingsDropdown onClose={() => setActiveMenu(null)} />
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <div 
            onClick={() => setActiveMenu(activeMenu === 'Profile' ? null : 'Profile')}
            className={`flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-2xl transition-all ${activeMenu === 'Profile' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] group-hover:rotate-6 group-hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-xs font-black italic">
                {user?.name ? (user.name.replace(/OPERATOR|Operator/gi, 'User').trim() || 'User').substring(0, 2).toUpperCase() : 'US'}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                {user?.name ? user.name.replace(/OPERATOR|Operator/gi, 'User').trim() : 'System User'}
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{user?.role || 'Operator'}</span>
            </div>
            <ChevronDown size={14} className={`text-white/20 transition-transform ${activeMenu === 'Profile' ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {activeMenu === 'Profile' && (
              <ProfileDropdown onClose={() => setActiveMenu(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
    
    <SystemInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
}
