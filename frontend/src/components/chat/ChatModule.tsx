'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, User, Shield, Zap, Search, MoreHorizontal, Phone, Video } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

let socket: any;

export default function ChatModule() {
  const user = useAuthStore(state => state.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChat, setActiveChat] = useState<any>(null); // null means Team Chat
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    if (user) {
      socket.emit('join-chat', user.id);
    }

    socket.on('receive-message', (msg: any) => {
       setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
       try {
          const [uRes, mRes] = await Promise.all([
             api.get('/users'),
             api.get(`/messages${activeChat ? `?receiverId=${activeChat.id}` : ''}`)
          ]);
          setUsers(uRes.data.filter((u: any) => u.id !== user?.id));
          setMessages(mRes.data);
       } catch (e) { console.error(e); }
    };
    fetchData();
  }, [activeChat, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const msgData = {
      content: inputValue,
      receiverId: activeChat?.id || null,
      senderId: user?.id,
      senderName: user?.name,
      createdAt: new Date().toISOString()
    };

    try {
      await api.post('/messages', msgData);
      socket.emit('send-message', msgData);
      setMessages(prev => [...prev, msgData]);
      setInputValue('');
    } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex bg-[#0a0b10] overflow-hidden">
       {/* Sidebar */}
       <div className="w-96 border-r border-white/5 flex flex-col">
          <div className="p-8 pb-4">
             <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Command Channel</h2>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-2 mb-8">Active signal matrix.</p>
             
             <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Intercept operator..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/30 transition-all text-xs"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-8">
             <button 
               onClick={() => setActiveChat(null)}
               className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all group ${!activeChat ? 'bg-indigo-500 shadow-2xl shadow-indigo-500/20' : 'hover:bg-white/5 border border-transparent hover:border-white/5'}`}
             >
                <div className={`p-3 rounded-2xl ${!activeChat ? 'bg-white/20' : 'bg-white/5 text-white/30 group-hover:text-white group-hover:bg-white/10'}`}>
                   <Users size={20} />
                </div>
                <div className="text-left font-black uppercase text-xs tracking-widest">
                   <p className={!activeChat ? 'text-white' : 'text-white/40'}>Matrix Team</p>
                   <p className={!activeChat ? 'text-white/60' : 'text-white/10 italic'}>Global Broadcast</p>
                </div>
             </button>

             <div className="pt-4 px-4 pb-2 text-[10px] font-black text-white/10 uppercase tracking-[0.2em] italic">Direct Signals</div>
             
             {filteredUsers.map(u => (
                <button 
                  key={u.id}
                  onClick={() => setActiveChat(u)}
                  className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all group ${activeChat?.id === u.id ? 'bg-indigo-500 shadow-2xl shadow-indigo-500/20' : 'hover:bg-white/5 border border-transparent hover:border-white/5'}`}
                >
                   <div className="relative">
                      <div className={`p-3 rounded-2xl ${activeChat?.id === u.id ? 'bg-white/20' : 'bg-white/5 text-white/30 group-hover:text-white group-hover:bg-white/10'}`}>
                         <User size={20} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0a0b10] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                   <div className="text-left font-black uppercase text-xs tracking-widest">
                      <p className={activeChat?.id === u.id ? 'text-white' : 'text-white/40'}>{u.name}</p>
                      <p className={activeChat?.id === u.id ? 'text-white/60 text-[8px]' : 'text-white/10 text-[8px] italic'}>{u.role}</p>
                   </div>
                </button>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 flex flex-col relative">
          {/* Header */}
          <div className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                   {activeChat ? <User size={24} /> : <Users size={24} />}
                </div>
                <div>
                   <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">{activeChat?.name || 'Matrix Team Chat'}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Live Decryption Active</span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"><Phone size={18}/></button>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"><Video size={18}/></button>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"><MoreHorizontal size={18}/></button>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-6">
             {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.id;
                return (
                   <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] ${isMine ? 'ml-auto' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{isMine ? 'YOU' : msg.senderName || msg.sender?.name}</span>
                         <span className="text-[8px] font-medium text-white/10 tracking-tighter">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`p-5 rounded-3xl text-sm font-bold leading-relaxed ${
                         isMine 
                           ? 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none shadow-[0_10px_40px_rgba(0,0,0,0.2)]' 
                           : 'bg-[#12141c] border border-white/5 text-white/80 rounded-tl-none shadow-[0_10px_40px_rgba(0,0,0,0.2)]'
                      }`}>
                         {msg.content}
                      </div>
                   </div>
                );
             })}
             <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-10 pt-4 shrink-0">
             <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-4">
                   <button className="text-white/20 hover:text-indigo-400 transition-all"><Zap size={18}/></button>
                </div>
                <input 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Encrypted transmission..."
                  className="w-full bg-[#12141c] border border-white/5 rounded-[2rem] py-6 pl-16 pr-24 text-white font-bold outline-none focus:border-indigo-500/30 transition-all text-sm placeholder:italic"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-400 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                   <Send size={20} />
                </button>
             </div>
             <p className="text-center text-[8px] font-black text-white/10 uppercase tracking-[0.4em] mt-6 italic">Secure End-to-End Encryption Protocol v4.2.0-Alpha</p>
          </div>
       </div>
    </div>
  );
}
