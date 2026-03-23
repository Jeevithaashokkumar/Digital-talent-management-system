'use client';

import React from 'react';
import { 
  Quote, 
  Edit2, 
  Forward, 
  Copy, 
  Trash2, 
  Pin, 
  MailWarning, 
  BookOpen, 
  MoreHorizontal,
  Plus
} from 'lucide-react';

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  isMine: boolean;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function MessageContextMenu({ x, y, onClose, onAction, isMine }: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x, y });

  React.useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let newX = x + 10;
      let newY = y - 20; // Offset to not be directly under cursor
      
      if (newX + rect.width > window.innerWidth) {
        newX = x - rect.width - 10;
      }
      if (newY + rect.height > window.innerHeight) {
        newY = window.innerHeight - rect.height - 10;
      }
      if (newY < 10) newY = 10;
      
      setPos({ x: newX, y: newY });
    }
  }, [x, y]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-[1000] bg-[#1e1f23] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-w-[220px] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ left: pos.x, top: pos.y }}
      onMouseLeave={onClose}
    >
      {/* Reactions Bar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5">
        {REACTIONS.map(emoji => (
          <button 
            key={emoji} 
            onClick={() => { onAction(`react:${emoji}`); onClose(); }}
            className="text-lg hover:scale-125 transition-transform p-1.5 hover:bg-white/5 rounded-lg"
          >
            {emoji}
          </button>
        ))}
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/40"><Plus size={16}/></button>
      </div>

      {/* Menu Actions */}
      <div className="p-1.5">
        <MenuButton icon={<Quote size={16}/>} label="Reply with quote" onClick={() => onAction('reply')} />
        
        {isMine && <MenuButton icon={<Edit2 size={16}/>} label="Edit" onClick={() => onAction('edit')} />}
        
        <MenuButton icon={<Forward size={16}/>} label="Forward" onClick={() => onAction('forward')} />
        <MenuButton icon={<Copy size={16}/>} label="Copy link" onClick={() => onAction('copy')} />
        
        {isMine && <MenuButton icon={<Trash2 size={16}/>} label="Delete" variant="danger" onClick={() => onAction('delete')} />}
        
        <MenuButton icon={<Pin size={16}/>} label="Pin for everyone" onClick={() => onAction('pin')} />
        
        <div className="h-px bg-white/5 my-1.5 mx-2" />
        
        <MenuButton icon={<MailWarning size={16}/>} label="Mark as unread" onClick={() => onAction('unread')} />
        <MenuButton icon={<BookOpen size={16}/>} label="Immersive Reader" onClick={() => onAction('reader')} />
        
        <div className="h-px bg-white/5 my-1.5 mx-2" />
        
        <MenuButton icon={<MoreHorizontal size={16}/>} label="More actions" showArrow onClick={() => {}} />
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, variant = 'default', showArrow = false }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
        variant === 'danger' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-white/80 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={variant === 'danger' ? 'text-rose-400' : 'text-white/40'}>{icon}</span>
        {label}
      </div>
      {showArrow && <span className="text-white/20 text-lg">›</span>}
    </button>
  );
}
