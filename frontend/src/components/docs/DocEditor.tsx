'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Heading1, Heading2, Heading3, ChevronLeft, Save,
  Cloud, CloudOff, Clock, User, Hash, CheckCircle
} from 'lucide-react';

interface DocEditorV2Props {
  doc: any;
  onSave: (id: string, content: string, title: string) => void;
  onBack: () => void;
}

export default function DocEditorV2({ doc, onSave, onBack }: DocEditorV2Props) {
  const [title, setTitle] = useState(doc.title || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Start writing your document... Type "/" for commands',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
    ],
    content: doc.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none outline-none min-h-[60vh] text-white/80 text-lg leading-relaxed',
      },
    },
    onUpdate: () => {
      if (isFirstRender.current) { isFirstRender.current = false; return; }
      setSaveStatus('unsaved');
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 1500);
    },
  });

  const handleAutoSave = useCallback(() => {
    if (!editor) return;
    setSaveStatus('saving');
    onSave(doc.id, editor.getHTML(), title);
    setTimeout(() => setSaveStatus('saved'), 800);
  }, [editor, doc.id, title, onSave]);

  // Auto-save title too
  useEffect(() => {
    if (isFirstRender.current) return;
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleAutoSave();
    }, 1500);
  }, [title]);

  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  const handleManualSave = () => {
    if (!editor) return;
    setSaveStatus('saving');
    onSave(doc.id, editor.getHTML(), title);
    setTimeout(() => setSaveStatus('saved'), 600);
  };

  if (!editor) return null;

  const SaveStatusIcon = () => {
    if (saveStatus === 'saving') return <><Cloud size={14} className="animate-pulse text-amber-400" /><span className="text-amber-400">Saving...</span></>;
    if (saveStatus === 'unsaved') return <><CloudOff size={14} className="text-white/30" /><span className="text-white/30">Unsaved</span></>;
    return <><CheckCircle size={14} className="text-emerald-400" /><span className="text-emerald-400">Saved</span></>;
  };

  const ToolBtn = ({ onClick, active, title, children }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${active ? 'bg-indigo-500 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#13151f] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
          >
            <ChevronLeft size={18} /> All Docs
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2 text-xs font-medium">
            <SaveStatusIcon />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/30 font-medium">
          <span className="flex items-center gap-1.5"><Hash size={12} /> v{doc.version || 1}</span>
          {doc.updatedAt && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {new Date(doc.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-1.5 rounded-lg transition-all text-xs font-bold"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-12 border-b border-white/10 px-6 flex items-center gap-1 bg-[#1a1c27] shrink-0 flex-wrap">
        <div className="flex items-center gap-1 pr-3 border-r border-white/10">
          <ToolBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
            <Heading1 size={17} />
          </ToolBtn>
          <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <Heading2 size={17} />
          </ToolBtn>
          <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <Heading3 size={17} />
          </ToolBtn>
        </div>
        <div className="flex items-center gap-1 px-3 border-r border-white/10">
          <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold size={17} />
          </ToolBtn>
          <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic size={17} />
          </ToolBtn>
          <ToolBtn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
            <UnderlineIcon size={17} />
          </ToolBtn>
        </div>
        <div className="flex items-center gap-1 px-3 border-r border-white/10">
          <ToolBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List size={17} />
          </ToolBtn>
          <ToolBtn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered size={17} />
          </ToolBtn>
        </div>
        <div className="flex items-center gap-1 px-3">
          <ToolBtn title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
            <AlignLeft size={17} />
          </ToolBtn>
          <ToolBtn title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
            <AlignCenter size={17} />
          </ToolBtn>
          <ToolBtn title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
            <AlignRight size={17} />
          </ToolBtn>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-white/20 font-medium">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>·</span>
          <span>{editor.storage.characterCount.characters()} chars</span>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-10">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled Document"
            className="w-full bg-transparent text-4xl font-black text-white outline-none placeholder:text-white/15 mb-8 pb-2 border-b border-white/5 focus:border-indigo-500/30 transition-colors"
          />
          {/* TipTap Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.12);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror {
          font-family: 'Outfit', 'Georgia', serif;
        }
        .ProseMirror h1 { font-size: 2rem; font-weight: 900; color: white; margin-bottom: 0.75rem; margin-top: 1.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 0.5rem; margin-top: 1.25rem; }
        .ProseMirror h3 { font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem; margin-top: 1rem; }
        .ProseMirror p { margin-bottom: 0.75rem; color: rgba(255,255,255,0.75); }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.75); }
        .ProseMirror li { margin-bottom: 0.25rem; }
        .ProseMirror ul li { list-style-type: disc; }
        .ProseMirror ol li { list-style-type: decimal; }
        .ProseMirror strong { color: white; font-weight: 800; }
        .ProseMirror em { color: rgba(255,255,255,0.7); }
        .ProseMirror blockquote { border-left: 3px solid rgba(99,102,241,0.6); padding-left: 1rem; color: rgba(255,255,255,0.5); font-style: italic; margin: 1rem 0; }
        .ProseMirror code { background: rgba(99,102,241,0.2); color: rgb(167,139,250); padding: 0.1rem 0.3rem; border-radius: 0.3rem; font-size: 0.9em; }
        .ProseMirror pre { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.75rem; overflow-x: auto; }
        .ProseMirror pre code { background: none; color: rgba(255,255,255,0.8); }
        .ProseMirror hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }
      `}</style>
    </div>
  );
}
