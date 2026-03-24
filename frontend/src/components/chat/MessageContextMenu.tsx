import React from 'react';
import { Reply, Edit2, Trash2, Copy, Pin, Smile } from 'lucide-react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  isMine: boolean;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ x, y, onClose, onAction, isMine }) => {
  React.useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  const items = [
    { id: 'reply', label: 'Reply', icon: <Reply size={14} />, color: 'text-indigo-400' },
    { id: 'copy', label: 'Copy Text', icon: <Copy size={14} />, color: 'text-white/60' },
    { id: 'pin', label: 'Pin Message', icon: <Pin size={14} />, color: 'text-amber-400' },
  ];

  if (isMine) {
    items.push(
      { id: 'edit', label: 'Edit', icon: <Edit2 size={14} />, color: 'text-emerald-400' },
      { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, color: 'text-rose-400' }
    );
  }

  const reactions = ['👍', '❤️', '🔥', '😮', '👏', '✅'];

  return (
    <div 
      className="fixed z-[100] bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-around p-2 border-b border-white/5 mb-1 bg-white/5 rounded-t-xl">
        {reactions.map(emoji => (
          <button 
            key={emoji} 
            onClick={() => onAction(`react:${emoji}`)}
            className="hover:scale-125 transition-transform p-1 text-sm"
          >
            {emoji}
          </button>
        ))}
      </div>
      
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onAction(item.id)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
        >
          <span className={`${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageContextMenu;
