'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Zap, 
  MessageSquare, 
  Video, 
  Palette, 
  Shield, 
  Bell, 
  Smartphone,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function SystemSettings() {
  const [collab, setCollab] = useState({
    chat: true,
    call: true,
    whiteboard: true
  });

  const [automation, setAutomation] = useState({
    autoAssign: true,
    statusAlerts: false
  });

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
          <Settings size={36} className="text-slate-400" /> Core Configuration
        </h2>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">Universal system parameters and automation rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Collaboration Control */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                 <Zap size={24} />
              </div>
              <div>
                 <h4 className="text-xl font-black text-white uppercase tracking-tighter">Collaboration Control</h4>
                 <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Global module availability.</p>
              </div>
           </div>

           <div className="space-y-6">
              {[
                { id: 'chat', label: 'Neural Chat', icon: <MessageSquare size={18}/>, enabled: collab.chat },
                { id: 'call', label: 'Signal Call', icon: <Video size={18}/>, enabled: collab.call },
                { id: 'whiteboard', label: 'Omni Canvas', icon: <Palette size={18}/>, enabled: collab.whiteboard }
              ].map((item) => (
                <div key={item.id} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${item.enabled ? 'text-blue-400 bg-blue-500/10' : 'text-white/20 bg-white/5'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-sm font-black uppercase tracking-tight ${item.enabled ? 'text-white' : 'text-white/30'}`}>{item.label}</span>
                   </div>
                   <button 
                     onClick={() => setCollab(prev => ({...prev, [item.id]: !item.enabled}))}
                     className={`transition-colors ${item.enabled ? 'text-blue-500' : 'text-white/10'}`}
                   >
                      {item.enabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Automation Rules */}
        <div className="bg-[#12141c]/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl flex flex-col h-full">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-fuchsia-500/10 rounded-2xl text-fuchsia-400">
                 <Shield size={24} />
              </div>
              <div>
                 <h4 className="text-xl font-black text-white uppercase tracking-tighter">System Automation</h4>
                 <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Reactive system triggers.</p>
              </div>
           </div>

           <div className="space-y-6 flex-1">
              <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                       <h5 className="text-white font-black uppercase tracking-tight">Auto-Assign Protocol</h5>
                       <p className="text-white/40 text-[10px] font-bold mt-1 uppercase tracking-widest">Assign tasks to idle members automatically.</p>
                    </div>
                    <button onClick={() => setAutomation(a => ({...a, autoAssign: !a.autoAssign}))}>
                       {automation.autoAssign ? <ToggleRight className="text-blue-500" size={32} /> : <ToggleLeft className="text-white/20" size={32} />}
                    </button>
                 </div>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group">
                 <div className="flex justify-between items-start">
                    <div>
                       <h5 className="text-white/60 font-black uppercase tracking-tight">Status Threshold Alerts</h5>
                       <p className="text-white/20 text-[10px] font-bold mt-1 uppercase tracking-widest">Notify admins when missions reach 90%.</p>
                    </div>
                    <button onClick={() => setAutomation(a => ({...a, statusAlerts: !a.statusAlerts}))}>
                       {automation.statusAlerts ? <ToggleRight className="text-fuchsia-500" size={32} /> : <ToggleLeft className="text-white/10" size={32} />}
                    </button>
                 </div>
              </div>
           </div>

           <button className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-[0.2em] text-xs">
              Commit System State
           </button>
        </div>
      </div>
    </div>
  );
}
