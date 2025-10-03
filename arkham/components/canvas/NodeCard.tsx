'use client';

import React from 'react';
import { Download, Filter, Database, GitBranch, Zap, Globe } from 'lucide-react';
import { Node as NodeType } from '@/types';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface NodeCardProps {
  node: NodeType;
  selected: boolean;
  connecting: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
}

const nodeIcons = {
  dataset: Database,
  filter: Filter,
  join: GitBranch,
  if: GitBranch,
  api: Zap,
  enrich: Download,
  mapview: Globe,
};

const nodeColors = {
  dataset: 'border-blue-500',
  filter: 'border-yellow-500',
  join: 'border-green-500',
  if: 'border-purple-500',
  api: 'border-red-500',
  enrich: 'border-orange-500',
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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(node.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = node.position.x;
    const startNodeY = node.position.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / scale;
      const deltaY = (e.clientY - startY) / scale;
      
      onPositionChange(node.id, {
        x: startNodeX + deltaX,
        y: startNodeY + deltaY,
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div
      className={cn(
        'node-card cursor-move select-none backdrop-blur-sm transition-all duration-200 hover:scale-105',
        colorClass,
        selected && 'ring-2 ring-accent shadow-lg shadow-accent/20',
        connecting && 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20'
      )}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: 200,
        background: 'rgba(21, 23, 32, 0.9)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-accent" />
        <span className="text-sm font-medium truncate capitalize">{node.type}</span>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="text-xs text-text-subtle mb-2">
        {node.type === 'dataset' && node.config?.name ? node.config.name : `ID: ${node.id.slice(0, 8)}...`}
      </div>
      
      {node.type === 'dataset' && node.config?.rows && (
        <div className="text-xs text-text-subtle mb-2">
          {node.config.rows.toLocaleString()} rows
        </div>
      )}
      
      {node.type === 'filter' && node.config?.condition && (
        <div className="text-xs text-text-subtle mb-2">
          {node.config.condition}
        </div>
      )}
      
      {node.type === 'api' && node.config?.endpoint && (
        <div className="text-xs text-text-subtle mb-2 truncate">
          {node.config.method} {node.config.endpoint}
        </div>
      )}
      
      <div className="flex justify-between text-xs text-text-subtle">
        <span>In: {node.inputs.length}</span>
        <span>Out: {node.outputs.length}</span>
      </div>
      
      <button
        className={`absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 border-background transition-all duration-200 ${
          connecting ? 'bg-yellow-400 scale-125 animate-pulse' : 'bg-card/80 backdrop-blur-sm hover:bg-green-400 hover:scale-110'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onEndConnection(node.id);
        }}
        title="Input port - click to connect"
      >
        {node.inputs.length > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
        )}
      </button>
      
      <button
        className={`absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 border-background transition-all duration-200 ${
          connecting ? 'bg-yellow-400 scale-125 animate-pulse' : 'bg-card/80 backdrop-blur-sm hover:bg-blue-400 hover:scale-110'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection(node.id);
        }}
        title="Output port - click to start connection"
      >
        {node.outputs.length > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
        )}
      </button>
    </div>
  );
}
