'use client';

import React, { useMemo } from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { AlertCircle, Clock, BellOff, BellRing, ChevronRight, Zap } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

export default function DeadlineReminderAlert() {
  const currentBoard = useBoardStore(state => state.currentBoard);
  const updateCard = useBoardStore(state => state.updateCard);

  const alerts = useMemo(() => {
    if (!currentBoard) return [];

    const allTasks = currentBoard.lists.flatMap(list => list.tasks);
    
    return allTasks
      .filter(task => task.dueDate && task.reminderStatus !== false && task.status !== 'completed')
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        const daysLeft = differenceInDays(dueDate, new Date());
        const overdue = isPast(dueDate) && !isToday(dueDate);
        
        // Auto Priority Logic
        let autoPriority = 'LOW';
        let alertColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        let pulse = false;

        if (overdue || isToday(dueDate)) {
          autoPriority = 'URGENT';
          alertColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
          pulse = true;
        } else if (daysLeft <= 1) {
          autoPriority = 'HIGH';
          alertColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
          pulse = true;
        } else if (daysLeft <= 3) {
          autoPriority = 'MEDIUM';
          alertColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        }

        return {
          ...task,
          daysLeft,
          overdue,
          autoPriority,
          alertColor,
          pulse
        };
      })
      .filter(alert => alert.overdue || alert.daysLeft <= 1) // Only show serious alerts
      .sort((a, b) => (a.overdue ? -1 : 1));
  }, [currentBoard]);

  const toggleReminder = async (taskId: string, status: boolean) => {
    try {
      await updateCard(taskId, { reminderStatus: status });
    } catch (error) {
      console.error("Failed to update reminder status:", error);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-6 bg-black/20 backdrop-blur-3xl border-y border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <BellRing className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Temporal Alerts</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Active Deadline Monitoring System</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
          {alerts.length} Conflicts Detected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((task) => (
          <div 
            key={task.id} 
            className={`relative group bg-[#0a0a0a]/80 border ${task.overdue ? 'border-rose-500/30' : 'border-indigo-500/20'} rounded-2xl p-4 transition-all hover:scale-[1.02] hover:bg-[#111111] overflow-hidden`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[40px] opacity-20 rounded-full ${task.overdue ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">ID: {task.id.slice(0, 8)}</span>
                  <h4 className="text-sm font-black text-white uppercase leading-tight group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${task.alertColor} ${task.pulse ? 'animate-pulse' : ''}`}>
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="text-[9px] font-black tracking-tighter uppercase">{task.autoPriority}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-1.5">
                    {task.overdue ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] font-black text-rose-500 uppercase">Missed Deadline</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] font-black text-white/40 uppercase">Closing In</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Time Remaining</span>
                  <span className={`text-[10px] font-black uppercase ${task.overdue ? 'text-rose-400' : 'text-white/60'}`}>
                    {task.overdue ? `Overdue by ${Math.abs(task.daysLeft)} days` : `${task.daysLeft} Days Left`}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Deadline Date</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                       {format(new Date(task.dueDate!), 'MMM dd, yyyy')}
                    </span>
                 </div>
                 <button 
                  onClick={() => toggleReminder(task.id, false)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90"
                  title="Disable Reminder"
                 >
                    <BellOff className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
