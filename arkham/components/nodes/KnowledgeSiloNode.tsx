'use client';

import React from 'react';
import { Archive } from 'lucide-react';
import { Node } from '@/types';
import { cn, generateId } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface KnowledgeSiloNodeProps {
  node: Node;
  selected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onOutputPortMouseDown: (e: React.MouseEvent) => void;
}

export function KnowledgeSiloNode({
  node,
  selected,
  isDragging,
  onMouseDown,
  onOutputPortMouseDown,
}: KnowledgeSiloNodeProps) {
  const { updateNode } = useCanvasStore();
  const items = node.config.items || [];
  const [dragOver, setDragOver] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newItems = files.map((file) => ({
        id: generateId(),
        type: file.type.includes('image') ? 'image' : 
              file.type.includes('pdf') ? 'pdf' : 'file',
        name: file.name,
        size: file.size,
        addedAt: new Date().toISOString(),
      }));
      
      updateNode(node.id, {
        ...node,
        config: {
          ...node.config,
          items: [...items, ...newItems],
        },
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleRemoveItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNode(node.id, {
      ...node,
      config: {
        ...node.config,
        items: items.filter((item: any) => item.id !== itemId),
      },
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'dataset': return '📊';
      default: return '📁';
    }
  };

  return (
    <div
      className={cn(
        'node-card absolute backdrop-blur-md border-2 rounded-2xl cursor-move transition-all duration-200',
        'bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-purple-600/20',
        'border-purple-400/30',
        selected ? 'ring-2 ring-accent shadow-lg shadow-purple-500/30' : 'hover:shadow-lg hover:shadow-purple-500/20',
        isDragging ? 'cursor-grabbing opacity-80' : '',
        dragOver ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-400/40 scale-[1.02] border-purple-400/60' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: '480px',
        minHeight: '320px',
        willChange: 'transform',
      }}
      onMouseDown={onMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Output Port */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <button
          className="connection-port w-5 h-5 bg-purple-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer z-20 translate-x-1/2"
          onMouseDown={onOutputPortMouseDown}
          title="Output: knowledge"
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-purple-400/20">
        <div className="p-2.5 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-400/30">
          <Archive size={22} className="text-purple-300" />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={node.config.name || 'Knowledge Silo'}
            onChange={(e) => {
              e.stopPropagation();
              updateNode(node.id, { 
                ...node, 
                config: { ...node.config, name: e.target.value } 
              });
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none font-bold text-base text-purple-100 placeholder-purple-300/50"
            placeholder="Silo name..."
          />
          <div className="text-xs text-purple-200/70 mt-0.5 flex items-center gap-2">
            <span>{items.length} items</span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
              LLM Knowledge Base
            </span>
          </div>
        </div>
      </div>

      {/* Drop Zone / Items Grid */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
        {items.length === 0 ? (
          <div className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center transition-all",
            dragOver ? "border-purple-300/60 bg-purple-400/20" : "border-purple-400/30 bg-purple-500/5"
          )}>
            <div className="text-5xl mb-4 animate-pulse">📦</div>
            <div className="text-sm font-semibold text-purple-100 mb-2">Drop files here</div>
            <div className="text-xs text-purple-200/80">
              Add datasets, PDFs, images, or documents
            </div>
            <div className="text-xs text-purple-200/60 mt-2">
              These will power the AI's knowledge base
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="group relative bg-purple-900/30 hover:bg-purple-800/40 border border-purple-400/20 hover:border-purple-300/50 rounded-lg p-3 transition-all cursor-pointer backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-2">
                  <div className="text-2xl">{getItemIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-purple-100 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-purple-200/60 mt-1">
                      {item.type} {item.size && `• ${(item.size / 1024).toFixed(1)}KB`}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-purple-200/60 hover:text-red-400 transition-all text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {/* Add More Button */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-3 text-center transition-all cursor-pointer flex items-center justify-center",
                dragOver ? "border-purple-300/60 bg-purple-400/20" : "border-purple-400/30 hover:border-purple-300/50 bg-purple-500/5"
              )}
            >
              <div>
                <div className="text-xl mb-1 text-purple-300">+</div>
                <div className="text-[10px] text-purple-200/70">Add more</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - AI Status */}
      <div className="p-3 border-t border-purple-400/20 bg-purple-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-purple-200/80">Ready</span>
          </div>
          <span className="text-purple-200/40">•</span>
          <span className="text-purple-200/80">
            {items.length > 0 ? `${items.length} source${items.length > 1 ? 's' : ''} active` : 'Awaiting data'}
          </span>
        </div>
      </div>
    </div>
  );
}
