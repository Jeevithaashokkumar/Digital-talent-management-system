import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { format } from 'date-fns';

const STATUS_COLORS: any = {
  'todo': 'hsla(245, 80%, 65%, 1)',       // Indigo
  'in-progress': 'hsla(35, 90%, 55%, 1)',  // Amber
  'done': 'hsla(160, 80%, 45%, 1)',        // Emerald
  'pending': 'hsla(245, 80%, 65%, 0.5)',
  'completed': 'hsla(160, 80%, 45%, 1)'
};

const CustomTaskListHeader = ({ headerHeight }: any) => {
  return (
    <div
      className="flex items-center border-b border-t border-white/10 bg-black/40 backdrop-blur-md"
      style={{ height: headerHeight, fontFamily: 'inherit' }}
    >
      <div className="flex-1 px-6 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Name</div>
      <div className="w-28 px-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] text-center">From</div>
      <div className="w-28 px-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] text-center">To</div>
    </div>
  );
};

const CustomTaskListTable = ({ rowHeight, rowWidth, tasks }: any) => {
  return (
    <div className="flex flex-col bg-black/20" style={{ width: rowWidth, fontFamily: 'inherit' }}>
      {tasks.map((t: any) => (
        <div
          key={t.id}
          className="flex items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ height: rowHeight }}
        >
          <div className="flex-1 px-6 text-[11px] font-bold text-white/80 truncate uppercase tracking-widest">{t.name}</div>
          <div className="w-28 px-4 text-[10px] text-white/40 uppercase font-medium tracking-wider text-center">
            {format(t.start, 'MMM d')}
          </div>
          <div className="w-28 px-4 text-[10px] text-white/40 uppercase font-medium tracking-wider text-center">
             {format(t.end, 'MMM d')}
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ task }: any) => {
  return (
    <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 min-w-[220px]">
      <div className="text-white font-black uppercase tracking-widest text-[11px] border-b border-white/10 pb-3 mb-1">
        {task.name}
      </div>
      <div className="flex justify-between items-center text-[10px] text-white/40 tracking-[0.1em] font-black uppercase">
        <span>Start</span>
        <span className="text-indigo-400">{format(task.start, 'MMM d, yyyy')}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] text-white/40 tracking-[0.1em] font-black uppercase">
        <span>Due</span>
        <span className="text-emerald-400">{format(task.end, 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};

export default function GanttModule() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks');
        const allTasks = res.data;
        
        const filteredTasks = isAdmin 
          ? allTasks 
          : allTasks.filter((t: any) => t.assignedTo === user?.id || t.createdBy === user?.id);

        if (filteredTasks.length === 0) {
          setTasks([]);
          return;
        }

        const ganttTasks = filteredTasks.map((t: any) => {
          const startDate = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
          const endDate = t.dueDate ? new Date(t.dueDate) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          
          return {
            id: t.id,
            name: t.title,
            start: isNaN(startDate.getTime()) ? new Date() : startDate,
            end: isNaN(endDate.getTime()) ? new Date() : endDate,
            progress: t.status === 'done' || t.status === 'completed' ? 100 : t.status === 'in-progress' ? 50 : 0,
            type: 'task',
            project: 'DTMS',
            styles: {
              backgroundColor: STATUS_COLORS[t.status] || 'hsla(245, 80%, 65%, 1)',
              backgroundSelectedColor: 'rgba(255,255,255,0.8)',
              progressColor: 'rgba(255,255,255,0.3)',
              progressSelectedColor: 'rgba(0,0,0,0.2)',
            }
          } as Task;
        });
        
        setTasks(ganttTasks);
      } catch (e) {
        console.error("Gantt Fetch Failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, isAdmin]);

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-inner">
           <span className="text-white/10 text-4xl font-black">∅</span>
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Temporal Void</h3>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 max-w-sm leading-relaxed">No tactical data points detected in the current timeline. Initialize task vectors to visualize.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[600px] overflow-hidden bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 m-6 p-6 shadow-2xl relative">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="h-full w-full custom-gantt" style={{ height: 'calc(100vh - 350px)' }}>
        <Gantt 
          tasks={tasks}
          viewMode={ViewMode.Day}
          onDateChange={handleDateChange}
          listCellWidth="350px"
          columnWidth={65}
          headerHeight={60}
          rowHeight={60}
          barCornerRadius={12}
          handleWidth={10}
          fontFamily="inherit"
          fontSize="11px"
          todayColor="rgba(99, 102, 241, 0.15)"
          TaskListHeader={CustomTaskListHeader}
          TaskListTable={CustomTaskListTable}
          TooltipContent={CustomTooltip}
        />
      </div>
      <style jsx global>{`
        /* Make sure all SVG text matches dark theme */
        .custom-gantt svg text {
          fill: rgba(255, 255, 255, 0.6) !important;
          font-family: inherit !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }

        /* SVG Grid lines */
        .custom-gantt svg line {
          stroke: rgba(255, 255, 255, 0.05) !important;
        }

        /* Hide the default white calendar background elements */
        .custom-gantt svg > g > rect:first-child {
          fill: transparent !important;
        }
        
        /* Bar text color inside tasks */
        .custom-gantt .barLabel {
          fill: white !important;
          font-weight: 900 !important;
          font-size: 10px !important;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
          pointer-events: none;
        }

        /* Task pill styling */
        .custom-gantt svg > g.barWrapper {
          cursor: pointer;
        }
        
        /* The container logic */
        .custom-gantt > div > div {
           border-radius: 16px;
           overflow: hidden;
        }
        
        /* Ensure the right pane container is transparent to show our glass bg */
        .custom-gantt ._3G9n_ { background: transparent !important; }
        .custom-gantt ._2_o-V { border-color: rgba(255,255,255,0.05) !important; }
      `}</style>
    </div>
  );
}
