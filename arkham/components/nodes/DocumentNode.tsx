'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Node } from '@/types';
import { RichDocumentEditor } from '@/components/document/RichDocumentEditor';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface DocumentNodeProps {
  node: Node;
  selected: boolean;
  isDragging: boolean;
  isRunning: boolean;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function DocumentNode({
  node,
  selected,
  isDragging,
  isRunning,
  scale,
  onMouseDown,
}: DocumentNodeProps) {
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeStart, setResizeStart] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { updateNode, isFrozen } = useCanvasStore();

  const handleDocumentChange = (content: string) => {
    updateNode(node.id, {
      ...node,
      config: { ...node.config, content }
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isFrozen) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: node.config.width || 480,
      height: node.config.height || 400,
    });
  };

  const handleResizeMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStart) return;

    const deltaX = (e.clientX - resizeStart.x) / scale;
    const deltaY = (e.clientY - resizeStart.y) / scale;

    const newWidth = Math.max(360, resizeStart.width + deltaX);
    const newHeight = Math.max(300, resizeStart.height + deltaY);

    updateNode(node.id, {
      config: {
        ...node.config,
        width: newWidth,
        height: newHeight,
      },
    });
  }, [isResizing, resizeStart, scale, node.id, node.config, updateNode]);

  const handleResizeMouseUp = React.useCallback(() => {
    setIsResizing(false);
    setResizeStart(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  const width = node.config.width || 480;
  const height = node.config.height || 400;

  return (
    <div
      className={cn(
        'node-card absolute bg-card/95 backdrop-blur-sm border-2 border-teal-500 rounded-xl cursor-move transition-all duration-200 overflow-hidden',
        selected ? 'ring-2 ring-accent shadow-lg shadow-accent/20' : 'hover:shadow-lg',
        isDragging ? 'cursor-grabbing opacity-80' : '',
        isRunning ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/40 animate-pulse' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${width}px`,
        height: `${height}px`,
        willChange: 'transform',
      }}
      onMouseDown={onMouseDown}
    >
      {/* Running ignite effect */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 blur-sm animate-shimmer" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-teal-900/20 border-b border-teal-500/20">
        <FileText size={18} className="text-teal-400" />
        <input
          type="text"
          value={node.config.title || 'Document'}
          onChange={(e) => {
            e.stopPropagation();
            updateNode(node.id, {
              ...node,
              config: { ...node.config, title: e.target.value }
            });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent border-none outline-none font-semibold text-sm text-teal-100 placeholder-teal-300/50"
          placeholder="Document title..."
        />
        <div className="text-[10px] text-teal-200/60">
          Rich Text
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="h-[calc(100%-56px)]">
        <RichDocumentEditor
          content={node.config.content || ''}
          onChange={handleDocumentChange}
        />
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-teal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
