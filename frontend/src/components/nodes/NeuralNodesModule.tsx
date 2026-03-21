'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  applyEdgeChanges, 
  applyNodeChanges,
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Brain, Zap, Trash2, Edit3, X, Save, Search, ArrowLeft, Layers, Calendar, Activity } from 'lucide-react';
import api from '@/services/api';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function NeuralNodesModule() {
  const [view, setView] = useState<'list' | 'graph'>('list');
  const [graphs, setGraphs] = useState<any[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<any>(null);
  
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'idea', priority: 'medium' });
  const [graphFormData, setGraphFormData] = useState({ title: '', description: '' });

  // Fetch all graphs
  const fetchGraphs = async () => {
    try {
      const res = await api.get('/graphs');
      setGraphs(res.data);
    } catch (e) {
      console.error('Failed to fetch graphs', e);
    }
  };

  // Fetch nodes for a specific graph
  const fetchNodes = async (graphId: string) => {
    try {
      const res = await api.get(`/nodes?graphId=${graphId}`);
      const dbNodes = res.data;

      const flowNodes = dbNodes.map((n: any) => ({
        id: n.id,
        type: 'default',
        data: { label: n.title, ...n },
        position: n.position ? JSON.parse(n.position) : { x: Math.random() * 400, y: Math.random() * 400 },
        className: `rounded-2xl border-none p-4 shadow-3xl text-white font-bold text-center w-48 ${
          n.type === 'idea' ? 'bg-indigo-500/80' : 
          n.type === 'task' ? 'bg-emerald-500/80' : 
          n.type === 'insight' ? 'bg-amber-500/80' : 'bg-pink-500/80'
        }`
      }));

      const flowEdges: Edge[] = [];
      dbNodes.forEach((n: any) => {
        const links = JSON.parse(n.linkedNodes || "[]");
        links.forEach((targetId: string) => {
          flowEdges.push({
            id: `e-${n.id}-${targetId}`,
            source: n.id,
            target: targetId,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
          });
        });
      });

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (e) {
      console.error('Failed to fetch nodes', e);
    }
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  const handleCreateGraph = async () => {
    if (!graphFormData.title.trim()) return;
    try {
      const res = await api.post('/graphs', graphFormData);
      setGraphs([...graphs, { ...res.data, _count: { nodes: 0 } }]);
      setShowGraphModal(false);
      setGraphFormData({ title: '', description: '' });
      (window as any).addToast?.('New Matrix Initialized', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGraph = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Destroy this entire neural matrix? All nodes will be lost.')) return;
    try {
      await api.delete(`/graphs/${id}`);
      setGraphs(graphs.filter(g => g.id !== id));
      (window as any).addToast?.('Matrix Deleted', 'warning');
    } catch (e) {
      console.error(e);
    }
  };

  const enterGraph = (graph: any) => {
    setSelectedGraph(graph);
    fetchNodes(graph.id);
    setView('graph');
  };

  // React Flow Handlers
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    async (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      }, eds));
      
      if (params.source && params.target && selectedGraph) {
        try {
          const sourceNode = nodes.find(n => n.id === params.source);
          if (sourceNode) {
            const currentLinks = JSON.parse(sourceNode.data.linkedNodes || "[]");
            if (!currentLinks.includes(params.target)) {
              await api.put(`/nodes/${params.source}`, { 
                linkedNodes: [...currentLinks, params.target] 
              });
            }
          }
        } catch (e) {
            console.error('Failed to update link', e);
        }
      }
    },
    [nodes, selectedGraph]
  );

  const onNodeDragStop = useCallback(async (event: any, node: Node) => {
    try {
      await api.put(`/nodes/${node.id}`, { position: node.position });
    } catch (e) {
      console.error('Failed to save position', e);
    }
  }, []);

  const handleSaveNode = async () => {
    if (!formData.title.trim() || !selectedGraph) return;
    try {
      if (isEditing && selectedNode) {
        const res = await api.put(`/nodes/${selectedNode.id}`, formData);
        setSelectedNode(res.data);
      } else {
        await api.post('/nodes', {
          ...formData,
          graphId: selectedGraph.id,
          position: { x: 100, y: 100 },
          linkedNodes: []
        });
      }
      fetchNodes(selectedGraph.id);
      setShowNodeModal(false);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNode = async (id: string) => {
    if (!confirm('Destroy this neural node?')) return;
    try {
      await api.delete(`/nodes/${id}`);
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (view === 'list') {
    return (
      <div className="h-full bg-[#0a0b10] p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
                <Brain size={56} className="text-indigo-500" /> Neural Matrixes
              </h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] mt-4 ml-1">Your collective consciousness storage.</p>
            </div>
            <button 
              onClick={() => setShowGraphModal(true)}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus size={24} strokeWidth={3} /> New Matrix
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {graphs.map(graph => (
              <div 
                key={graph.id}
                onClick={() => enterGraph(graph)}
                className="group relative bg-[#12141c] border border-white/5 hover:border-indigo-500/50 rounded-[2.5rem] p-10 cursor-pointer transition-all hover:translate-y-[-8px] hover:shadow-3xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => deleteGraph(graph.id, e)} className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all"><Trash2 size={20}/></button>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                   <Layers size={32} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{graph.title}</h3>
                <p className="text-white/30 text-sm font-bold mb-8 line-clamp-2 leading-relaxed tracking-wide">{graph.description || 'No neural description provided for this node network.'}</p>
                
                <div className="flex items-center gap-6 text-white/20 font-black text-[10px] uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <Activity size={14} className="text-indigo-500" />
                      <span>{graph._count?.nodes || 0} Neural Nodes</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(graph.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))}

            {graphs.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/10">
                    <Brain size={48} />
                 </div>
                 <h3 className="text-2xl font-black text-white/20 uppercase tracking-widest">No Active Matrixes Detected</h3>
                 <p className="text-white/10 mt-2 font-bold">Initialize a new matrix to begin mapping collective intelligence.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Graph Modal */}
        {showGraphModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <div className="bg-[#12141c] border border-white/10 w-full max-w-xl rounded-[3rem] p-12 shadow-3xl animate-in zoom-in duration-300">
              <h2 className="text-4xl font-black text-white mb-10 tracking-tighter italic uppercase">Initialize Matrix</h2>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Matrix Signature (Title)</label>
                  <input 
                    autoFocus
                    placeholder="Project Hyperion..."
                    value={graphFormData.title}
                    onChange={e => setGraphFormData({...graphFormData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-indigo-500/50 transition-all font-black text-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Neural Overview</label>
                  <textarea 
                    placeholder="Mapping the core architecture of..."
                    value={graphFormData.description}
                    onChange={e => setGraphFormData({...graphFormData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-indigo-500/50 transition-all font-bold h-40 resize-none text-lg"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowGraphModal(false)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm">Abort</button>
                  <button onClick={handleCreateGraph} className="flex-1 py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 uppercase tracking-widest text-sm">Boot Matrix</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0b10] flex flex-col relative overflow-hidden">
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(e, n) => setSelectedNode(n.data)}
          fitView
          className="bg-[#0a0b10]"
        >
          <Panel position="top-left" className="m-6 z-50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setView('list'); fetchGraphs(); }}
                  className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Brain size={32} className="text-indigo-500" /> {selectedGraph?.title}
                  </h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Neural Matrix Interface - Active Session</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ title: '', description: '', type: 'idea', priority: 'medium' });
                    setShowNodeModal(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-500/20"
                >
                  <Plus size={20} strokeWidth={3} /> Ignite Node
                </button>
                <button 
                  onClick={() => {
                    if (selectedGraph) fetchNodes(selectedGraph.id);
                    (window as any).addToast?.('Neural Matrix Synchronized', 'success');
                  }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black transition-all border border-white/5"
                >
                  <Save size={20} /> Sync Matrix
                </button>
              </div>
            </div>
          </Panel>
          <Background color="#1c1f2e" gap={40} size={1} />
          <Controls className="!bg-[#1c1f2e] !border-none !fill-white" />
          <MiniMap className="!bg-[#1c1f2e] !border-white/5" maskColor="rgba(0,0,0,0.5)" nodeColor="#6366f1" />
        </ReactFlow>
      </div>

      {/* Node Modals & Side Panel (Existing logic but with isEditing use) */}
      {selectedNode && (
        <div className="absolute right-6 top-6 bottom-6 w-96 bg-[#12141c]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl z-50 animate-in slide-in-from-right duration-300">
           <button onClick={() => setSelectedNode(null)} className="absolute top-6 right-6 p-3 hover:bg-white/5 rounded-2xl text-white/40"><X size={20}/></button>
           <div className="h-full flex flex-col">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                selectedNode.type === 'idea' ? 'bg-indigo-500/20 text-indigo-400' : 
                selectedNode.type === 'task' ? 'bg-emerald-500/20 text-emerald-400' : 
                selectedNode.type === 'insight' ? 'bg-amber-500/20 text-amber-400' : 'bg-pink-500/20 text-pink-400'
              }`}>
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{selectedNode.title}</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed font-medium">{selectedNode.description || 'No neural context provided.'}</p>
              
              <div className="space-y-6 flex-1">
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-white/20">Node Type</span>
                    <span className="text-white">{selectedNode.type}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-white/20">Priority</span>
                    <span className="text-white">{selectedNode.priority}</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => {
                    setFormData({
                      title: selectedNode.title,
                      description: selectedNode.description || '',
                      type: selectedNode.type,
                      priority: selectedNode.priority
                    });
                    setIsEditing(true);
                    setShowNodeModal(true);
                  }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all"
                >
                  Edit Node
                </button>
                <button onClick={() => deleteNode(selectedNode.id)} className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all"><Trash2 size={20}/></button>
              </div>
           </div>
        </div>
      )}

      {showNodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#12141c] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">
              {isEditing ? 'Reconfigure Neural Node' : 'Initialize Neural Node'}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Node Title</label>
                <input 
                  autoFocus
                  placeholder="Title..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Neural Context</label>
                <textarea 
                  placeholder="Context..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-bold h-32 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Classification</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none"
                   >
                     <option value="idea">Idea</option>
                     <option value="task">Task</option>
                     <option value="insight">Insight</option>
                     <option value="note">Note</option>
                   </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Priority Vector</label>
                   <select 
                     value={formData.priority}
                     onChange={e => setFormData({...formData, priority: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none"
                   >
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                   </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setShowNodeModal(false); setIsEditing(false); }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all">Abort</button>
                <button onClick={handleSaveNode} className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20">
                  {isEditing ? 'Synchronize Core' : 'Ignite Consciousness'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
