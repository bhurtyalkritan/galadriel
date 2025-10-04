'use client';

import React from 'react';
import { Play, Square as StopSquare, Settings } from 'lucide-react';
import { Node } from '@/types';
import { ScheduleEditor } from '@/components/schedule/ScheduleEditor';
import { ScheduleBadge } from '@/components/schedule/ScheduleBadge';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface GroupNodeProps {
  node: Node;
  selected: boolean;
  isDragging: boolean;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function GroupNode({
  node,
  selected,
  isDragging,
  scale,
  onMouseDown,
}: GroupNodeProps) {
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeStart, setResizeStart] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showScheduleEditor, setShowScheduleEditor] = React.useState(false);
  const { updateNode, runGroup, stopGroup, runningGroups, updateSchedule, isFrozen } = useCanvasStore();
  const isRunning = runningGroups.has(node.id);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isFrozen) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: node.config.width,
      height: node.config.height,
    });
  };

  const handleResizeMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStart) return;

    const deltaX = (e.clientX - resizeStart.x) / scale;
    const deltaY = (e.clientY - resizeStart.y) / scale;

    const newWidth = Math.max(200, resizeStart.width + deltaX);
    const newHeight = Math.max(150, resizeStart.height + deltaY);

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

  const colorMap = {
    slate: 'border-slate-400',
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    green: 'border-green-400',
    amber: 'border-amber-400',
    red: 'border-red-400',
  };

  const groupColor = colorMap[node.config.color as keyof typeof colorMap] || colorMap.slate;

  return (
    <div
      className={cn(
        'node-card absolute rounded-xl cursor-move transition-all duration-200 border-2 border-dashed',
        groupColor,
        selected ? 'ring-2 ring-accent shadow-lg shadow-accent/20' : '',
        isDragging ? 'cursor-grabbing opacity-60' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${node.config.width}px`,
        height: `${node.config.height}px`,
        opacity: node.config.opacity / 100,
        willChange: 'transform',
      }}
      onMouseDown={onMouseDown}
    >
      {/* Label */}
      <div className="absolute -top-6 left-0 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/30 rounded-md flex items-center gap-2">
        <input
          type="text"
          value={node.config.label || 'Group'}
          onChange={(e) => {
            e.stopPropagation();
            updateNode(node.id, {
              config: { ...node.config, label: e.target.value },
            });
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent text-xs font-medium text-text outline-none w-24"
          placeholder="Group name"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) {
              stopGroup(node.id);
            } else {
              runGroup(node.id);
            }
          }}
          className={cn(
            "p-1 rounded hover:bg-accent/20 transition-colors",
            isRunning && "bg-accent/20"
          )}
          title={isRunning ? "Stop" : "Run"}
        >
          {isRunning ? (
            <StopSquare className="w-3 h-3 text-red-400" />
          ) : (
            <Play className="w-3 h-3 text-green-400" />
          )}
        </button>
        <Settings 
          className={cn(
            "w-3 h-3 text-accent transition-all",
            isRunning && "animate-spin"
          )}
        />
        <ScheduleBadge
          schedule={node.schedule}
          onClick={() => setShowScheduleEditor(true)}
        />
      </div>

      {/* Schedule Editor Modal */}
      {showScheduleEditor && (
        <ScheduleEditor
          schedule={node.schedule}
          onSave={(schedule) => updateSchedule(node.id, schedule)}
          onClose={() => setShowScheduleEditor(false)}
        />
      )}

      {/* Resize handle */}
      <div
        className={cn(
          'absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group',
          groupColor
        )}
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-current opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
