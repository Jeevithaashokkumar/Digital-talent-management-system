'use client';

import { motion } from 'framer-motion';
import { Bold, Italic, Type, List, Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DocEditorProps {
  doc: any;
  onSave: (id: string, content: string, title: string) => void;
  onBack: () => void;
}

export default function DocEditor({ doc, onSave, onBack }: DocEditorProps) {
  const [content, setContent] = useState(doc.content || '');
  const [title, setTitle] = useState(doc.title || '');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content || '';
    }
  }, [doc.id]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  };

  const handleSave = () => {
    if (editorRef.current) {
      onSave(doc.id, editorRef.current.innerHTML, title);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-[#1e202e] rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl"
    >
      {/* Toolbar */}
      <div className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-2xl font-black text-white outline-none focus:ring-0 placeholder:text-white/10 w-64"
            placeholder="Untitled Doc..."
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => execCommand('bold')} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"><Bold size={20} /></button>
          <button onClick={() => execCommand('italic')} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"><Italic size={20} /></button>
          <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all font-bold">H1</button>
          <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all font-bold">H2</button>
          <button onClick={() => execCommand('insertUnorderedList')} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"><List size={20} /></button>
        </div>

        <button 
          onClick={handleSave}
          className="bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 rounded-2xl text-white font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Save size={20} /> Sync
        </button>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto p-16 custom-scrollbar">
        <div 
          ref={editorRef}
          contentEditable
          onInput={() => setContent(editorRef.current?.innerHTML || '')}
          className="max-w-4xl mx-auto min-h-full outline-none text-white/80 text-xl leading-relaxed font-medium prose prose-invert"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
    </motion.div>
  );
}
