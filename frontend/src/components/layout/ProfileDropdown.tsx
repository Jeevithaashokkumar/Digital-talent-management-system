'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Shield, Activity, Zap, Circle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';

const ProfileDropdown = ({ onClose }: { onClose: () => void }) => {
    const { user, logout } = useAuthStore();
    const setActiveView = useBoardStore(state => state.setActiveView);
    const displayName = (user?.name || 'User').replace(/OPERATOR|Operator/gi, 'User').trim();

    const menuItems = [
        { label: 'Tactical Profile', icon: User, color: 'text-white/60', view: 'user-dashboard' },
        { label: 'System Settings', icon: Settings, color: 'text-white/60', view: 'admin-settings' },
        { label: 'Security Protocols', icon: Shield, color: 'text-white/60', action: () => (window as any).addToast?.('Security Protocol: Level 4 Active', 'success') },
        { label: 'Neural Activity', icon: Activity, color: 'text-white/60', view: 'admin-analytics' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-72 bg-[#12141c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
        >
            <div className="p-8 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10 border-b border-white/10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-indigo-500 to-pink-500 p-[2px] shadow-xl shadow-indigo-500/20">
                        <div className="w-full h-full bg-[#0a0b10] rounded-[calc(1.5rem-2px)] flex items-center justify-center text-xl font-black italic">
                            {displayName.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter italic uppercase truncate max-w-[140px]">{displayName}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{user?.role || 'Operator'} Matrix</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Clearance</span>
                        <span className="text-xs font-black text-white uppercase italic">Level 4</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Status</span>
                        <span className="text-xs font-black text-emerald-400 uppercase italic">Active</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-1">
                {menuItems.map((item) => (
                    <button 
                        key={item.label}
                        onClick={() => {
                            if (item.view) setActiveView(item.view);
                            if (item.action) item.action();
                            onClose();
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5"
                    >
                        <item.icon size={18} className={`${item.color} group-hover:text-indigo-400 transition-colors`} />
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                    </button>
                ))}
            </div>

            <button 
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-4 p-6 bg-rose-600/10 hover:bg-rose-600/20 transition-all border-t border-white/10 group mt-2"
            >
                <LogOut size={20} className="text-rose-500 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-black text-rose-500 uppercase tracking-[0.2em] italic">Deactivate Session</span>
            </button>
        </motion.div>
    );
};

export default ProfileDropdown;
