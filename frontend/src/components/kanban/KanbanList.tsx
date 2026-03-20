'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanListProps {
  list: any;
}

export default function KanbanList({ list }: KanbanListProps) {
  return (
    <div className="w-80 flex-shrink-0 bg-white/5 backdrop-blur-3xl rounded-[2rem] flex flex-col max-h-full border border-white/10 shadow-3xl transition-all duration-500 hover:shadow-indigo-500/10 group/list overflow-hidden">
      {/* List Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter">
          <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
          {list.title}
          <span className="text-xs bg-white/10 text-indigo-300 px-3 py-1 rounded-full font-black border border-white/5">
            {list.tasks?.length || 0}
          </span>
        </h3>
        <button className="text-white/30 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Cards Area */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 overflow-y-auto p-4 min-h-[100px] transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-500/5 rounded-[1.5rem] scale-[0.98]' : ''}`}
          >
            {list.tasks?.map((card: any, index: number) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging 
                        ? provided.draggableProps.style?.transform + " scale(1.08) rotate(2deg)" 
                        : provided.draggableProps.style?.transform
                    }}
                    className={`${snapshot.isDragging ? 'z-50' : 'mb-4'}`}
                  >
                    <KanbanCard card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* List Footer */}
      <div className="p-4 pt-0">
        <button 
          onClick={() => (window as any).setActiveListForTask?.(list.id)}
          className="w-full flex items-center justify-center gap-3 text-white/50 hover:text-white hover:bg-white/10 p-4 rounded-2xl text-lg font-black transition-all active:scale-[0.98] border border-transparent hover:border-white/10 group"
        >
           <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Add a card
        </button>
      </div>
    </div>
  );
}
