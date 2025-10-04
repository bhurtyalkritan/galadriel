'use client';

import React from 'react';
import { Node } from '@/types';
import { useCanvasStore } from '@/store/canvas';
import { cn } from '@/lib/utils';
import { Database, Cloud, User, FileText, Settings, Layers, Server, Shield, BarChart, Inbox, HardDrive, Eye, Lock, Cpu, Network, Zap, Globe } from 'lucide-react';

interface DiagramShapeProps {
  node: Node;
  selected: boolean;
  connecting: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onStartConnection: (nodeId: string, position: { x: number; y: number }) => void;
  onEndConnection: (nodeId: string) => void;
}

export function DiagramShape({
  node,
  selected,
  connecting,
  onSelect,
  onPositionChange,
  onStartConnection,
  onEndConnection,
}: DiagramShapeProps) {
  const { scale, updateNode } = useCanvasStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeHandle, setResizeHandle] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.config.text || '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { shape, width, height, fill, stroke, strokeWidth, text, fontSize, textColor, opacity, rotation } = node.config;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.connection-port')) return;
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    e.stopPropagation();
    onSelect(node.id);
    
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }, 50);
  };

  const handleResizeStart = (handle: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isResizing && dragStart && resizeHandle) {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;

      let newWidth = width;
      let newHeight = height;
      let newX = node.position.x;
      let newY = node.position.y;

      switch (resizeHandle) {
        case 'se': // Bottom-right
          newWidth = Math.max(40, width + deltaX);
          newHeight = Math.max(40, height + deltaY);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(40, width - deltaX);
          newHeight = Math.max(40, height + deltaY);
          newX = node.position.x + (width - newWidth);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(40, width + deltaX);
          newHeight = Math.max(40, height - deltaY);
          newY = node.position.y + (height - newHeight);
          break;
        case 'nw': // Top-left
          newWidth = Math.max(40, width - deltaX);
          newHeight = Math.max(40, height - deltaY);
          newX = node.position.x + (width - newWidth);
          newY = node.position.y + (height - newHeight);
          break;
        case 'e': // Right edge
          newWidth = Math.max(40, width + deltaX);
          break;
        case 'w': // Left edge
          newWidth = Math.max(40, width - deltaX);
          newX = node.position.x + (width - newWidth);
          break;
        case 'n': // Top edge
          newHeight = Math.max(40, height - deltaY);
          newY = node.position.y + (height - newHeight);
          break;
        case 's': // Bottom edge
          newHeight = Math.max(40, height + deltaY);
          break;
      }

      requestAnimationFrame(() => {
        updateNode(node.id, {
          config: { ...node.config, width: newWidth, height: newHeight },
          position: { x: newX, y: newY }
        });
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (!isDragging || !dragStart) return;

    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    requestAnimationFrame(() => {
      onPositionChange(node.id, {
        x: node.position.x + deltaX,
        y: node.position.y + deltaY,
      });
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, isResizing, dragStart, resizeHandle, scale, node.id, node.position, node.config, width, height, onPositionChange, updateNode]);

  const handleMouseUp = React.useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragStart(null);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text || '');
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTextSubmit = () => {
    setIsEditing(false);
    updateNode(node.id, {
      config: { ...node.config, text: editText },
    });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(text || '');
    }
  };

  const handlePortMouseDown = (position: 'top' | 'right' | 'bottom' | 'left') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Calculate exact port position based on which port was clicked
    let portPosition = { x: 0, y: 0 };
    
    switch (position) {
      case 'top':
        portPosition = {
          x: node.position.x + width / 2,
          y: node.position.y
        };
        break;
      case 'right':
        portPosition = {
          x: node.position.x + width,
          y: node.position.y + height / 2
        };
        break;
      case 'bottom':
        portPosition = {
          x: node.position.x + width / 2,
          y: node.position.y + height
        };
        break;
      case 'left':
        portPosition = {
          x: node.position.x,
          y: node.position.y + height / 2
        };
        break;
    }
    
    onStartConnection(node.id, portPosition);
  };

  const handlePortMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEndConnection(node.id);
  };

  const handlePortMouseEnter = (e: React.MouseEvent) => {
    if (connecting) {
      e.stopPropagation();
    }
  };

  const renderShape = () => {
    const shapeProps = {
      fill: fill || '#3b82f6',
      stroke: stroke || '#60a5fa',
      strokeWidth: strokeWidth || 2,
      opacity: (opacity || 100) / 100,
    };

    switch (shape) {
      case 'rectangle':
        return <rect x="0" y="0" width={width} height={height} {...shapeProps} />;
      
      case 'rounded-rectangle':
        return <rect x="0" y="0" width={width} height={height} rx="8" ry="8" {...shapeProps} />;
      
      case 'circle':
        return <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2} {...shapeProps} />;
      
      case 'ellipse':
        return <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} {...shapeProps} />;
      
      case 'triangle':
        return <polygon points={`${width / 2},0 ${width},${height} 0,${height}`} {...shapeProps} />;
      
      case 'diamond':
        return <polygon points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`} {...shapeProps} />;
      
      case 'hexagon':
        const hexPoints = [
          [width * 0.25, 0],
          [width * 0.75, 0],
          [width, height / 2],
          [width * 0.75, height],
          [width * 0.25, height],
          [0, height / 2]
        ];
        return <polygon points={hexPoints.map(p => p.join(',')).join(' ')} {...shapeProps} />;
      
      case 'star':
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
          const r = i % 2 === 0 ? Math.min(width, height) / 2 : Math.min(width, height) / 4;
          starPoints.push([
            width / 2 + r * Math.cos(angle),
            height / 2 + r * Math.sin(angle)
          ]);
        }
        return <polygon points={starPoints.map(p => p.join(',')).join(' ')} {...shapeProps} />;
      
      case 'parallelogram':
        return <polygon points={`${width * 0.2},0 ${width},0 ${width * 0.8},${height} 0,${height}`} {...shapeProps} />;
      
      case 'trapezoid':
        return <polygon points={`${width * 0.25},0 ${width * 0.75},0 ${width},${height} 0,${height}`} {...shapeProps} />;
      
      case 'line':
        return <line x1="0" y1={height / 2} x2={width} y2={height / 2} {...shapeProps} fill="none" />;
      
      case 'arrow':
        return (
          <g>
            <line x1="0" y1={height / 2} x2={width - 15} y2={height / 2} {...shapeProps} fill="none" />
            <polygon 
              points={`${width},${height / 2} ${width - 15},${height / 2 - 8} ${width - 15},${height / 2 + 8}`}
              fill={stroke || '#60a5fa'}
            />
          </g>
        );
      
      case 'cylinder':
        // Use Database icon
        return null;
      
      case 'cloud':
        // Use Cloud icon
        return null;
      
      case 'actor':
        // Use User icon
        return null;
      
      case 'document':
        // Use FileText icon
        return null;
      
      case 'gear':
        // Use Settings icon
        return null;
      
      case 'queue':
        // Use Layers icon
        return null;
      
      default:
        return <rect x="0" y="0" width={width} height={height} {...shapeProps} />;
    }
  };

  // Helper function to get the appropriate icon for icon-based shapes
  const getIconForShape = () => {
    switch (shape) {
      case 'cylinder':
        return Database;
      case 'cloud':
        return Cloud;
      case 'actor':
        return User;
      case 'document':
        return FileText;
      case 'gear':
        return Settings;
      case 'queue':
        return Layers;
      case 'server':
        return Server;
      case 'loadbalancer':
        return Network;
      case 'cache':
        return Zap;
      case 'apigateway':
        return Inbox;
      case 'microservice':
        return Cpu;
      case 'storage':
        return HardDrive;
      case 'firewall':
        return Shield;
      case 'auth':
        return Lock;
      case 'monitoring':
        return Eye;
      case 'analytics':
        return BarChart;
      case 'client':
        return Globe;
      default:
        return null;
    }
  };

  const IconComponent = getIconForShape();
  const isIconShape = ['cylinder', 'cloud', 'actor', 'document', 'gear', 'queue', 'server', 'loadbalancer', 'cache', 'apigateway', 'microservice', 'storage', 'firewall', 'auth', 'monitoring', 'analytics', 'client'].includes(shape);

  return (
    <div
      className={cn(
        'absolute cursor-move transition-all duration-200',
        selected ? 'ring-2 ring-accent' : '',
        isDragging ? 'cursor-grabbing opacity-80' : ''
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation || 0}deg)`,
        willChange: 'transform',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Top Port */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10">
        <button
          className="connection-port w-2 h-2 bg-blue-400/60 rounded-full border border-white/80 hover:scale-[2] hover:bg-blue-400 hover:ring-1 hover:ring-blue-400/50 transition-all cursor-pointer"
          onMouseDown={handlePortMouseDown('top')}
          onMouseUp={handlePortMouseUp}
          onMouseEnter={handlePortMouseEnter}
          title="Top"
          style={{ transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Right Port */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button
          className="connection-port w-2 h-2 bg-blue-400/60 rounded-full border border-white/80 hover:scale-[2] hover:bg-blue-400 hover:ring-1 hover:ring-blue-400/50 transition-all cursor-pointer"
          onMouseDown={handlePortMouseDown('right')}
          onMouseUp={handlePortMouseUp}
          onMouseEnter={handlePortMouseEnter}
          title="Right"
          style={{ transform: 'translateX(50%)' }}
        />
      </div>

      {/* Bottom Port */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10">
        <button
          className="connection-port w-2 h-2 bg-blue-400/60 rounded-full border border-white/80 hover:scale-[2] hover:bg-blue-400 hover:ring-1 hover:ring-blue-400/50 transition-all cursor-pointer"
          onMouseDown={handlePortMouseDown('bottom')}
          onMouseUp={handlePortMouseUp}
          onMouseEnter={handlePortMouseEnter}
          title="Bottom"
          style={{ transform: 'translateY(50%)' }}
        />
      </div>

      {/* Left Port */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
          className="connection-port w-2 h-2 bg-blue-400/60 rounded-full border border-white/80 hover:scale-[2] hover:bg-blue-400 hover:ring-1 hover:ring-blue-400/50 transition-all cursor-pointer"
          onMouseDown={handlePortMouseDown('left')}
          onMouseUp={handlePortMouseUp}
          onMouseEnter={handlePortMouseEnter}
          title="Left"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>

      {/* SVG Shape or Icon */}
      {isIconShape && IconComponent ? (
        // Use icon for special shapes
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            backgroundColor: fill === 'transparent' ? 'transparent' : (fill || '#3b82f6'),
            opacity: fill === 'transparent' ? 1 : (opacity || 100) / 100,
            borderRadius: '4px',
          }}
        >
          <IconComponent 
            size={Math.min(width, height) * 0.6} 
            style={{ 
              color: stroke || '#60a5fa',
              opacity: fill === 'transparent' ? (opacity || 100) / 100 : 1,
            }}
            strokeWidth={1.5}
          />
        </div>
      ) : (
        // Use SVG for basic shapes
        <svg width={width} height={height} className="pointer-events-none absolute inset-0">
          {renderShape()}
        </svg>
      )}
      
      {/* Text overlay */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => {
            e.stopPropagation();
            setEditText(e.target.value);
          }}
          onBlur={handleTextSubmit}
          onKeyDown={handleTextKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-transparent text-center outline-none border-none z-20"
          style={{
            color: textColor || '#ffffff',
            fontSize: `${fontSize || 14}px`,
            fontFamily: 'sans-serif',
          }}
        />
      ) : (
        text && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none text-center px-2 z-20"
            style={{
              color: textColor || '#ffffff',
              fontSize: `${fontSize || 14}px`,
              fontFamily: 'sans-serif',
              wordBreak: 'break-word',
            }}
          >
            {text}
          </div>
        )
      )}

      {/* Resize Handles - Only show when selected */}
      {selected && (
        <>
          {/* Corner Handles */}
          <div 
            className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-accent border border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('nw')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-accent border border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('ne')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-accent border border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('sw')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-accent border border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('se')}
            title="Resize"
          />
          
          {/* Edge Handles */}
          <div 
            className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent/70 border border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('n')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent/70 border border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('s')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-accent/70 border border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('w')}
            title="Resize"
          />
          <div 
            className="resize-handle absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-accent/70 border border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform z-30"
            onMouseDown={handleResizeStart('e')}
            title="Resize"
          />
        </>
      )}
    </div>
  );
}
