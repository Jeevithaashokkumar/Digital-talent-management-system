'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, CheckCircle2, User, Layout, ArrowRight, Zap, Database } from 'lucide-react';

const SearchPopover = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const mockupResults = [
        { type: 'Directive', title: 'Global Sync Alpha', status: 'In Progress', icon: Zap, color: 'text-amber-400' },
        { type: 'Manifest', title: 'Tactical Report Q1', status: 'Draft', icon: FileText, color: 'text-blue-400' },
        { type: 'Operator', title: 'Agent Sterling', status: 'Active', icon: User, color: 'text-emerald-400' },
        { type: 'System', title: 'Neural Matrix V4', status: 'Stable', icon: Database, color: 'text-purple-400' },
    ];

    return (
        <div className="relative group flex items-center">
            <Search className="absolute left-3.5 text-white/40 group-focus-within:text-indigo-400 transition-colors pointer-events-none" size={20} />
            <input 
                type="text" 
                placeholder="Search the Matrix..." 
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(e.target.value.length > 0);
                }}
                onFocus={() => query.length > 0 && setIsOpen(true)}
                className="bg-white/10 border border-white/10 focus:bg-[#12141c]/90 focus:text-white focus:border-indigo-500/50 w-64 py-2.5 pl-11 pr-4 rounded-xl text-base font-medium outline-none transition-all placeholder:text-white/30 backdrop-blur-md"
            />
            {query && (
                <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-3 p-1 hover:bg-white/10 rounded-lg">
                    <X size={14} className="text-white/40" />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-4 w-[400px] bg-[#12141c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Neural Index Results</span>
                            <span className="text-[9px] font-black text-white/20 uppercase">4 matches found</span>
                        </div>

                        <div className="space-y-2">
                            {mockupResults.map((result, idx) => (
                                <button 
                                    key={idx}
                                    className="w-full p-4 hover:bg-white/5 rounded-3xl border border-transparent hover:border-white/10 transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${result.color} group-hover:scale-110 transition-transform`}>
                                            <result.icon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{result.type}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">{result.status}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight italic">{result.title}</h4>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-white/0 group-hover:text-indigo-400 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">Ctrl + K</span>
                                <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">Esc</span>
                            </div>
                            <button className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors">Advanced Indexing</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchPopover;
