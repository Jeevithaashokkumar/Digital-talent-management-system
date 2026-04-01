'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, User, Shield, Zap, Search, MoreHorizontal, Phone, Video, X, Reply, Pin as PinIcon, Smile, Activity } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';
import { useCallStore } from '@/store/useCallStore';
import MessageContextMenu from './MessageContextMenu';

export default function ChatModule() {
  const user = useAuthStore((state: any) => state.user);
  const setActiveView = useBoardStore((state: any) => state.setActiveView);
  const callStore = useCallStore();
  const socket = (window as any).socket;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChat, setActiveChat] = useState<any>(null); // null means Team Chat
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: any } | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef(activeChat);
  const userRef = useRef(user);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join-chat', user.id);

    const onReceiveMessage = (msg: any) => {
       const currentActive = activeChatRef.current;
       const currentUser = userRef.current;

       // Filter: only show if for team chat (null receiverId) while in team chat
       // OR if it's a DM from the active user OR to the active user (Alice <-> Bob)
       const isForActiveChat = !currentActive 
          ? !msg.receiverId 
          : (msg.receiverId === currentActive.id || (msg.senderId === currentActive.id && msg.receiverId === currentUser?.id));

       if (isForActiveChat) {
          setMessages(prev => {
             if (prev.find(m => m.id === msg.id || (m.tempId && m.tempId === msg.tempId))) return prev;
             return [...prev, msg];
          });
       }
    };

    socket.on('receive-message', onReceiveMessage);

    socket.on('message-edited', (editedMsg: any) => {
       setMessages(prev => prev.map(m => m.id === editedMsg.id ? editedMsg : m));
    });

    socket.on('message-deleted', (id: string) => {
       setMessages(prev => prev.filter(m => m.id !== id));
    });

    socket.on('message-pinned', (pinnedMsg: any) => {
       setMessages(prev => prev.map(m => m.id === pinnedMsg.id ? pinnedMsg : m));
    });

    socket.on('message-reacted', (data: any) => {
       setMessages(prev => prev.map(m => {
          if (m.id === data.messageId) {
             const reactions = m.reactions || [];
             if (data.action === 'added') return { ...m, reactions: [...reactions, data.reaction] };
             return { ...m, reactions: reactions.filter((r: any) => r.id !== data.reaction.id) };
          }
          return m;
       }));
    });

    return () => {
      socket?.off('receive-message');
      socket?.off('message-edited');
      socket?.off('message-deleted');
      socket?.off('message-pinned');
      socket?.off('message-reacted');
    };
  }, [user, socket]);

  useEffect(() => {
    const fetchData = async () => {
       try {
          const [uRes, mRes] = await Promise.all([
             api.get('/auth/users'),
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

  const initiateCall = (type: 'voice' | 'video') => {
    if (!activeChat) return;
    callStore.setCalling(true, { id: activeChat.id, name: activeChat.name }, type);
    setActiveView('Call');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (editingMessage) {
       try {
          const res = await api.put(`/messages/${editingMessage.id}`, { content: inputValue });
          socket.emit('edit-message', { ...res.data, receiverId: editingMessage.receiverId, senderId: user?.id });
          setMessages(prev => prev.map(m => m.id === editingMessage.id ? res.data : m));
          setEditingMessage(null);
          setInputValue('');
       } catch (e) { console.error(e); }
       return;
    }

    const tempId = Date.now().toString();
    const msgData = {
      content: inputValue,
      receiverId: activeChat?.id || null,
      senderId: user?.id,
      senderName: user?.name,
      replyToId: replyingTo?.id || null,
      createdAt: new Date().toISOString(),
      tempId
    };

    // Optimistic Update
    setMessages(prev => [...prev, { ...msgData, replyTo: replyingTo }]);
    setInputValue('');
    setReplyingTo(null);

    try {
      const res = await api.post('/messages', msgData);
      socket.emit('send-message', { ...res.data, tempId });
      setMessages(prev => prev.map(m => m.tempId === tempId ? res.data : m));
    } catch (e) { 
      console.error(e);
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    }
  };

  const handleAction = async (action: string, msg: any) => {
    if (action === 'reply') setReplyingTo(msg);
    if (action === 'edit') {
       setEditingMessage(msg);
       setInputValue(msg.content);
    }
    if (action === 'delete') {
       try {
          await api.delete(`/messages/${msg.id}`);
          socket.emit('delete-message', { id: msg.id, receiverId: msg.receiverId, senderId: user?.id });
          setMessages(prev => prev.filter(m => m.id !== msg.id));
       } catch (e) { console.error(e); }
    }
    if (action === 'pin') {
       try {
          const res = await api.patch(`/messages/${msg.id}/pin`);
          socket.emit('pin-message', { ...res.data, receiverId: msg.receiverId, senderId: user?.id });
          setMessages(prev => prev.map(m => m.id === msg.id ? res.data : m));
       } catch (e) { console.error(e); }
    }
    if (action.startsWith('react:')) {
       const emoji = action.split(':')[1];
       try {
          const res = await api.post(`/messages/${msg.id}/react`, { emoji });
          socket.emit('react-message', { 
             messageId: msg.id, 
             reaction: res.data.reaction || { emoji, userId: user?.id }, 
             action: res.data.action,
             receiverId: msg.receiverId,
             senderId: user?.id
          });
          // Local update
          setMessages(prev => prev.map(m => {
             if (m.id === msg.id) {
                const reactions = m.reactions || [];
                if (res.data.action === 'added') return { ...m, reactions: [...reactions, res.data.reaction] };
                return { ...m, reactions: reactions.filter((r: any) => r.userId !== user?.id || r.emoji !== emoji) };
             }
             return m;
          }));
       } catch (e) { console.error(e); }
    }
    if (action === 'copy') {
       navigator.clipboard.writeText(msg.content);
       (window as any).addToast?.('Copied to clipboard', 'info');
    }
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
                  placeholder="Find User..."
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
                      <p className={activeChat?.id === u.id ? 'text-white' : 'text-white/40'}>{(u.name || '').replace(/OPERATOR|Operator/gi, 'User').trim() || 'User'}</p>
                      <p className={activeChat?.id === u.id ? 'text-white/60 text-[8px]' : 'text-white/10 text-[8px] italic'}>{u.role}</p>
                   </div>
                </button>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 flex flex-col relative">
          {/* Header */}
          <div className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#0c0d15]/50 backdrop-blur-md">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                   {activeChat ? <User size={24} /> : <Users size={24} />}
                </div>
                <div>
                   <h3 className="text-xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{(activeChat?.name || 'Matrix Team Chat').replace(/OPERATOR|Operator/gi, 'User').trim()}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="text-[8px] font-black text-emerald-400/60 uppercase tracking-[0.2em]">Signal Matrix Synchronized</span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => initiateCall('voice')}
                  disabled={!activeChat}
                  className={`p-3 rounded-xl transition-all ${activeChat ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                >
                  <Phone size={18}/>
                </button>
                <button 
                  onClick={() => initiateCall('video')}
                  disabled={!activeChat}
                  className={`p-3 rounded-xl transition-all ${activeChat ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                >
                  <Video size={18}/>
                </button>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"><MoreHorizontal size={18}/></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.id;
                const isSystem = msg.isSystem || msg.senderName === 'System';

                if (isSystem) {
                    return (
                        <div key={i} className="flex justify-center my-4 animate-in fade-in zoom-in duration-500">
                             <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-2 flex items-center gap-3">
                                 <Activity size={14} className="text-indigo-400" />
                                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">{msg.content}</span>
                             </div>
                        </div>
                    );
                }

                return (
                   <div 
                     key={i} 
                     className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] ${isMine ? 'ml-auto' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300 relative group/msg`}
                     onContextMenu={(e) => {
                       if (msg.tempId) return; // Can't act on non-persisted messages
                       e.preventDefault();
                       setContextMenu({ x: e.clientX, y: e.clientY, msg });
                     }}
                   >
                      <div className="flex items-center gap-2 mb-2 px-2">
                         <span className={`text-[12px] font-black uppercase tracking-widest ${isMine ? 'text-indigo-400' : 'text-white/90'}`}>
                            {isMine ? 'YOU' : msg.senderName || msg.sender?.name}
                         </span>
                         <span className="text-[10px] font-bold text-white/20 tabular-nums">[{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                         {msg.isPinned && <PinIcon size={12} className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]" />}
                      </div>

                      {/* Reply Quote */}
                      {msg.replyTo && (
                        <div className={`mb-2 p-3 rounded-2xl bg-white/5 border-l-4 border-indigo-500 max-w-full text-[10px] italic text-white/40 ${isMine ? 'mr-2' : 'ml-2'}`}>
                          <Reply size={12} className="inline mr-2 opacity-50" />
                          <span className="font-bold mr-2 text-white/60">{msg.replyTo.sender?.name}:</span>
                          {msg.replyTo.content.substring(0, 50)}{msg.replyTo.content.length > 50 ? '...' : ''}
                        </div>
                      )}

                      <div className={`p-5 rounded-3xl text-sm font-bold leading-relaxed relative ${
                         isMine 
                           ? 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none shadow-[0_10px_40px_rgba(0,0,0,0.2)]' 
                           : 'bg-[#12141c] border border-white/5 text-white/80 rounded-tl-none shadow-[0_10px_40px_rgba(0,0,0,0.2)]'
                      }`}>
                         {msg.content}
                         
                         {/* Reactions */}
                         {msg.reactions && msg.reactions.length > 0 && (
                           <div className={`absolute -bottom-4 ${isMine ? 'right-0' : 'left-0'} flex gap-1`}>
                             {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => (
                               <div key={emoji} className="bg-[#1a1c26] border border-white/10 rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 shadow-xl">
                                 <span>{emoji}</span>
                                 <span className="text-white/40">{msg.reactions.filter((r: any) => r.emoji === emoji).length}</span>
                               </div>
                             ))}
                           </div>
                         )}
                      </div>

                      {/* Options Toggle */}
                      <button 
                        onClick={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           setContextMenu({ x: rect.left, y: rect.bottom, msg });
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 ${isMine ? '-left-8' : '-right-8'} p-2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-white/20 hover:text-white`}
                      >
                         <Smile size={16} />
                      </button>
                   </div>
                );
             })}
             <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-10 pt-4 shrink-0">
             {/* Reply Preview */}
             {replyingTo && (
               <div className="mb-4 p-4 bg-white/5 border-l-4 border-indigo-500 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-2">
                 <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Replying to {replyingTo.senderName || replyingTo.sender?.name}</p>
                   <p className="text-xs text-white/40 italic">{replyingTo.content.substring(0, 100)}</p>
                 </div>
                 <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-white/10 rounded-xl text-white/20"><X size={18}/></button>
               </div>
             )}

             {/* Editing Indicator */}
             {editingMessage && (
               <div className="mb-4 p-4 bg-amber-500/5 border-l-4 border-amber-500 rounded-2xl flex justify-between items-center">
                 <div>
                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Editing Mode</p>
                   <p className="text-xs text-white/40 italic">Modify your signal matrix transmission.</p>
                 </div>
                 <button onClick={() => { setEditingMessage(null); setInputValue(''); }} className="p-2 hover:bg-white/10 rounded-xl text-white/20"><X size={18}/></button>
               </div>
             )}

             <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-4">
                   <button className="text-white/20 hover:text-indigo-400 transition-all"><Zap size={18}/></button>
                </div>
                <input 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={editingMessage ? "Update transmission..." : "Encrypted transmission..."}
                  className="w-full bg-[#12141c] border border-white/5 rounded-[2rem] py-6 pl-16 pr-24 text-white font-bold outline-none focus:border-indigo-500/30 transition-all text-sm placeholder:italic"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-400 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                   {editingMessage ? <Shield size={20} /> : <Send size={20} />}
                </button>
             </div>
             <p className="text-center text-[8px] font-black text-white/10 uppercase tracking-[0.4em] mt-6 italic">Secure End-to-End Encryption Protocol v4.2.0-Alpha</p>
          </div>

          {contextMenu && (
            <MessageContextMenu 
              x={contextMenu.x} 
              y={contextMenu.y} 
              onClose={() => setContextMenu(null)}
              onAction={(action: string) => handleAction(action, contextMenu.msg)}
              isMine={contextMenu.msg.senderId === user?.id}
            />
          )}
       </div>
    </div>
  );
}
