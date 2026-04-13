'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { io, Socket } from 'socket.io-client';
import { 
  Pencil, Square, Circle, Type, Eraser, MousePointer2, 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize,
  Trash2, Download, Save, Triangle, Star, Heart
} from 'lucide-react';
import api from '@/services/api';

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api$/, '');
};

const socket: Socket = io(getSocketUrl());

interface WhiteboardCanvasProps {
  whiteboard: any;
}

export default function WhiteboardCanvas({ whiteboard }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(3);
  const [zoom, setZoom] = useState(1);
  const isRemoteAction = useRef(false);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 64,
      height: window.innerHeight - 64,
      backgroundColor: '#0f111a',
      isDrawingMode: true,
    });

    fabricRef.current = canvas;

    // Join socket room
    socket.emit('join-whiteboard', whiteboard.id);

    // Load initial data
    if (whiteboard.data) {
      try {
        const parsed = JSON.parse(whiteboard.data);
        canvas.loadFromJSON(parsed, () => {
           canvas.renderAll();
        });
      } catch (e) {
        console.error('Failed to load whiteboard data', e);
      }
    }

    // Socket listeners
    socket.on('remote-canvas-update', (data: any) => {
      if (data.whiteboardId !== whiteboard.id || !fabricRef.current) return;
      isRemoteAction.current = true;
      
      const canvas = fabricRef.current;
      try {
        if (data.type === 'clear') {
          canvas.clear();
          canvas.backgroundColor = '#0f111a';
          canvas.renderAll();
        } else {
          canvas.loadFromJSON(data.fullState, () => {
            canvas.renderAll();
            isRemoteAction.current = false;
          });
        }
      } catch (e) {
        console.error('Remote sync error', e);
        isRemoteAction.current = false;
      }
    });

    // Interaction Events
    const handleSync = () => {
      if (isRemoteAction.current || !fabricRef.current) return;
      const json = fabricRef.current.toJSON();
      socket.emit('canvas-update', {
        whiteboardId: whiteboard.id,
        fullState: json,
        type: 'update'
      });
      autoSave(json);
    };

    canvas.on('object:added', handleSync);
    canvas.on('object:modified', handleSync);
    canvas.on('object:removed', handleSync);

    // Responsive resize
    const resize = () => {
      if (!fabricRef.current) return;
      fabricRef.current.setDimensions({
        width: window.innerWidth - 64,
        height: window.innerHeight - 64
      });
      fabricRef.current.renderAll();
    };
    window.addEventListener('resize', resize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', resize);
      socket.off('remote-canvas-update');
    };
  }, [whiteboard.id]);

  // Auto-save logic
  const autoSaveTimeout = useRef<NodeJS.Timeout|null>(null);
  const autoSave = (data: any) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(async () => {
        try {
            await api.put(`/whiteboards/${whiteboard.id}`, { data: JSON.stringify(data) });
        } catch (e) {
            console.error('Auto-save failed', e);
        }
    }, 2000);
  };

  // Tool Selection Logic
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'pencil';
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, color, brushSize]);

  const addShape = (type: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setActiveTool('select');
    
    let shape;
    const common = { left: 100, top: 100, fill: color, stroke: color, strokeWidth: 2 };

    switch (type) {
      case 'rect': shape = new fabric.Rect({ ...common, width: 100, height: 100 }); break;
      case 'circle': shape = new fabric.Circle({ ...common, radius: 50 }); break;
      case 'triangle': shape = new fabric.Triangle({ ...common, width: 100, height: 100 }); break;
      case 'star':
        // Custom path for star
        shape = new fabric.Path('M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z', { ...common, scaleX: 1.5, scaleY: 1.5 });
        break;
      case 'heart':
        shape = new fabric.Path('M 272.7 51.2 c -49.6 -49.6 -130.2 -49.6 -179.9 0 c -49.6 49.6 -49.6 130.2 0 179.9 L 272.7 411 l 179.9 -179.9 c 49.6 -49.6 49.6 -130.2 0 -179.9 C 403 1.6 322.4 1.6 272.7 51.2 z', { ...common, scaleX: 0.2, scaleY: 0.2 });
        break;
    }

    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
    }
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setActiveTool('text');
    const text = new fabric.IText('Double click to edit', {
      left: 100, top: 100, fontFamily: 'Inter', fontSize: 20, fill: color
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleClear = () => {
    if (!confirm('Clear entire canvas?')) return;
    fabricRef.current?.clear();
    fabricRef.current!.backgroundColor = '#0f111a';
    socket.emit('canvas-update', { whiteboardId: whiteboard.id, type: 'clear' });
  };

  const handleZoom = (val: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let nextZoom = canvas.getZoom() * val;
    if (nextZoom > 20) nextZoom = 20;
    if (nextZoom < 0.01) nextZoom = 0.01;
    canvas.setZoom(nextZoom);
    setZoom(nextZoom);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1c1f2e]/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl z-50">
        <ToolButton active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} icon={<Pencil size={18} />} label="Pen" />
        <ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={<MousePointer2 size={18} />} label="Select" />
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        <ToolButton active={false} onClick={() => addShape('rect')} icon={<Square size={18} />} label="Rectangle" />
        <ToolButton active={false} onClick={() => addShape('circle')} icon={<Circle size={18} />} label="Circle" />
        <ToolButton active={false} onClick={() => addShape('triangle')} icon={<Triangle size={18} />} label="Triangle" />
        <ToolButton active={false} onClick={() => addShape('star')} icon={<Star size={18} />} label="Star" />
        <ToolButton active={false} onClick={() => addShape('heart')} icon={<Heart size={18} />} label="Heart" />
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        <ToolButton active={activeTool === 'text'} onClick={addText} icon={<Type size={18} />} label="Text" />
        <ToolButton active={activeTool === 'eraser'} onClick={() => {
            const canvas = fabricRef.current;
            if (canvas) {
                const activeObjects = canvas.getActiveObjects();
                canvas.discardActiveObject();
                activeObjects.forEach((obj: fabric.Object) => canvas.remove(obj));
            }
        }} icon={<Eraser size={18} />} label="Delete Selection" />
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        <div className="flex items-center gap-2 px-3">
          <input 
            type="color" 
            value={color} 
            onChange={e => setColor(e.target.value)} 
            className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer overflow-hidden p-0" 
          />
          <select 
            value={brushSize} 
            onChange={e => setBrushSize(parseInt(e.target.value))}
            className="bg-transparent text-white text-xs font-bold outline-none border-none"
          >
            {[2,5,10,20].map(s => <option key={s} value={s} className="bg-[#1c1f2e]">{s}px</option>)}
          </select>
        </div>
      </div>

      {/* Side Actions (Zoom/History) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[#1c1f2e]/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl z-50">
        <ToolButton active={false} onClick={() => handleZoom(1.1)} icon={<ZoomIn size={18} />} label="Zoom In" />
        <div className="text-[10px] font-black text-white/40 text-center">{Math.round(zoom * 100)}%</div>
        <ToolButton active={false} onClick={() => handleZoom(0.9)} icon={<ZoomOut size={18} />} label="Zoom Out" />
        <div className="w-6 h-[1px] bg-white/10 mx-auto" />
        <ToolButton active={false} onClick={handleClear} icon={<Trash2 size={18} className="text-rose-400" />} label="Clear All" />
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-[#0f111a] cursor-crosshair">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`p-3 rounded-xl transition-all relative group
        ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 px-2 py-1 bg-black text-[10px] font-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
        {label}
      </span>
    </button>
  );
}
