'use client';

import React, { useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';

const STATUS_COLORS: any = {
  'todo': '#6366f1',       // Indigo
  'in-progress': '#f59e0b', // Amber
  'done': '#10b981',       // Emerald
  'pending': '#6366f1',
  'completed': '#10b981'
};

export default function GanttModule() {
  const { currentBoard, updateTask } = useBoardStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const tasks = useMemo(() => {
    if (!currentBoard) return [];
    
    const allTasks = currentBoard.lists.flatMap(l => l.tasks);
    
    // Filter by role
    const filteredTasks = isAdmin 
      ? allTasks 
      : allTasks.filter(t => t.assignedTo === user?.id || t.createdBy === user?.id);

    if (filteredTasks.length === 0) return [];

    return filteredTasks.map(t => ({
      id: t.id,
      name: t.title,
      start: t.startDate ? new Date(t.startDate) : new Date(t.createdAt),
      end: t.dueDate ? new Date(t.dueDate) : new Date(new Date(t.createdAt).getTime() + 24 * 60 * 60 * 1000),
      progress: t.status === 'done' || t.status === 'completed' ? 100 : t.status === 'in-progress' ? 50 : 0,
      type: 'task',
      project: 'DTMS',
      styles: {
        backgroundColor: STATUS_COLORS[t.status] || '#6366f1',
        backgroundSelectedColor: '#4f46e5',
        progressColor: '#ffffff',
        progressSelectedColor: '#ffffff',
      }
    } as Task));
  }, [currentBoard, user, isAdmin]);

  const handleDateChange = async (task: Task) => {
    try {
      await (useBoardStore.getState() as any).updateCard(task.id, {
        startDate: task.start,
        dueDate: task.end
      });
      (window as any).addToast?.(`Timeline Updated: ${task.name}`, 'success');
    } catch (e) {
      (window as any).addToast?.(`Neural Timeline Collision`, 'error');
    }
  };

  if (!currentBoard || tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
           <span className="text-white/20 font-black">∅</span>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest">No Temporal Data</h3>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Initialize tasks with start and due dates to visualize timeline.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[600px] overflow-hidden bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/5 m-6 p-4">
      <div className="h-full w-full custom-gantt" style={{ height: 'calc(100vh - 300px)' }}>
        <Gantt 
          tasks={tasks}
          viewMode={ViewMode.Day}
          onDateChange={handleDateChange}
          listCellWidth=""
          columnWidth={60}
          headerHeight={50}
          rowHeight={50}
          barCornerRadius={8}
          handleSize={8}
          fontFamily="inherit"
          fontSize="12px"
        />
      </div>
      <style jsx global>{`
        .custom-gantt ._39_f3 { background: transparent !important; color: white !important; }
        .custom-gantt ._39_f3 div { color: white !important; }
        .custom-gantt ._2_o-V { border-color: rgba(255,255,255,0.05) !important; }
        .custom-gantt ._3G9n_ { background: rgba(255,255,255,0.02) !important; }
        .custom-gantt ._2v8_s { background: #6366f1 !important; height: 4px !important; margin-top: 23px !important; }
        .custom-gantt ._1_P_j { color: rgba(255,255,255,0.4) !important; font-weight: 900 !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; }
      `}</style>
    </div>
  );
}
