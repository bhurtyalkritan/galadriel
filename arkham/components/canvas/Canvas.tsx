'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '@/store/canvas';
import { NodeCard } from './NodeCard';
import { ConnectorLine } from './ConnectorLine';
import { generateId } from '@/lib/utils';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
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
    setSelectedNode,
    setSelectedConnector,
    setCanvasOffset,
    setCanvasScale,
  } = useCanvasStore();

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      setSelectedConnector(null);
      setConnecting(null);
      setTempLine(null);
    }
  }, [setSelectedNode, setSelectedConnector]);

  const handleNodePositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    updateNode(id, { position });
  }, [updateNode]);

  const handleStartConnection = useCallback((nodeId: string) => {
    setConnecting(nodeId);
  }, []);

  const handleEndConnection = useCallback((nodeId: string) => {
    if (connecting && connecting !== nodeId) {
      const newConnector = {
        id: generateId(),
        fromNode: connecting,
        toNode: nodeId,
        createdAt: new Date().toISOString(),
      };
      addConnector(newConnector);
    }
    setConnecting(null);
    setTempLine(null);
  }, [connecting, addConnector]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (connecting) {
      setTempLine({
        x: (e.clientX - rect.left - canvasOffset.x) / canvasScale,
        y: (e.clientY - rect.top - canvasOffset.y) / canvasScale,
      });
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
  }, [connecting, isPanning, lastPanPoint, canvasOffset, canvasScale, setCanvasOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && e.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

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
    } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      resetView();
    } else if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fitToNodes();
    }
  }, [resetView, fitToNodes]);

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
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={canvasRef}
        className={`w-full h-full relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
            transformOrigin: '0 0',
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
                fromPosition={fromNode.position}
                toPosition={toNode.position}
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
                <filter id="temp-glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d={`M ${(nodes.find(n => n.id === connecting)?.position.x || 0) + 200} ${(nodes.find(n => n.id === connecting)?.position.y
