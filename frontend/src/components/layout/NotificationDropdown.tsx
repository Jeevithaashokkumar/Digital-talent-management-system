'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Zap, MessageSquare, AlertCircle, Shield } from 'lucide-react';

const notifications = [
    { id: 1, type: 'message', title: 'New Command Signal', desc: 'Operator 04 sent a tactical link.', time: '2m ago', unread: true },
    { id: 2, type: 'alert', title: 'System Protocol', desc: 'Neural Node sync completed successfully.', time: '15m ago', unread: true },
    { id: 3, type: 'mission', title: 'Mission Update', desc: 'Strategic Objective "Alpha" progress: 85%.', time: '1h ago', unread: false },
    { id: 4, type: 'security', title: 'Security Matrix', desc: 'Standard scan: 0 breaches detected.', time: '3h ago', unread: false }
];

const NotificationDropdown = ({ onClose }: { onClose: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-96 bg-[#12141c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
        >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                    <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Signal Feed</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Tactical Alerts & Updates</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all" title="Mark all as read">
                        <Check size={18} className="text-white/40 hover:text-emerald-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all" title="Clear all">
                        <Trash2 size={18} className="text-white/40 hover:text-rose-400" />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-2">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer group flex gap-4 ${notif.unread ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            notif.type === 'message' ? 'bg-blue-500/20 text-blue-400' :
                            notif.type === 'alert' ? 'bg-emerald-500/20 text-emerald-400' :
                            notif.type === 'security' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                            {notif.type === 'message' && <MessageSquare size={20} />}
                            {notif.type === 'alert' && <Zap size={20} />}
                            {notif.type === 'security' && <Shield size={20} />}
                            {notif.type === 'mission' && <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-black text-white truncate group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{notif.title}</h4>
                                <span className="text-[9px] font-black text-white/20 uppercase whitespace-nowrap ml-2">{notif.time}</span>
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed truncate">{notif.desc}</p>
                        </div>
                        {notif.unread && (
                            <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                        )}
                    </div>
                ))}
            </div>

            <button 
                onClick={onClose}
                className="w-full p-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-indigo-400 transition-all border-t border-white/10 bg-white/5 hover:bg-white/10"
            >
                View Full Manifest
            </button>
        </motion.div>
    );
};

export default NotificationDropdown;
