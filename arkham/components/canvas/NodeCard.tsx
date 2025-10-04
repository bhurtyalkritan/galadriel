'use client';

import React from 'react';
import { Download, Filter, Database, GitBranch, Zap, Globe, Code, Brain, BarChart3, StickyNote, Archive, Sparkles, Square } from 'lucide-react';
import { Node as NodeType } from '@/types';
import { cn, generateId } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';
import { DiagramShape } from './DiagramShape';

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
  ml: Brain,
  visualization: BarChart3,
  note: StickyNote,
  knowledge_silo: Archive,
  ai: Sparkles,
  group: Square,
  diagram: Square,
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
  ml: 'border-pink-500',
  visualization: 'border-emerald-500',
  note: 'border-amber-500',
  knowledge_silo: 'border-indigo-500',
  ai: 'border-violet-500',
  group: 'border-slate-500',
  diagram: 'border-blue-500',
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
  const { scale, updateNode } = useCanvasStore();

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
    
    // Calculate actual port position based on node type
    const getNodeDimensions = () => {
      switch (node.type) {
        case 'knowledge_silo':
          return { width: 480, height: 320 };
        case 'ai':
          return { width: 280, height: 200 };
        case 'note':
          return { width: 280, height: 180 };
        default:
          return { width: 200, height: 100 };
      }
    };
    
    const dimensions = getNodeDimensions();
    const portPosition = {
      x: node.position.x + dimensions.width,
      y: node.position.y + dimensions.height / 2
    };
    
    onStartConnection(node.id, portPosition);
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

  // Special rendering for knowledge silo nodes
  if (node.type === 'knowledge_silo') {
    const items = node.config.items || [];
    const [dragOver, setDragOver] = React.useState(false);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      
      // Handle file drops
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
        onMouseDown={handleMouseDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Output Port */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button
            className="connection-port w-5 h-5 bg-purple-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer z-20 translate-x-1/2"
            onMouseDown={handleOutputPortMouseDown}
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

  // Special rendering for AI nodes
  if (node.type === 'ai') {
    const aiModels = [
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', color: 'emerald' },
      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI', color: 'green' },
      { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', color: 'amber' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', color: 'blue' },
      { id: 'custom', name: 'Custom Model', provider: 'Custom', color: 'purple' },
    ];

    const selectedModel = aiModels.find(m => m.id === node.config.modelId) || aiModels[0];

    return (
      <div
        className={cn(
          'node-card absolute bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 backdrop-blur-md border-2 rounded-xl cursor-move transition-all duration-200',
          'border-violet-400/40',
          selected ? 'ring-2 ring-accent shadow-lg shadow-violet-500/30' : 'hover:shadow-lg hover:shadow-violet-500/20',
          isDragging ? 'cursor-grabbing opacity-80' : ''
        )}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: '280px',
          minHeight: '200px',
          willChange: 'transform',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Input Port - for knowledge bases */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <button
            className="connection-port w-5 h-5 bg-violet-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer z-20 -translate-x-1/2"
            onMouseUp={handleInputPortMouseUp}
            onMouseEnter={handleInputPortMouseEnter}
            title="Input: knowledge"
          />
        </div>

        {/* Output Port - for chat/responses */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button
            className="connection-port w-5 h-5 bg-violet-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer z-20 translate-x-1/2"
            onMouseDown={handleOutputPortMouseDown}
            title="Output: response"
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-violet-400/20">
          <div className="p-2 bg-violet-500/20 rounded-lg backdrop-blur-sm border border-violet-400/30">
            <Sparkles size={20} className="text-violet-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={node.config.name || 'AI Assistant'}
              onChange={(e) => {
                e.stopPropagation();
                updateNode(node.id, { 
                  ...node, 
                  config: { ...node.config, name: e.target.value } 
                });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent border-none outline-none font-semibold text-sm text-violet-100 placeholder-violet-300/50"
              placeholder="AI name..."
            />
            <div className="text-[10px] text-violet-200/70 mt-0.5">
              Conversational AI
            </div>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-violet-200/80 mb-2">AI Model</label>
            <select
              value={node.config.modelId || 'gpt-4'}
              onChange={(e) => {
                e.stopPropagation();
                updateNode(node.id, {
                  ...node,
                  config: { ...node.config, modelId: e.target.value },
                });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-violet-900/30 border border-violet-400/30 rounded-lg px-3 py-2 text-xs text-violet-100 outline-none focus:border-violet-400/60 transition-colors cursor-pointer"
            >
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Info */}
          <div className="bg-violet-900/20 border border-violet-400/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-violet-200/60">Provider</span>
              <span className="text-violet-100 font-medium">{selectedModel.provider}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-violet-200/60">Status</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-violet-200/60">Temperature</span>
              <input
                type="range"
                min="0"
                max="100"
                value={node.config.temperature || 70}
                onChange={(e) => {
                  e.stopPropagation();
                  updateNode(node.id, {
                    ...node,
                    config: { ...node.config, temperature: parseInt(e.target.value) },
                  });
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-20 h-1"
              />
              <span className="text-violet-100 font-mono w-6 text-right">{node.config.temperature || 70}</span>
            </div>
          </div>

          {/* Knowledge Base Indicator */}
          <div className="text-[10px] text-violet-200/60 text-center pt-1">
            Connect knowledge bases for context
          </div>
        </div>
      </div>
    );
  }

  // Special rendering for diagram shapes
  if (node.type === 'diagram') {
    return (
      <DiagramShape
        node={node}
        selected={selected}
        connecting={connecting}
        onSelect={onSelect}
        onPositionChange={onPositionChange}
        onStartConnection={onStartConnection}
        onEndConnection={onEndConnection}
      />
    );
  }

  // Special rendering for group nodes (visual organizer)
  if (node.type === 'group') {
    const [isResizing, setIsResizing] = React.useState(false);
    const [resizeStart, setResizeStart] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
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
    }, [isResizing, resizeStart, scale]);

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
        onMouseDown={handleMouseDown}
      >
        {/* Label */}
        <div className="absolute -top-6 left-0 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/30 rounded-md">
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
            className="bg-transparent text-xs font-medium text-text outline-none w-32"
            placeholder="Group name"
          />
        </div>

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

  // Special rendering for note nodes
  if (node.type === 'note') {
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
        onMouseDown={handleMouseDown}
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
          {node.type === 'ml' && (
            <>
              <div className="text-[10px] opacity-60">{node.config.framework || 'pytorch'}</div>
              <div className="font-medium truncate">{node.config.modelType || 'classification'}</div>
              {node.config.trainedModel && <div className="text-[10px] text-green-400">✓ Trained</div>}
            </>
          )}
          {node.type === 'visualization' && (
            <>
              <div className="text-[10px] opacity-60">{node.config.chartType || 'bar'} chart</div>
              {node.config.title && <div className="font-medium truncate text-[10px]">{node.config.title}</div>}
              {node.config.savedChart && <div className="text-[10px] text-green-400">✓ Saved</div>}
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