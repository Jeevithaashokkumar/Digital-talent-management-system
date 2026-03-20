'use client';

import { motion } from 'framer-motion';
import { Pen, Square, Circle, Type, Eraser, Move, ZoomIn, ZoomOut, Save, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WhiteboardProps {
  board: any;
  onSave: (id: string, data: any) => void;
  onBack: () => void;
}

export default function WhiteboardCanvas({ board, onSave, onBack }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'square' | 'circle' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#6366f1');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        
        // Load existing data if any
        if (board.data && board.data.image) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = board.data.image;
        }
      }
    }
  }, [board.id]);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = tool === 'eraser' ? '#1e202e' : color;
      ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || tool !== 'pen') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'square' || tool === 'circle') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      if (tool === 'square') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = { image: canvas.toDataURL() };
      onSave(board.id, data);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full bg-[#0f111a] rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl"
    >
      {/* Control Bar */}
      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="font-black text-white/80 uppercase tracking-widest text-sm">{board.title}</span>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
          {[
            { id: 'pen', icon: Pen },
            { id: 'square', icon: Square },
            { id: 'circle', icon: Circle },
            { id: 'eraser', icon: Eraser },
            { id: 'move', icon: Move }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTool(t.id as any)}
              className={`p-2 rounded-xl transition-all ${tool === t.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <t.icon size={18} />
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
          />
        </div>

        <button 
          onClick={handleSave}
          className="bg-emerald-500 hover:bg-emerald-400 px-5 py-2 rounded-xl text-white font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs"
        >
          <Save size={16} /> Save Board
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden bg-[#1e202e]">
        <canvas 
          ref={canvasRef}
          width={2000}
          height={2000}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          className="absolute top-0 left-0"
        />
      </div>
    </motion.div>
  );
}
