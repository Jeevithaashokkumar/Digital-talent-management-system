'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon, Clock } from 'lucide-react';

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
  'todo': 'hsl(245, 80%, 65%)',       // Indigo
  'in-progress': 'hsl(35, 90%, 55%)',  // Amber
  'done': 'hsl(160, 80%, 45%)',        // Emerald
  'pending': 'hsla(245, 80%, 65%, 0.6)',
  'completed': 'hsl(160, 80%, 45%)'
};

const STATUS_GLOWS: any = {
  'todo': '0 0 10px hsla(245, 80%, 65%, 0.5)',
  'in-progress': '0 0 10px hsla(35, 90%, 55%, 0.5)',
  'done': '0 0 10px hsla(160, 80%, 45%, 0.5)',
  'pending': 'none',
  'completed': '0 0 10px hsla(160, 80%, 45%, 0.5)'
};

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={goToCurrent}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-white/70 hover:text-white"
        >
          Today
        </button>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
          <button onClick={goToBack} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"><ChevronLeft size={18} /></button>
          <button onClick={goToNext} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"><ChevronRight size={18} /></button>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-indigo-400">
        {toolbar.label}
      </h2>

      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
        {['month', 'week', 'day'].map((view) => {
          const Icon = view === 'month' ? CalendarIcon : view === 'week' ? ListIcon : Clock;
          return (
            <button
              key={view}
              onClick={() => toolbar.onView(view)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${toolbar.view === view ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
            >
              <Icon size={12} /> {view}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function CalendarModule() {
  const { currentBoard } = useBoardStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks');
        const allTasks = res.data;
        
        const filteredTasks = isAdmin 
          ? allTasks 
          : allTasks.filter((t: any) => t.assignedTo === user?.id || t.createdBy === user?.id);

        const calendarEvents = filteredTasks.map((t: any) => {
          const sDate = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
          let eDate = t.dueDate ? new Date(t.dueDate) : new Date(sDate.getTime() + 24 * 60 * 60 * 1000);
          
          // Ensure end date is strictly after start date for react-big-calendar to render correctly
          if (eDate.getTime() <= sDate.getTime()) {
            eDate = new Date(sDate.getTime() + 24 * 60 * 60 * 1000);
          }
          
          return {
            id: t.id,
            title: t.title,
            start: isNaN(sDate.getTime()) ? new Date() : sDate,
            end: isNaN(eDate.getTime()) ? new Date() : eDate,
            allDay: true,
            resource: t
          };
        });

        setEvents(calendarEvents);
      } catch (e) {
        console.error("Calendar Fetch Failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, isAdmin]);

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    const backgroundColor = STATUS_COLORS[status] || 'hsla(245, 80%, 65%, 0.8)';
    const boxShadow = STATUS_GLOWS[status] || 'none';
    
    return {
      style: {
        backgroundColor,
        boxShadow,
        borderRadius: '10px',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'block',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase',
        padding: '6px 10px',
        letterSpacing: '0.05em',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[600px] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[700px] h-full bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 m-6 p-10 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex-1 w-full h-full custom-calendar relative z-10 flex flex-col">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          className="flex-1 w-full"
        />
      </div>
      <style jsx global>{`
        /* Core wrapper resets to ensure flex layout isn't broken */
        .custom-calendar .rbc-calendar {
           flex: 1;
           display: flex;
           flex-direction: column;
           min-height: 0;
        }

        /* Calendar Grid Container */
        .custom-calendar .rbc-month-view { 
          border: 1px solid rgba(255,255,255,0.05) !important; 
          border-radius: 16px !important; 
          background: rgba(0,0,0,0.2) !important;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Headers (Days of week) */
        .custom-calendar .rbc-header { 
          border-bottom: 1px solid rgba(255,255,255,0.05) !important; 
          padding: 15px 10px !important; 
          font-weight: 900 !important; 
          text-transform: uppercase !important; 
          letter-spacing: 0.15em !important; 
          color: rgba(255,255,255,0.4) !important; 
          font-size: 10px !important;
          background: transparent !important;
          border-left: none !important;
        }

        /* Grid lines */
        .custom-calendar .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.03) !important; background: transparent !important; }
        .custom-calendar .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.03) !important; background: transparent !important; }
        .custom-calendar .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05) !important; }
        .custom-calendar .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05) !important; }
        
        /* Highlight today */
        .custom-calendar .rbc-today { background: rgba(99, 102, 241, 0.05) !important; }
        .custom-calendar .rbc-off-range-bg { background: rgba(0,0,0,0.4) !important; }

        /* Date numbers */
        .custom-calendar .rbc-date-cell { 
          padding: 10px 15px !important; 
          font-weight: 800 !important; 
          color: rgba(255,255,255,0.2) !important;
          font-family: inherit !important;
          font-size: 13px !important;
        }
        .custom-calendar .rbc-date-cell.rbc-now { color: white !important; }

        /* Event layout tweaks */
        .custom-calendar .rbc-event { 
          margin-top: 2px !important;
          margin-bottom: 2px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
        }
        .custom-calendar .rbc-event:hover {
          transform: translateY(-2px);
          z-index: 50;
        }

        /* Show more link */
        .custom-calendar .rbc-show-more { 
          background: transparent !important; 
          color: #6366f1 !important; 
          font-weight: 900 !important; 
          font-size: 10px !important; 
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          padding-left: 10px !important;
          margin-top: 2px !important;
        }

        /* Scrollbar customization for webkit */
        .custom-calendar ::-webkit-scrollbar { width: 6px; }
        .custom-calendar ::-webkit-scrollbar-track { background: transparent; }
        .custom-calendar ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
