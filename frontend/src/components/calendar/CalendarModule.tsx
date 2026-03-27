'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const STATUS_COLORS: any = {
  'todo': '#6366f1',
  'in-progress': '#f59e0b',
  'done': '#10b981',
  'pending': '#6366f1',
  'completed': '#10b981'
};

export default function CalendarModule() {
  const { currentBoard } = useBoardStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const events = useMemo(() => {
    if (!currentBoard) return [];
    
    const allTasks = currentBoard.lists.flatMap(l => l.tasks);
    
    const filteredTasks = isAdmin 
      ? allTasks 
      : allTasks.filter(t => t.assignedTo === user?.id || t.createdBy === user?.id);

    return filteredTasks.map(t => ({
      id: t.id,
      title: t.title,
      start: t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt),
      end: t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt),
      allDay: true,
      resource: t
    }));
  }, [currentBoard, user, isAdmin]);

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    const backgroundColor = STATUS_COLORS[status] || '#6366f1';
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase',
        padding: '4px 8px'
      }
    };
  };

  return (
    <div className="flex-1 min-h-[600px] bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/5 m-6 p-8 overflow-hidden flex flex-col">
      <div className="flex-1 custom-calendar" style={{ height: 'calc(100vh - 300px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
        />
      </div>
      <style jsx global>{`
        .custom-calendar .rbc-header { border-bottom: 2px solid rgba(255,255,255,0.05); padding: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); font-size: 10px; }
        .custom-calendar .rbc-month-view { border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; background: rgba(0,0,0,0.1); }
        .custom-calendar .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05); }
        .custom-calendar .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05); }
        .custom-calendar .rbc-today { background: rgba(99, 102, 241, 0.05); }
        .custom-calendar .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
        .custom-calendar .rbc-toolbar button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; padding: 8px 16px; font-weight: 900; text-transform: uppercase; margin: 0 4px; transition: all 0.2s; }
        .custom-calendar .rbc-toolbar button:hover { background: rgba(255,255,255,0.1); }
        .custom-calendar .rbc-toolbar button.rbc-active { background: #6366f1; border-color: #6366f1; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
        .custom-calendar .rbc-toolbar-label { font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 1.25rem; color: white; }
        .custom-calendar .rbc-date-cell { padding: 10px; font-weight: 900; color: rgba(255,255,255,0.2); }
        .custom-calendar .rbc-current-time-indicator { background-color: #f43f5e; }
        .custom-calendar .rbc-show-more { background: transparent; color: #6366f1; font-weight: 900; font-size: 10px; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
