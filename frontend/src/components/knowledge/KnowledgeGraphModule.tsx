'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { 
  Network, 
  Search, 
  Filter, 
  RefreshCcw, 
  Zap, 
  User as UserIcon, 
  FileText, 
  CheckCircle2, 
  X,
  Plus,
  ArrowRight,
  Maximize2,
  Minimize2,
  Database
} from 'lucide-react';
import api from '@/services/api';

interface KNode {
  id: string;
  name: string;
  type: string;
  sourceId?: string | null;
  val: number;
  color: string;
  x?: number;
  y?: number;
}

interface KLink {
  source: string | KNode;
  target: string | KNode;
  type: string;
  label: string;
}

export default function KnowledgeGraphModule() {
  const [graphData, setGraphData] = useState<{ nodes: KNode[], links: KLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const fgRef = useRef<any>(null);

  const fetchKnowledge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge/nodes');
      const nodes = res.data;
      
      const formattedNodes: any = [];
      const formattedLinks: any = [];
      const nodeMap = new Map();

      nodes.forEach((n: any) => {
        const node = {
          id: n.id,
          name: n.name,
          type: n.type,
          sourceId: n.sourceId,
          val: n.type === 'user' ? 15 : 10,
          color: n.type === 'task' ? '#3b82f6' : 
                 n.type === 'user' ? '#10b981' : 
                 n.type === 'document' ? '#f59e0b' : '#a855f7'
        };
        formattedNodes.push(node);
        nodeMap.set(n.id, node);
      });

      nodes.forEach((n: any) => {
        n.outgoing.forEach((rel: any) => {
          formattedLinks.push({
            source: rel.sourceNodeId,
            target: rel.targetNodeId,
            type: rel.relationType,
            label: rel.relationType.replace('_', ' ')
          });
        });
      });

      setGraphData({ nodes: formattedNodes, links: formattedLinks });
    } catch (e) {
      console.error('Failed to fetch knowledge graph', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/knowledge/sync');
      await fetchKnowledge();
      (window as any).addToast?.('Knowledge Matrix Synchronized', 'success');
    } catch (e) {
      console.error(e);
      (window as any).addToast?.('Sync Failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredData = {
    nodes: graphData.nodes.filter((n: KNode) => 
      (filterType === 'all' || n.type === filterType) &&
      (n.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    links: graphData.links.filter((l: KLink) => {
      const sId = typeof l.source === 'object' ? (l.source as KNode).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as KNode).id : l.target;
      
      const sourceNode = graphData.nodes.find(n => n.id === sId);
      const targetNode = graphData.nodes.find(n => n.id === tId);
      
      return sourceNode && targetNode && 
             (filterType === 'all' || sourceNode.type === filterType || targetNode.type === filterType) &&
             (sourceNode.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              targetNode.name.toLowerCase().includes(searchTerm.toLowerCase()));
    })
  };

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0 && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 100);
      }, 500);
    }
  }, [graphData]);

  return (
    <div className="h-full bg-[#0a0b10] flex flex-col relative overflow-hidden">
      {/* Header Controls */}
      <div className="p-8 pb-4 flex justify-between items-center z-50">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Network size={36} className="text-blue-500" /> Knowledge Matrix
          </h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">Universal entity relationship visualizer.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              placeholder="Search Matrix..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-blue-500/50 transition-all w-64"
            />
          </div>
          
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all appearance-none pr-10 cursor-pointer"
          >
            <option value="all" className="bg-[#12141c]">All Types</option>
            <option value="task" className="bg-[#12141c]">Tasks</option>
            <option value="user" className="bg-[#12141c]">Users</option>
            <option value="document" className="bg-[#12141c]">Documents</option>
            <option value="concept" className="bg-[#12141c]">Concepts</option>
          </select>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-2xl shadow-blue-500/20 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} /> 
            {isSyncing ? 'Synchronizing...' : 'Sync Graph'}
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div ref={containerRef} className="flex-1 relative cursor-move">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-white/40 text-xs font-black uppercase tracking-widest animate-pulse">Initializing Neural Network...</p>
            </div>
          </div>
        ) : filteredData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center gap-6 p-12 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-xl">
                <Network size={64} className="text-blue-500/30" />
                <div className="text-center">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Knowledge Matrix Empty</h3>
                   <p className="text-white/30 text-xs font-bold mt-2 uppercase tracking-widest">No neural connections detected. Synchronize your systems to begin mapping.</p>
                </div>
                <button 
                  onClick={handleSync}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all"
                >
                  Initiate First Sync
                </button>
             </div>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={filteredData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel="name"
            nodeRelSize={6}
            nodeVal="val"
            linkColor={() => 'rgba(255,255,255,0.05)'}
            linkWidth={0.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Inter, sans-serif`;
              const textWidth = ctx.measureText(label).width;
              // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val/2 + 2, 0, 2*Math.PI);
              ctx.fill();

              ctx.fillStyle = node.color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val/2, 0, 2*Math.PI);
              ctx.fill();

              if (globalScale > 3) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.font = `bold ${4/globalScale}px Inter`;
                ctx.fillText(node.type.toUpperCase(), node.x, node.y + (node.val/2 + 3));
              }
            }}
            onNodeClick={(node) => setSelectedNode(node)}
            backgroundColor="#0a0b10"
          />
        )}

        {/* Legend */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Tasks</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Users</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Concepts</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Docs</span>
           </div>
        </div>
      </div>

      {/* Side Detail Panel */}
      {selectedNode && (
        <div className="absolute right-8 top-8 bottom-8 w-96 bg-[#12141c]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl z-[60] animate-in slide-in-from-right duration-300">
          <button 
            onClick={() => setSelectedNode(null)} 
            className="absolute top-6 right-6 p-3 hover:bg-white/5 rounded-2xl text-white/40 transition-colors"
          >
            <X size={20}/>
          </button>
          
          <div className="h-full flex flex-col">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${
              selectedNode.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
              selectedNode.type === 'user' ? 'bg-emerald-500/20 text-emerald-400' :
              selectedNode.type === 'document' ? 'bg-amber-500/20 text-amber-400' : 'bg-fuchsia-500/20 text-fuchsia-400'
            }`}>
              {selectedNode.type === 'user' ? <UserIcon size={32} /> : 
               selectedNode.type === 'document' ? <FileText size={32} /> : 
               selectedNode.type === 'task' ? <CheckCircle2 size={32} /> : <Zap size={32} />}
            </div>

            <h3 className="text-3xl font-black text-white mb-2 tracking-tight uppercase leading-none">{selectedNode.name}</h3>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic">Reference: {selectedNode.id.split('-')[0]}</p>
            
            <div className="space-y-8 flex-1">
              <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Entity Metadata</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Type</p>
                    <p className="text-sm font-black text-white uppercase">{selectedNode.type}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Status</p>
                    <p className="text-sm font-black text-emerald-500 uppercase">Synced</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Neural Connections</label>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {graphData.links
                    .filter(l => {
                      const sId = typeof l.source === 'object' ? (l.source as KNode).id : l.source;
                      const tId = typeof l.target === 'object' ? (l.target as KNode).id : l.target;
                      return sId === selectedNode.id || tId === selectedNode.id;
                    })
                    .map((l: KLink, idx) => {
                      const sId = typeof l.source === 'object' ? (l.source as KNode).id : l.source;
                      const tId = typeof l.target === 'object' ? (l.target as KNode).id : l.target;
                      
                      const isSource = sId === selectedNode.id;
                      const connectedNodeId = isSource ? tId : sId;
                      const connectedNode = graphData.nodes.find(n => n.id === connectedNodeId);
                      
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-4 group hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${connectedNode?.color || 'bg-white'}`} />
                            <div>
                               <p className="text-[10px] font-black text-white tracking-widest uppercase">{connectedNode?.name || 'Unknown'}</p>
                               <p className="text-[8px] font-bold text-white/30 uppercase">{l.label}</p>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-white/20 group-hover:text-white/60" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                onClick={() => {
                  // Logic to navigate to original entity
                  (window as any).addToast?.(`Opening ${selectedNode.type}...`, 'info');
                }}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                Open Entity <Database size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
