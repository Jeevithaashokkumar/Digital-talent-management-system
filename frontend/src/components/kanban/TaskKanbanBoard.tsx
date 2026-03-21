'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Filter, X, Tag, Calendar, User, AlertCircle, CheckCircle2, Clock, Trash2, Edit2, Flag } from 'lucide-react';
import api from '@/services/api';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500', glow: 'shadow-slate-500/20', dot: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500', glow: 'shadow-amber-500/20', dot: 'bg-amber-400' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20', dot: 'bg-emerald-400' },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  medium: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/30'     },
  high:   { label: 'High',   color: 'text-rose-400',    bg: 'bg-rose-500/20 border-rose-500/30'        },
};

export default function TaskKanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [filter, setFilter] = useState({ priority: '', assignedTo: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'todo',
    assignedTo: '', dueDate: '', labels: '',
  });
  const [formError, setFormError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.assignedTo) params.append('assignedTo', filter.assignedTo);
      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch { /* optional */ }
  }, []);

  useEffect(() => { fetchTasks(); fetchUsers(); }, [fetchTasks, fetchUsers]);

  const openCreate = (status = 'todo') => {
    setEditTask(null);
    setFormData({ title: '', description: '', priority: 'medium', status, assignedTo: '', dueDate: '', labels: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (task: any) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      labels: Array.isArray(task.labels) ? task.labels.join(', ') : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setFormError('Title is required'); return; }
    try {
      const payload = {
        ...formData,
        labels: formData.labels.split(',').map((l: string) => l.trim()).filter(Boolean),
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null,
      };
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowModal(false);
      fetchTasks();
      (window as any).addToast?.(editTask ? 'Task updated!' : 'Task created!', 'success');
    } catch (e: any) {
      setFormError(e.response?.data?.error || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      (window as any).addToast?.('Task deleted', 'error');
    } catch (e) { (window as any).addToast?.('Failed to delete', 'error'); }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const newStatus = destination.droppableId;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
      (window as any).addToast?.(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`, 'info');
    } catch {
      fetchTasks(); // revert
    }
  };

  const getColumnTasks = (colId: string) =>
    tasks.filter(t => t.status === colId);

  const formatDate = (d: string) => {
    if (!d) return null;
    const date = new Date(d);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: diff < 0, soon: diff >= 0 && diff <= 3 };
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header + Filters */}
      <div className="flex items-center justify-between px-8 pt-6 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Task Board</h2>
          <p className="text-white/40 text-sm font-medium mt-1">{tasks.length} tasks across {COLUMNS.length} stages</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter.priority}
            onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-indigo-500/50"
          >
            <option value="" className="bg-[#1e202e]">All Priorities</option>
            <option value="high" className="bg-[#1e202e]">🔴 High</option>
            <option value="medium" className="bg-[#1e202e]">🟡 Medium</option>
            <option value="low" className="bg-[#1e202e]">🟢 Low</option>
          </select>
          <button
            onClick={() => openCreate()}
            className="bg-indigo-500 hover:bg-indigo-400 px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto px-8 pb-8">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(col => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id} className="w-80 flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                  {/* Column Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-lg ${col.glow}`} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{col.title}</h3>
                      <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-black">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openCreate(col.id)}
                      className="text-white/30 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                      >
                        {loading ? (
                          [1,2].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)
                        ) : colTasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-white/20">
                            <CheckCircle2 size={28} className="mb-2" />
                            <p className="text-xs font-bold">No tasks here</p>
                          </div>
                        ) : (
                          colTasks.map((task, index) => {
                            const dateInfo = task.dueDate ? formatDate(task.dueDate) : null;
                            const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    className={`group bg-white/5 hover:bg-white/10 border border-white/10 ${snap.isDragging ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/20 rotate-1 scale-105' : 'hover:border-white/20'} rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing`}
                                  >
                                    {/* Priority + Actions */}
                                    <div className="flex items-center justify-between mb-3">
                                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${pc.bg} ${pc.color}`}>
                                        {pc.label}
                                      </span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(task)} className="text-white/40 hover:text-indigo-400 p-1 rounded-lg hover:bg-white/10 transition-all">
                                          <Edit2 size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(task.id)} className="text-white/40 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-all">
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-white font-black text-sm leading-tight mb-3 group-hover:text-indigo-300 transition-colors">
                                      {task.title}
                                    </h4>

                                    {/* Description */}
                                    {task.description && (
                                      <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
                                    )}

                                    {/* Labels */}
                                    {task.labels?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {task.labels.slice(0, 3).map((label: string) => (
                                          <span key={label} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                            {label}
                                          </span>
                                        ))}
                                        {task.labels.length > 3 && (
                                          <span className="text-[10px] font-bold text-white/30">+{task.labels.length - 3}</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Footer: due date + avatar */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                      {dateInfo ? (
                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${dateInfo.overdue ? 'text-rose-400' : dateInfo.soon ? 'text-amber-400' : 'text-white/40'}`}>
                                          <Calendar size={12} />
                                          {dateInfo.label}
                                          {dateInfo.overdue && <span className="text-rose-400">(overdue)</span>}
                                        </div>
                                      ) : <span />}

                                      {task.assignee ? (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg" title={task.assignee.name}>
                                          {task.assignee.name.substring(0, 2).toUpperCase()}
                                        </div>
                                      ) : (
                                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center" title="Unassigned">
                                          <User size={13} className="text-white/30" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-[#1e202e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-black text-white">{editTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block">Title *</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Add more details..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 font-medium resize-none"
                />
              </div>

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Clock size={12} /> Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="todo" className="bg-[#1e202e]">📋 To Do</option>
                    <option value="in-progress" className="bg-[#1e202e]">⚡ In Progress</option>
                    <option value="done" className="bg-[#1e202e]">✅ Done</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Flag size={12} /> Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="low" className="bg-[#1e202e]">🟢 Low</option>
                    <option value="medium" className="bg-[#1e202e]">🟡 Medium</option>
                    <option value="high" className="bg-[#1e202e]">🔴 High</option>
                  </select>
                </div>
              </div>

              {/* Assigned To + Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><User size={12} /> Assign To</label>
                  <select
                    value={formData.assignedTo}
                    onChange={e => setFormData(f => ({ ...f, assignedTo: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="" className="bg-[#1e202e]">Unassigned</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id} className="bg-[#1e202e]">{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Calendar size={12} /> Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Tag size={12} /> Labels</label>
                <input
                  type="text"
                  value={formData.labels}
                  onChange={e => setFormData(f => ({ ...f, labels: e.target.value }))}
                  placeholder="bug, feature, frontend..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 font-medium"
                />
                <p className="text-white/30 text-xs mt-1">Separate with commas</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 pt-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-black hover:bg-white/10 transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-wider"
              >
                {editTask ? '✓ Update Task' : '+ Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
