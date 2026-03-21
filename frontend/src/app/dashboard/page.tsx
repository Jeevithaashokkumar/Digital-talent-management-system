'use client';

import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Navbar from '@/components/layout/Navbar';
import BoardHeader from '@/components/kanban/BoardHeader';
import KanbanList from '@/components/kanban/KanbanList';
import CreateListModal from '@/components/kanban/CreateListModal';
import CreateAssetModal from '@/components/layout/CreateAssetModal';
import TaskKanbanBoard from '@/components/kanban/TaskKanbanBoard';
import DocModule from '@/components/docs/DocModule';
import FolderModule from '@/components/folders/FolderModule';
import WhiteboardModule from '@/components/whiteboards/WhiteboardModule';
import NeuralNodesModule from '@/components/nodes/NeuralNodesModule';
import KnowledgeGraphModule from '@/components/knowledge/KnowledgeGraphModule';
import MissionTableModule from '@/components/missions/MissionTableModule';
import AdminOverview from '@/components/admin/AdminOverview';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import AnalyticsModule from '@/components/admin/AnalyticsModule';
import AdminSidebar from '@/components/layout/AdminSidebar';
import UserSidebar from '@/components/layout/UserSidebar';
import UserOverview from '@/components/user/UserOverview';
import ChatModule from '@/components/chat/ChatModule';
import CallModule from '@/components/call/CallModule';
import ToastContainer from '@/components/ui/ToastContainer';
import { useBoardStore } from '@/store/useBoardStore';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Plus, LayoutGrid, LayoutList, Settings, Users, Activity, Search, Bell, Info, Share, Zap, Filter, MoreHorizontal, CheckCircle2, Clock, Trash2, Edit2, Layout, Grid, Folder as FolderIcon, FileText, Monitor } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const user = useAuthStore(state => state.user);
  const fetchUser = useAuthStore(state => state.fetchUser);
  const currentBoard = useBoardStore(state => state.currentBoard);
  const fetchBoardDetails = useBoardStore(state => state.fetchBoardDetails);
  const moveCard = useBoardStore(state => state.moveCard);
  const loading = useBoardStore(state => state.loading);
  const activeView = useBoardStore(state => state.activeView);
  const setActiveView = useBoardStore(state => state.setActiveView);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [assetToCreate, setAssetToCreate] = useState<'Task' | 'Doc' | 'Folder' | 'Whiteboard' | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [whiteboards, setWhiteboards] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<any>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<any>({});
  const [userStats, setUserStats] = useState<any>({});
  const [toasts, setToasts] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';

  // Calculate Stats
  const allTasks = currentBoard?.lists.flatMap(l => l.tasks) || [];
  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const { docService, folderService, whiteboardService } = await import('@/services/boardService');
      const [dRes, fRes, wRes] = await Promise.all([
        docService.getDocs(),
        folderService.getFolders(),
        whiteboardService.getWhiteboards()
      ]);
      setDocs(dRes.data);
      setFolders(fRes.data);
      setWhiteboards(wRes.data);
    } catch (e) {
      console.error("Neural Fetch Failed:", e);
    }
  }, []); // Empty dependency array means it only runs on mount (or if dependencies change, but we removed them)

  const fetchAdminStats = useCallback(async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/analytics/admin');
        setAdminStats(res.data);
      } catch (e) {
        console.error("Admin Stats Failed:", e);
      }
    }
  }, [isAdmin]);

  const fetchUserStats = useCallback(async () => {
    if (!isAdmin) {
      try {
        const res = await api.get('/analytics/user');
        setUserStats(res.data);
      } catch (e) {
        console.error("User Stats Failed:", e);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUser();
    fetchBoardDetails('default');
    fetchInitialData();
    fetchAdminStats();
    fetchUserStats();
    
    if (isAdmin && activeView === 'Boards') {
      setActiveView('admin-dashboard');
    } else if (!isAdmin && activeView === 'Boards') {
      setActiveView('user-dashboard');
    }

    (window as any).setActiveListForTask = (id: string) => {
       setAssetToCreate('Task');
    };
    (window as any).openCreateAssetModal = (type: any) => setAssetToCreate(type);
    (window as any).addToast = addToast;
    (window as any).toggleSidebar = () => setSidebarOpen(prev => !prev);
  }, [fetchBoardDetails, fetchUser, fetchInitialData, fetchAdminStats, isAdmin]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveCard(draggableId, destination.droppableId, destination.index);
  };

  const handleCreateList = async (title: string) => {
    addToast(`List '${title}' Initialized`, 'success');
    await useBoardStore.getState().fetchBoardDetails('default'); 
  };

  const handleCreateAsset = async (data: any) => {
    const { docService, folderService, whiteboardService } = await import('@/services/boardService');
    try {
      if (assetToCreate === 'Task') {
        const firstListId = currentBoard?.lists[0]?.id;
        if (firstListId) {
          await useBoardStore.getState().addCard(firstListId, data);
          addToast(`Mission '${data.title}' Launched`, 'success');
        } else {
          addToast("No operative list found for mission deployment.", "error");
        }
      } else if (assetToCreate === 'Doc') {
        const res = await docService.createDoc(data);
        setDocs([...docs, res.data]);
        addToast(`Doc '${data.title}' Initialized`, 'success');
      } else if (assetToCreate === 'Folder') {
        const res = await folderService.createFolder(data);
        setFolders([...folders, res.data]);
        addToast(`Folder '${data.title}' Structuralized`, 'success');
      } else if (assetToCreate === 'Whiteboard') {
        const res = await whiteboardService.createWhiteboard(data);
        setWhiteboards([...whiteboards, res.data]);
        addToast(`Whiteboard '${data.title}' Spawned`, 'success');
      }
      setAssetToCreate(null);
    } catch (e) {
      addToast("Asset Initialization Collision Detected", "error");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f111a] overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Modals Layer */}
      <CreateListModal 
        isOpen={isAddingList} 
        onClose={() => setIsAddingList(false)} 
        onSubmit={handleCreateList} 
      />
      <CreateAssetModal 
        isOpen={!!assetToCreate} 
        onClose={() => setAssetToCreate(null)} 
        onSubmit={handleCreateAsset}
        type={assetToCreate as any}
      />
      {/* 3D Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-rose-500/5 blur-[80px] rounded-full"></div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden z-10 relative">
        {isAdmin ? (
          <AdminSidebar />
        ) : (
          <UserSidebar isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Board Main Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <BoardHeader title={activeView === 'Boards' ? (currentBoard?.title || "Digital Talent Matrix") : activeView} />
          
          <div className="flex-1 overflow-hidden relative">
            {activeView === 'Boards' && (
              <TaskKanbanBoard />
            )}

            {activeView === 'user-dashboard' && (
              <UserOverview stats={userStats} />
            )}

            {activeView === 'Chat' && (
              <ChatModule />
            )}

            {activeView === 'Call' && (
              <CallModule />
            )}

            {activeView === 'Doc' && (
              <DocModule />
            )}

            {activeView === 'Whiteboard' && (
              <WhiteboardModule />
            )}

            {activeView === 'Neural Nodes' && (
              <NeuralNodesModule />
            )}

            {activeView === 'Knowledge Graph' && (
              <KnowledgeGraphModule />
            )}

            {activeView === 'Mission Table' && (
              <MissionTableModule />
            )}

            {activeView === 'Folder' && (
              <FolderModule />
            )}

            {activeView === 'admin-dashboard' && (
              <AdminOverview stats={adminStats} />
            )}

            {activeView === 'admin-users' && (
              <UserManagement />
            )}

            {activeView === 'admin-settings' && (
              <SystemSettings />
            )}

            {activeView === 'admin-analytics' && (
              <AnalyticsModule stats={adminStats} />
            )}

            {activeView === 'admin-tasks' && (
              <div className="h-full overflow-hidden flex flex-col">
                 <div className="p-8 pb-0">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Global Directives</h2>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2 mb-6">Manage every task across the matrix.</p>
                 </div>
                 <div className="flex-1 overflow-auto custom-scrollbar px-8 pb-8">
                    <TaskKanbanBoard />
                 </div>
              </div>
            )}

            {activeView === 'admin-missions' && (
              <div className="h-full overflow-hidden flex flex-col">
                 <div className="p-8 pb-0">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Strategic Objectives</h2>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2 mb-6">Coordinate global missions and team assignments.</p>
                 </div>
                 <div className="flex-1 overflow-auto custom-scrollbar px-8 pb-8">
                    <MissionTableModule />
                 </div>
              </div>
            )}

            {activeView === 'Global Operations' && (
              <div className="p-10 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                <h2 className="text-4xl font-black text-white tracking-tighter">Global Operations Nexus</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { node: 'EMEA Nexus', load: '82%', latency: '12ms', status: 'Optimal' },
                     { node: 'APAC Matrix', load: '45%', latency: '28ms', status: 'Optimal' }
                   ].map(node => (
                     <div key={node.node} className="bg-indigo-500/5 border border-indigo-500/20 p-8 rounded-3xl group hover:bg-indigo-500/10 transition-all">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-lg font-black text-white">{node.node}</span>
                           <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{node.status}</span>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between text-xs font-black uppercase text-white/40"><span>Throughput</span> <span>{node.load}</span></div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-[82%]"></div>
                           </div>
                           <div className="text-[10px] font-black uppercase text-indigo-400">Response: {node.latency}</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeView === 'Mission Table' && (
              <div className="p-10 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-black text-white tracking-tighter">Mission Manifest (Table View)</h2>
                  <button className="bg-indigo-500 hover:bg-indigo-400 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Export CSV</button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Mission ID</th>
                        <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Title</th>
                        <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                        <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Priority</th>
                        <th className="p-6 text-[10px] font-black text-white/40 uppercase tracking-widest">Assignee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTasks.map(task => (
                        <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                          <td className="p-6 text-xs font-mono text-indigo-400">{task.id.substring(0, 8)}</td>
                          <td className="p-6 text-sm font-black text-white group-hover:text-indigo-300">{task.title}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-black uppercase tracking-tighter border border-white/10">{task.status || 'pending'}</span>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {task.priority || 'standard'}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">{task.assignee?.name?.substring(0, 2).toUpperCase() || 'OP'}</div>
                               <span className="text-xs font-bold text-white/60">{task.assignee?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'Core System' && (
              <div className="p-10 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                <h2 className="text-4xl font-black text-white tracking-tighter">System Integrity Matrix</h2>
                <div className="space-y-6">
                  {['Database Node 01', 'Auth Gateway', 'Asset Storage', 'API Mesh'].map((sys, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
                        <span className="text-xl font-black text-white tracking-tight">{sys}</span>
                      </div>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 rounded-xl bg-white/5 text-white/40 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">Diagnostics</button>
                        <button className="px-6 py-2 rounded-xl bg-indigo-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20">Active</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}
