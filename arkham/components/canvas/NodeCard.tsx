'use client';

import React from 'react';
import { Download, Filter, Database, GitBranch, Zap, Globe, Code } from 'lucide-react';
import { Node as NodeType } from '@/types';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface NodeCardProps {
  node: NodeType;
  selected: boolean;
  connecting: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onStartConnection: (nodeId: string, position: { x: number; y: number }) => void;
  onEndConnection: (nodeId: string) => void;
}

const nodeIcons = {
  dataset: Database,
  filter: Filter,
  join: GitBranch,
  if: GitBranch,
  api: Zap,
  enrich: Download,
  code: Code,
  mapview: Globe,
};

const nodeColors = {
  dataset: 'border-blue-500',
  filter: 'border-yellow-500',
  join: 'border-green-500',
  if: 'border-purple-500',
  api: 'border-red-500',
  enrich: 'border-orange-500',
  code: 'border-cyan-500',
  mapview: 'border-cyan-500',
};

export function NodeCard({ 
  node, 
  selected, 
  connecting, 
  onSelect, 
  onPositionChange, 
  onStartConnection, 
  onEndConnection 
}: NodeCardProps) {
  const Icon = nodeIcons[node.type];
  const colorClass = nodeColors[node.type];
  const { scale } = useCanvasStore();

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.connection-port')) return;
    
    e.stopPropagation();
    onSelect(node.id);
    
    // Small delay to distinguish between click and drag
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }, 50);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      onPositionChange(node.id, {
        x: node.position.x + deltaX,
        y: node.position.y + deltaY,
      });
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, scale, node.id, node.position, onPositionChange]);

  const handleMouseUp = React.useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    setIsDragging(false);
    setDragStart(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleOutputPortMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onStartConnection(node.id, node.position);
  };

  const handleInputPortMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEndConnection(node.id);
  };

  const handleInputPortMouseEnter = (e: React.MouseEvent) => {
    if (connecting) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className={cn(
        'node-card absolute bg-card/90 backdrop-blur-sm border-2 rounded-lg p-3 cursor-move transition-all duration-100',
        colorClass,
        selected ? 'ring-2 ring-accent shadow-lg shadow-accent/20' : 'hover:shadow-md',
        connecting ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/30' : '',
        isDragging ? 'cursor-grabbing opacity-80' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: '200px',
        minHeight: '100px',
        willChange: 'transform',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Input Ports */}
      {node.inputs && node.inputs.length > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {node.inputs.map((input, index) => {
            const offsetY = node.inputs.length === 1 ? 0 : (index - (node.inputs.length - 1) / 2) * 30;
            return (
              <div key={input} className="relative" style={{ transform: `translateY(${offsetY}px)` }}>
                <button
                  className="connection-port w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-green-400 transition-all cursor-pointer z-20 -translate-x-1/2"
                  onMouseUp={handleInputPortMouseUp}
                  onMouseEnter={handleInputPortMouseEnter}
                  title={`Input: ${input}`}
                />
                {node.inputs.length > 1 && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-text-subtle whitespace-nowrap">
                    {input}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Output Ports */}
      {node.outputs && node.outputs.length > 0 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {node.outputs.map((output, index) => {
            const offsetY = node.outputs.length === 1 ? 0 : (index - (node.outputs.length - 1) / 2) * 30;
            return (
              <div key={output} className="relative" style={{ transform: `translateY(${offsetY}px)` }}>
                <button
                  className="connection-port w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer z-20 translate-x-1/2"
                  onMouseDown={handleOutputPortMouseDown}
                  title={`Output: ${output}`}
                />
                {node.outputs.length > 1 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-subtle whitespace-nowrap">
                    {output}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-text-subtle" />
        <span className="text-sm font-medium text-text">{node.type}</span>
      </div>

      {node.config && Object.keys(node.config).length > 0 && (
        <div className="text-xs text-text-subtle space-y-1">
          {node.type === 'dataset' && (
            <>
              {node.config.name && <div className="font-medium truncate">{node.config.name}</div>}
              {node.config.rows > 0 && <div>{node.config.rows.toLocaleString()} rows</div>}
              {node.config.schema && node.config.schema.length > 0 && (
                <div className="text-[10px] opacity-60">{node.config.schema.length} fields</div>
              )}
            </>
          )}
          {node.type === 'filter' && (
            <>
              {node.config.mode && <div className="text-[10px] opacity-60">{node.config.mode}</div>}
              {node.config.condition && <div className="font-mono truncate">{node.config.condition}</div>}
            </>
          )}
          {node.type === 'join' && (
            <>
              <div className="text-[10px] opacity-60">{node.config.joinType || 'inner'} join</div>
              {node.config.leftKey && node.config.rightKey && (
                <div className="font-mono text-[10px] truncate">
                  {node.config.leftKey} = {node.config.rightKey}
                </div>
              )}
            </>
          )}
          {node.type === 'if' && (
            <>
              {node.config.conditions && node.config.conditions.length > 0 && (
                <>
                  <div className="text-[10px] opacity-60">{node.config.conditions.length} condition(s)</div>
                  <div className="font-mono truncate text-[10px]">{node.config.conditions[0].expression || 'empty'}</div>
                </>
              )}
            </>
          )}
          {node.type === 'api' && (
            <>
              <div className="font-medium">{node.config.method || 'GET'}</div>
              {node.config.endpoint && <div className="truncate text-[10px]">{node.config.endpoint}</div>}
            </>
          )}
          {node.type === 'enrich' && (
            <>
              <div className="text-[10px] opacity-60">{node.config.enrichType || 'lookup'}</div>
              {node.config.sourceField && (
                <div className="font-mono text-[10px] truncate">{node.config.sourceField}</div>
              )}
            </>
          )}
          {node.type === 'code' && (
            <>
              <div className="text-[10px] opacity-60">{node.config.language || 'javascript'}</div>
              <div className="font-mono text-[10px] opacity-60">
                {node.config.blocks?.length > 0 ? `${node.config.blocks.length} blocks` : 'function transform'}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between mt-2 text-xs text-text-subtle">
        <span>{node.inputs?.length || 0} in</span>
        <span>{node.outputs?.length || 0} out</span>
      </div>
    </div>
  );
}