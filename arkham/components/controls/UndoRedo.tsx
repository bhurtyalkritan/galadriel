'use client';

import React, { useEffect } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';

export function UndoRedo() {
  const { undo, redo, canUndo, canRedo } = useCanvasStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Cmd/Ctrl + Shift + Z for redo (or Cmd/Ctrl + Y)
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || 
          ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border/30 rounded-lg p-2 shadow-lg">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className="p-2 rounded-md hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group"
        title="Undo (Cmd/Ctrl + Z)"
      >
        <Undo2 size={18} className={canUndo() ? 'text-accent group-hover:scale-110 transition-transform' : 'text-text-subtle'} />
      </button>
      
      <div className="w-px h-6 bg-border/30" />
      
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="p-2 rounded-md hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group"
        title="Redo (Cmd/Ctrl + Shift + Z)"
      >
        <Redo2 size={18} className={canRedo() ? 'text-accent group-hover:scale-110 transition-transform' : 'text-text-subtle'} />
      </button>
    </div>
  );
}
