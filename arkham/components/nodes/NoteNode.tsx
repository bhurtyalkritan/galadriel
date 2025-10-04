'use client';

import React from 'react';
import { StickyNote } from 'lucide-react';
import { Node } from '@/types';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface NoteNodeProps {
  node: Node;
  selected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function NoteNode({
  node,
  selected,
  isDragging,
  onMouseDown,
}: NoteNodeProps) {
  const { updateNode } = useCanvasStore();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [showPasswordError, setShowPasswordError] = React.useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (passwordInput === node.config.password) {
      setIsUnlocked(true);
      setPasswordInput('');
      setShowPasswordError(false);
    } else {
      setShowPasswordError(true);
      setTimeout(() => setShowPasswordError(false), 2000);
    }
  };

  const isLocked = node.config.isLocked && node.config.password && !isUnlocked;

  const colorMap = {
    amber: 'bg-amber-400/10 border-amber-400/30 text-amber-100',
    blue: 'bg-blue-400/10 border-blue-400/30 text-blue-100',
    green: 'bg-green-400/10 border-green-400/30 text-green-100',
    purple: 'bg-purple-400/10 border-purple-400/30 text-purple-100',
    pink: 'bg-pink-400/10 border-pink-400/30 text-pink-100',
  };
  
  const noteColor = colorMap[node.config.color as keyof typeof colorMap] || colorMap.amber;
  
  return (
    <div
      className={cn(
        'node-card absolute backdrop-blur-sm border-2 rounded-xl p-4 cursor-move transition-all duration-200',
        noteColor,
        selected ? 'ring-2 ring-accent shadow-lg shadow-accent/20 scale-105' : 'hover:shadow-lg',
        isDragging ? 'cursor-grabbing opacity-80 scale-105' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: '280px',
        minHeight: '180px',
        willChange: 'transform',
      }}
      onMouseDown={onMouseDown}
    >
      {isLocked ? (
        // Locked state - password prompt with blurred background
        <div className="relative">
          {/* Blurred content in background */}
          <div className="absolute inset-0 blur-sm pointer-events-none opacity-30">
            <div className="mb-2 font-semibold text-sm">{node.config.title || 'Note'}</div>
            <div className="text-xs leading-relaxed h-32 overflow-hidden">
              {node.config.content || 'Protected content...'}
            </div>
          </div>
          
          {/* Lock prompt overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 bg-background/50 rounded-lg backdrop-blur-md">
            <div className="text-4xl mb-4">🔒</div>
            <div className="text-sm font-medium mb-4">This note is protected</div>
            <form onSubmit={handleUnlock} className="w-full px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  e.stopPropagation();
                  setPasswordInput(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "w-full bg-background/50 border border-border/30 rounded px-3 py-2 text-xs outline-none focus:border-accent/50 transition-colors",
                  showPasswordError && "border-red-500 animate-shake"
                )}
                placeholder="Enter password..."
                autoFocus
              />
              {showPasswordError && (
                <div className="text-xs text-red-400 mt-2 text-center">Incorrect password</div>
              )}
              <button
                type="submit"
                className="w-full mt-3 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded px-3 py-2 text-xs transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Unlocked state - normal note content
        <>
          <div className="mb-2 flex items-center gap-2">
            <input
              type="text"
              value={node.config.title || 'Note'}
              onChange={(e) => {
                e.stopPropagation();
                updateNode(node.id, { 
                  ...node, 
                  config: { ...node.config, title: e.target.value } 
                });
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent border-none outline-none font-semibold text-sm placeholder-current/50"
              placeholder="Note title..."
            />
            {node.config.isLocked && node.config.password && (
              <div className="text-xs opacity-50">🔒</div>
            )}
          </div>
          <textarea
            value={node.config.content || ''}
            onChange={(e) => {
              e.stopPropagation();
              updateNode(node.id, { 
                ...node, 
                config: { ...node.config, content: e.target.value } 
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-xs leading-relaxed placeholder-current/50"
            placeholder="Add your notes here..."
            style={{ fontSize: `${node.config.fontSize || 14}px` }}
          />
          <div className="mt-2 flex items-center justify-between text-[10px] opacity-50">
            <StickyNote size={12} />
            <span>{node.config.content?.length || 0} chars</span>
          </div>
        </>
      )}
    </div>
  );
}
