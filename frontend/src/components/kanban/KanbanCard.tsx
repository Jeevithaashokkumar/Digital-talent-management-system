import { Calendar, CheckSquare, MessageSquare, Paperclip, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';

interface KanbanCardProps {
  card: any;
}

export default function KanbanCard({ card }: KanbanCardProps) {
  const { user } = useAuthStore();
  const { deleteCard } = useBoardStore();
  const isAdmin = user?.role === 'admin';

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'from-rose-500 to-orange-500 shadow-rose-500/20';
      case 'medium': return 'from-amber-400 to-orange-400 shadow-amber-400/20';
      case 'low': return 'from-emerald-400 to-teal-500 shadow-emerald-400/20';
      default: return 'from-indigo-500 to-purple-500 shadow-indigo-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'in-progress': return <Clock size={14} className="text-amber-400" />;
      default: return <AlertCircle size={14} className="text-slate-400" />;
    }
  };

  return (
    <Draggable draggableId={card.id} index={card.order}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-white/5 backdrop-blur-md rounded-3xl p-6 mb-4 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:translate-y-[-4px] hover:shadow-2xl active:scale-95 ${snapshot.isDragging ? 'shadow-2xl shadow-indigo-500/50 scale-105 border-indigo-500/50' : ''}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${getPriorityColor(card.priority)} shadow-lg`}>
              {card.priority || 'standard'}
            </div>
            <div className="flex gap-2">
               {isAdmin && (
                 <>
                   <button className="text-white/20 hover:text-indigo-400 transition-colors p-1"><Edit2 size={14} /></button>
                   <button 
                    onClick={() => {
                      if (confirm("Terminate this mission?")) {
                        deleteCard?.(card.id);
                        (window as any).addToast?.("Mission Terminated", "error");
                      }
                    }}
                    className="text-white/20 hover:text-rose-400 transition-colors p-1"
                   >
                    <Trash2 size={14} />
                   </button>
                 </>
               )}
            </div>
          </div>
          
          <h3 className="text-lg font-black text-white leading-tight mb-4 tracking-tight group-hover:text-indigo-300 transition-colors">
            {card.title}
          </h3>

          <div className="flex items-center gap-2 mb-4">
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 tracking-widest">
                {getStatusIcon(card.status)}
                {card.status || 'pending'}
             </div>
          </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {card.tags?.map((t: string) => (
          <span key={t} className="px-3 py-1 rounded-lg bg-indigo-500/20 text-[10px] font-black text-indigo-300 uppercase tracking-widest border border-indigo-500/20">
            {t}
          </span>
        ))}
      </div>

      <h4 className="text-lg font-black text-white leading-tight mb-6 tracking-tight">
        {card.title}
      </h4>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-tighter">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Mission Active
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#1e1e2e] rounded-[7px] flex items-center justify-center text-[10px] font-black text-white">
                {card.assignee?.name?.substring(0, 2).toUpperCase() || 'OP'}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
