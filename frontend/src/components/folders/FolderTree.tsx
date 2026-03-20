'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronRight, FileText, Layout, Database, Zap, Plus } from 'lucide-react';
import { useState } from 'react';

interface FolderTreeProps {
  folders: any[];
  onSelectFolder: (id: string) => void;
  activeFolder: string | null;
}

const TreeItem = ({ item, level, onSelectFolder, activeFolder }: { item: any, level: number, onSelectFolder: (id: string) => void, activeFolder: string | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = activeFolder === item.id;

  return (
    <div className="flex flex-col">
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          onSelectFolder(item.id);
        }}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${isSelected ? 'bg-indigo-500/20 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'}`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          <ChevronRight size={16} className="text-white/20" />
        </div>
        <Folder size={18} className={isSelected ? 'text-indigo-400' : 'text-amber-400/60'} />
        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.name}</span>
      </div>

      <AnimatePresence>
        {isOpen && item.subFolders && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {item.subFolders.map((sub: any) => (
              <TreeItem key={sub.id} item={sub} level={level + 1} onSelectFolder={onSelectFolder} activeFolder={activeFolder} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FolderTree({ folders, onSelectFolder, activeFolder }: FolderTreeProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Hierarchy</h3>
        <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all">
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {folders.map(folder => (
          <TreeItem key={folder.id} item={folder} level={0} onSelectFolder={onSelectFolder} activeFolder={activeFolder} />
        ))}
      </div>
    </div>
  );
}
