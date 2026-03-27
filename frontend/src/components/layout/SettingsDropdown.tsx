'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Type, Globe, Check, ChevronDown, Grid } from 'lucide-react';
import { useSettingsStore, LANGUAGES, FONT_SIZES } from '@/store/useSettingsStore';

export default function SettingsDropdown({ onClose }: { onClose: () => void }) {
  const { theme, fontSize, language, setTheme, setFontSize, setLanguage } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'theme' | 'font' | 'language'>('theme');

  const TABS = [
    { id: 'theme', icon: Grid, label: 'Appearance' },
    { id: 'font', icon: Type, label: 'Typography' },
    { id: 'language', icon: Globe, label: 'Language' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-4 w-80 bg-[#12141c]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
    >
      {/* Tab Bar */}
      <div className="flex border-b border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab.id
                ? 'text-indigo-400 bg-indigo-500/5'
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'scale-110' : ''} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* THEME TAB */}
        {activeTab === 'theme' && (
          <div className="space-y-3">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Select Interface Mode</p>
            {[
              { value: 'dark', icon: Moon, label: 'Dark Matrix', desc: 'Tactical night mode' },
              { value: 'light', icon: Sun, label: 'Light Mode', desc: 'High visibility mode' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value as any); onClose(); }}
                className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all duration-300 relative group overflow-hidden ${
                  theme === opt.value
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-all ${
                  theme === opt.value ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/60'
                }`}>
                  <opt.icon size={20} className={theme === opt.value ? 'animate-pulse' : ''} />
                </div>
                <div className="text-left">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${theme === opt.value ? 'text-white' : 'text-white/60'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mt-1">{opt.desc}</p>
                </div>
                {theme === opt.value && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <Check size={14} className="text-indigo-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* FONT TAB */}
        {activeTab === 'font' && (
          <div className="space-y-3">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Select Font Size</p>
            {FONT_SIZES.map((f) => (
              <button
                key={f.code}
                onClick={() => { setFontSize(f.code); onClose(); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  fontSize === f.code
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  f.code === 'sm' ? 'text-xs' : f.code === 'md' ? 'text-sm' : 'text-base'
                } ${fontSize === f.code ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/30'}`}>
                  Aa
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider">{f.label}</p>
                  <p className="text-[9px] text-white/30">{f.px}</p>
                </div>
                {fontSize === f.code && <Check size={16} className="ml-auto text-indigo-400" />}
              </button>
            ))}
          </div>
        )}

        {/* LANGUAGE TAB */}
        {activeTab === 'language' && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Select Language</p>
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); onClose(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    language === lang.code
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider">{lang.label}</p>
                    <p className="text-[10px] text-white/40">{lang.nativeLabel}</p>
                  </div>
                  {language === lang.code && <Check size={16} className="ml-auto text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
