'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cpu, Activity, Database, Zap, Globe, Info } from 'lucide-react';

const SystemInfoModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-2xl"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#12141c] border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl shadow-indigo-500/20"
                >
                    {/* Background Visuals */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Globe size={300} className="text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                                        <Shield size={24} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">System Integrity Manifest</span>
                                </div>
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">DTMS Matrix <span className="text-indigo-500 font-light italic">v4.0.2</span></h2>
                            </div>
                            <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-3xl transition-all border border-transparent hover:border-white/10">
                                <X size={24} className="text-white/40" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-4">Tactical Status</h3>
                                {[
                                    { label: 'Neural Mesh', val: 'Operational', status: 'emerald', icon: Cpu },
                                    { label: 'Data Sync', val: 'Synchronized', status: 'indigo', icon: Database },
                                    { label: 'Uptime', val: '99.99%', status: 'emerald', icon: Activity }
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all`}>
                                            <stat.icon size={20} className="text-white/60" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-white/20 mb-1">{stat.label}</div>
                                            <div className={`text-sm font-black uppercase italic tracking-wider text-${stat.status}-400`}>{stat.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Zap size={80} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Core Directives</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Optimize Agency Workflow</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Synch Neural Data Layers</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Maintain Strategic Privacy</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                            <div className="flex gap-4">
                                <button className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 border border-white/5 transition-all">Support Portal</button>
                                <button className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 border border-white/5 transition-all">Matrix Briefing</button>
                            </div>
                            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">Digital Talent Management System &copy; 2026</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SystemInfoModal;
