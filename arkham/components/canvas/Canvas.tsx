'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '@/store/canvas';
import { NodeCard } from './NodeCard';
import { ConnectorLine } from './ConnectorLine';
import { generateId } from '@/lib/utils';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connecting, setConnecting] = useState<{ nodeId: string; position: { x: number; y: number } } | null>(null);
  const [tempLine, setTempLine] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);
  
  const {
    nodes,
    connectors,
    selectedNode,
    selectedConnector,
    canvasOffset,
    canvasScale,
    addNode,
    updateNode,
    addConnector,
    removeNode,
    setSelectedNode,
    setSelectedConnector,
    setCanvasOffset,
    setCanvasScale,
  } = useCanvasStore();

  useEffect(() => {
    console.log('Canvas render - Nodes:', nodes.length, nodes);
    console.log('Canvas offset:', canvasOffset);
    console.log('Canvas scale:', canvasScale);
    nodes.forEach((node, i) => {
      console.log(`Node ${i}:`, node.type, 'at position', node.position);
    });
  }, [nodes, canvasOffset, canvasScale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-card') || target.closest('button')) return;
    
    setSelectedNode(null);
    setSelectedConnector(null);
    setConnecting(null);
    setTempLine(null);
  }, [setSelectedNode, setSelectedConnector]);

  const handleNodePositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    updateNode(id, { position });
  }, [updateNode]);

  const handleStartConnection = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setConnecting({ nodeId, position });
  }, []);

  const handleEndConnection = useCallback((nodeId: string) => {
    if (connecting && connecting.nodeId !== nodeId) {
      const newConnector = {
        id: generateId(),
        fromNode: connecting.nodeId,
        toNode: nodeId,
        createdAt: new Date().toISOString(),
        style: {
          lineType: 'solid' as const,
          color: 'rgba(111, 163, 255, 0.6)',
          width: 2,
        }
      };
      addConnector(newConnector);
    }
    setConnecting(null);
    setTempLine(null);
  }, [connecting, addConnector]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const worldX = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
    const worldY = (e.clientY - rect.top - canvasOffset.y) / canvasScale;

    if (connecting) {
      // Check if hovering over any input port
      const targetNode = nodes.find(n => {
        if (n.id === connecting.nodeId || !n.inputs || n.inputs.length === 0) return false;
        const portX = n.position.x;
        const portY = n.position.y + 50;
        const distance = Math.sqrt(Math.pow(worldX - portX, 2) + Math.pow(worldY - portY, 2));
        return distance < 30; // Snap distance
      });

      if (targetNode) {
        // Snap to port
        setTempLine({ 
          x: targetNode.position.x, 
          y: targetNode.position.y + 50,
          snapped: true 
        } as any);
      } else {
        setTempLine({ x: worldX, y: worldY, snapped: false } as any);
      }
    }

    if (isPanning && lastPanPoint && !connecting) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setCanvasOffset({
        x: canvasOffset.x + deltaX,
        y: canvasOffset.y + deltaY,
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [connecting, isPanning, lastPanPoint, canvasOffset, canvasScale, nodes, setCanvasOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.node-card') || target.closest('button')) return;
    
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
    
    // Clear connection state if releasing without hitting a port
    if (connecting) {
      // Small delay to allow port mouseup handlers to fire first
      setTimeout(() => {
        setConnecting(null);
        setTempLine(null);
      }, 50);
    }
  }, [connecting]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - canvasOffset.x) / canvasScale;
    const worldY = (mouseY - canvasOffset.y) / canvasScale;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasScale * zoomFactor));
    
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;
    
    setCanvasScale(newScale);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
    
    useCanvasStore.setState({ scale: newScale });
  }, [canvasScale, canvasOffset, setCanvasScale, setCanvasOffset]);

  const resetView = useCallback(() => {
    setCanvasScale(1);
    setCanvasOffset({ x: 0, y: 0 });
    useCanvasStore.setState({ scale: 1 });
  }, [setCanvasScale, setCanvasOffset]);

  const fitToNodes = useCallback(() => {
    if (nodes.length === 0) return;
    
    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.position.x)) - padding;
    const minY = Math.min(...nodes.map(n => n.position.y)) - padding;
    const maxX = Math.max(...nodes.map(n => n.position.x + 200)) + padding;
    const maxY = Math.max(...nodes.map(n => n.position.y + 100)) + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newOffsetX = rect.width / 2 - centerX * newScale;
    const newOffsetY = rect.height / 2 - centerY * newScale;
    
    setCanvasScale(newScale);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
    useCanvasStore.setState({ scale: newScale });
  }, [nodes, setCanvasScale, setCanvasOffset]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setConnecting(null);
      setTempLine(null);
      setSelectedNode(null);
      setSelectedConnector(null);
    } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      resetView();
    } else if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fitToNodes();
    } else if (e.key === 'x' && (e.ctrlKey || e.metaKey) && selectedNode) {
      e.preventDefault();
      removeNode(selectedNode);
      setSelectedNode(null);
    }
  }, [resetView, fitToNodes, selectedNode, removeNode, setSelectedNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleKeyDown, handleMouseUp]);

  return (
    <div className="flex-1 relative h-full w-full">
      <div
        ref={canvasRef}
        className={`w-full h-full relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
            transformOrigin: '0 0',
            width: '10000px',
            height: '10000px',
          }}
        >
          {/* Connectors */}
          {connectors.map((connector) => {
            const fromNode = nodes.find(n => n.id === connector.fromNode);
            const toNode = nodes.find(n => n.id === connector.toNode);
            if (!fromNode || !toNode) return null;
            return (
              <ConnectorLine
                key={connector.id}
                connector={connector}
                fromNode={fromNode}
                toNode={toNode}
                selected={selectedConnector === connector.id}
                onSelect={setSelectedConnector}
              />
            );
          })}

          {/* Temp connection line */}
          {connecting && tempLine && (
            <svg 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
            >
              <defs>
                <marker
                  id="temp-arrowhead"
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M0,0 L0,6 L9,3 z"
                    fill={(tempLine as any).snapped ? "#10b981" : "#8b5cf6"}
                  />
                </marker>
                <linearGradient id="temp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor={(tempLine as any).snapped ? "#10b981" : "#8b5cf6"} stopOpacity="0.9" />
                </linearGradient>
                <filter id="temp-glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d={`M ${connecting.position.x} ${connecting.position.y} Q ${(connecting.position.x + tempLine.x) / 2} ${connecting.position.y}, ${(connecting.position.x + tempLine.x) / 2} ${(connecting.position.y + tempLine.y) / 2} T ${tempLine.x} ${tempLine.y}`}
                stroke="url(#temp-gradient)"
                strokeWidth={(tempLine as any).snapped ? "3" : "2"}
                fill="none"
                filter="url(#temp-glow)"
                strokeLinecap="round"
                markerEnd="url(#temp-arrowhead)"
              />
              <circle
                cx={tempLine.x}
                cy={tempLine.y}
                r={(tempLine as any).snapped ? "6" : "4"}
                fill={(tempLine as any).snapped ? "#10b981" : "#8b5cf6"}
                filter="url(#temp-glow)"
                className={(tempLine as any).snapped ? "animate-pulse" : ""}
              />
            </svg>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              selected={selectedNode === node.id}
              connecting={connecting?.nodeId === node.id}
              onSelect={setSelectedNode}
              onPositionChange={handleNodePositionChange}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
            />
          ))}
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="absolute top-4 right-20 flex flex-col gap-2 z-10">
        <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg p-2 text-xs text-text-subtle">
          Nodes: {nodes.length} | Zoom: {Math.round(canvasScale * 100)}%
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetView}
            className="bg-card/80 backdrop-blur-sm border border-border/30 text-text hover:text-accent px-3 py-2 rounded-lg transition-all duration-200 hover:bg-card text-xs"
            title="Reset view (Ctrl+0)"
          >
            Reset
          </button>
          <button
            onClick={fitToNodes}
            className="bg-card/80 backdrop-blur-sm border border-border/30 text-text hover:text-accent px-3 py-2 rounded-lg transition-all duration-200 hover:bg-card text-xs"
            title="Fit to nodes (Ctrl+1)"
            disabled={nodes.length === 0}
          >
            Fit All
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg p-3 text-xs text-text-subtle max-w-xs z-10">
        <div className="font-medium mb-1">Navigation:</div>
        <div>• Mouse wheel / Q/E: Zoom in/out</div>
        <div>• Click + drag / Arrow keys: Pan</div>
        <div>• Cmd/Ctrl+0: Reset view</div>
        <div>• Cmd/Ctrl+1: Fit all nodes</div>
        <div>• Cmd/Ctrl+Z: Undo</div>
        <div>• Cmd/Ctrl+Shift+Z: Redo</div>
        <div>• Cmd/Ctrl+X: Remove selected node</div>
      </div>
    </div>
  );
}
