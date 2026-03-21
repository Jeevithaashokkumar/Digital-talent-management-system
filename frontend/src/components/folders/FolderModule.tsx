'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Trash2, Edit2,
  CheckSquare, FileText, Monitor, MoreHorizontal, Home, ArrowRight,
  X, Check, Calendar, Tag, User, Search, AlertCircle, Upload, Eye, Download, File as FileIcon
} from 'lucide-react';
import api from '@/services/api';

// ─────────────────────────────────────────────
// RECURSIVE TREE NODE
// ─────────────────────────────────────────────
function FolderNode({
  node, depth = 0, activeFolderId, onSelect, onRename, onDelete, onCreateChild
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameName, setRenameName] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const isActive = activeFolderId === node.id;

  const handleRename = async () => {
    if (renameName.trim() && renameName !== node.name) {
      await onRename(node.id, renameName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-xl cursor-pointer transition-all relative
          ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => { onSelect(node); setExpanded(e => !e); }}
      >
        {/* Expand Arrow */}
        <span className="w-4 h-4 shrink-0 flex items-center justify-center">
          {node.children?.length > 0 ? (
            expanded
              ? <ChevronDown size={13} className="text-white/40" />
              : <ChevronRight size={13} className="text-white/40" />
          ) : <span className="w-4" />}
        </span>

        {/* Folder Icon */}
        {isActive || expanded
          ? <FolderOpen size={15} className="text-amber-400 shrink-0" />
          : <Folder size={15} className="text-amber-400/70 shrink-0" />
        }

        {/* Name / Rename Input */}
        {isRenaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-white/10 border border-indigo-500/50 rounded-lg px-2 py-0.5 text-sm text-white outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
        )}

        {/* Count badges */}
        {!isRenaming && (node._count?.tasks > 0 || node._count?.docs > 0 || node._count?.files > 0) && (
          <span className="text-[10px] text-white/25 font-medium shrink-0">
            {(node._count?.tasks || 0) + (node._count?.docs || 0) + (node._count?.files || 0)}
          </span>
        )}

        {/* More menu */}
        {!isRenaming && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}
              className="p-1 rounded-lg hover:bg-white/20 text-white/40 hover:text-white"
            >
              <MoreHorizontal size={13} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 z-50 bg-[#1e202e] border border-white/10 rounded-xl shadow-2xl p-1 w-40" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <Edit2 size={13} /> Rename
                </button>
                <button onClick={() => { onCreateChild(node.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <Plus size={13} /> New Subfolder
                </button>
                <hr className="border-white/10 my-1" />
                <button onClick={() => { onDelete(node.id, node.name); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && node.children?.map((child: any) => (
        <FolderNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeFolderId={activeFolderId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN FOLDER MODULE
// ─────────────────────────────────────────────
export default function FolderModule() {
  const [tree, setTree] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<any>(null);
  const [content, setContent] = useState<{ tasks: any[], docs: any[], whiteboards: any[], subFolders: any[], files: any[] }>({
    tasks: [], docs: [], whiteboards: [], subFolders: [], files: []
  });
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/folders');
      setTree(res.data.tree || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchContent = useCallback(async (folder: any) => {
    try {
      setContentLoading(true);
      const res = await api.get(`/folders/${folder.id}/content`);
      setContent({
        tasks: res.data.tasks || [],
        docs: res.data.docs || [],
        whiteboards: res.data.whiteboards || [],
        subFolders: res.data.subFolders || [],
        files: res.data.files || []
      });
    } catch (e) { console.error(e); }
    finally { setContentLoading(false); }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);
  useEffect(() => { if (activeFolder) fetchContent(activeFolder); }, [activeFolder, fetchContent]);

  const handleSelect = (folder: any) => {
    setActiveFolder(folder);
    setBreadcrumbs([{ id: folder.id, name: folder.name }]);
  };

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { name: newFolderName.trim(), parentFolderId: createParentId });
      setIsCreating(false);
      setNewFolderName('');
      setCreateParentId(null);
      fetchFolders();
      (window as any).addToast?.(`Folder "${newFolderName}" created!`, 'success');
    } catch {
      (window as any).addToast?.('Failed to create folder', 'error');
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      await api.put(`/folders/${id}`, { name });
      fetchFolders();
      if (activeFolder?.id === id) setActiveFolder((f: any) => ({ ...f, name }));
    } catch {
      (window as any).addToast?.('Failed to rename folder', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its contents?`)) return;
    try {
      await api.delete(`/folders/${id}`);
      if (activeFolder?.id === id) { setActiveFolder(null); setContent({ tasks: [], docs: [], whiteboards: [], subFolders: [], files: [] }); setBreadcrumbs([]); }
      fetchFolders();
      (window as any).addToast?.(`Folder deleted`, 'error');
    } catch {
      (window as any).addToast?.('Failed to delete folder', 'error');
    }
  };

  const handleCreateChild = (parentId: string) => {
    setCreateParentId(parentId);
    setIsCreating(true);
  };

  const navigateBreadcrumb = (crumb: any, idx: number) => {
    setBreadcrumbs(prev => prev.slice(0, idx + 1));
    setActiveFolder(crumb);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeFolder) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('folderId', activeFolder.id);

    try {
        setUploading(true);
        const res = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setContent(prev => ({ ...prev, files: [...res.data, ...prev.files] }));
        (window as any).addToast?.(`${files.length} file(s) uploaded!`, 'success');
        fetchFolders(); // Update file counts in sidebar
    } catch (error) {
        (window as any).addToast?.('Upload failed', 'error');
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    try {
        await api.delete(`/files/${id}`);
        setContent(prev => ({ ...prev, files: prev.files.filter(f => f.id !== id) }));
        (window as any).addToast?.('File deleted', 'info');
        fetchFolders(); // Update counts
    } catch {
        (window as any).addToast?.('Failed to delete file', 'error');
    }
  };

  const handleDownload = async (file: any) => {
    try {
        const response = await api.get(`/files/download/${file.id}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.originalName);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch {
        (window as any).addToast?.('Download failed', 'error');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── RENDER ──────────────────────────────────
  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-white/3 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Workspaces</span>
            <button
              onClick={() => { setCreateParentId(null); setIsCreating(true); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
              title="New root folder"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Quick-create input */}
          {isCreating && (
            <div className="flex items-center gap-2 mb-2 bg-white/5 border border-indigo-500/40 rounded-xl px-3 py-2">
              <Folder size={14} className="text-amber-400 shrink-0" />
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setIsCreating(false); setNewFolderName(''); }}}
                placeholder={createParentId ? 'Subfolder name...' : 'Folder name...'}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
              <button onClick={handleCreate} className="text-emerald-400 hover:text-emerald-300 transition-colors"><Check size={14} /></button>
              <button onClick={() => { setIsCreating(false); setNewFolderName(''); }} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
            </div>
          )}
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />)
          ) : tree.length === 0 ? (
            <div className="text-center py-8 text-white/20">
              <Folder size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No folders yet</p>
            </div>
          ) : (
            tree.map(node => (
              <FolderNode
                key={node.id}
                node={node}
                activeFolderId={activeFolder?.id}
                onSelect={handleSelect}
                onRename={handleRename}
                onDelete={handleDelete}
                onCreateChild={handleCreateChild}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header + Breadcrumbs */}
        <div className="px-8 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
            <button onClick={() => { setActiveFolder(null); setBreadcrumbs([]); }} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home size={14} /> Home
            </button>
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.id} className="flex items-center gap-2">
                <ChevronRight size={13} className="text-white/20" />
                <button
                  onClick={() => navigateBreadcrumb(crumb, idx)}
                  className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? 'text-white font-bold' : ''}`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              {activeFolder ? (
                <><FolderOpen size={24} className="text-amber-400" />{activeFolder.name}</>
              ) : (
                <><Home size={22} className="text-indigo-400" /> All Folders</>
              )}
            </h2>
            {activeFolder && (
              <div className="flex items-center gap-2">
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                    {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={15} />}
                    {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
                <button
                    onClick={() => handleCreateChild(activeFolder.id)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                    <Plus size={15} /> New Subfolder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!activeFolder ? (
            // Root view — show all root folders as cards
            <div>
              <p className="text-white/40 text-sm mb-6">Select a folder from the sidebar to view its contents.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? [1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />) : tree.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => handleSelect(folder)}
                    className="group bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <FolderOpen size={28} className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-black text-sm mb-1">{folder.name}</h3>
                    <p className="text-white/30 text-xs">
                      {folder._count?.subFolders || 0} folders · {folder._count?.tasks || 0} tasks · {folder._count?.docs || 0} docs
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => { setCreateParentId(null); setIsCreating(true); }}
                  className="h-28 border-2 border-dashed border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/25 hover:text-amber-400 transition-all cursor-pointer"
                >
                  <Plus size={22} />
                  <span className="text-xs font-bold">New Folder</span>
                </button>
              </div>
            </div>
          ) : contentLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Subfolders */}
              {content.subFolders.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Folder size={13} /> Folders ({content.subFolders.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {content.subFolders.map(sf => (
                      <div
                        key={sf.id}
                        onClick={() => { setActiveFolder(sf); setBreadcrumbs(prev => [...prev, { id: sf.id, name: sf.name }]); }}
                        className="group bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-xl p-4 cursor-pointer transition-all"
                      >
                        <FolderOpen size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-white font-black text-sm truncate">{sf.name}</p>
                        <p className="text-white/25 text-[11px] mt-1">
                          {sf._count?.tasks || 0} tasks · {sf._count?.docs || 0} docs
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Files Section */}
              {content.files.length > 0 && (
                <section>
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Upload size={13} /> Files ({content.files.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {content.files.map(file => (
                            <div key={file.id} className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                                        <FileIcon size={18} className="text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-black text-sm truncate" title={file.originalName}>{file.originalName}</h4>
                                        <p className="text-white/30 text-xs mt-0.5">{formatSize(file.size)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleDownload(file)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                                            title="Download"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteFile(file.id)}
                                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-white/40 hover:text-rose-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
              )}

              {/* Tasks */}
              {content.tasks.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckSquare size={13} /> Tasks ({content.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {content.tasks.map(task => {
                      const priorityColor = task.priority === 'high' ? 'text-rose-400 bg-rose-500/10' : task.priority === 'low' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10';
                      const statusColor = task.status === 'done' ? 'text-emerald-400' : task.status === 'in-progress' ? 'text-amber-400' : 'text-white/40';
                      return (
                        <div key={task.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3 hover:bg-white/10 transition-all group">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${priorityColor}`}>{task.priority}</span>
                          <span className="text-white font-medium text-sm flex-1">{task.title}</span>
                          <span className={`text-xs font-bold ${statusColor}`}>{task.status}</span>
                          {task.assignee && (
                            <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-[9px] font-black text-white" title={task.assignee.name}>
                              {task.assignee.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          {task.dueDate && (
                            <span className="text-white/30 text-xs flex items-center gap-1">
                              <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Docs */}
              {content.docs.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={13} /> Documents ({content.docs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {content.docs.map(doc => (
                      <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3">
                          <FileText size={15} className="text-indigo-400" />
                        </div>
                        <h4 className="text-white font-black text-sm mb-1 truncate">{doc.title}</h4>
                        <p className="text-white/30 text-xs">{new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · v{doc.version || 1}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Whiteboards */}
              {content.whiteboards.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Monitor size={13} /> Whiteboards ({content.whiteboards.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {content.whiteboards.map(wb => (
                      <div key={wb.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer">
                        <Monitor size={22} className="text-pink-400 mb-2" />
                        <h4 className="text-white font-black text-sm">{wb.title}</h4>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state */}
              {content.tasks.length === 0 && content.docs.length === 0 && content.whiteboards.length === 0 && content.subFolders.length === 0 && content.files.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-white/20">
                  <FolderOpen size={56} className="mb-4 opacity-40" />
                  <p className="text-lg font-black mb-1">This folder is empty</p>
                  <p className="text-sm">Add tasks, docs, or upload files here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
