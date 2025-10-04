'use client';

import React, { useRef } from 'react';
import { Connector, Node } from '@/types';

interface ConnectorLineProps {
  connector: Connector;
  fromNode: Node;
  toNode: Node;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ConnectorLine({ 
  connector, 
  fromNode,
  toNode,
  selected, 
  onSelect 
}: ConnectorLineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  
  // Default to arrow style
  const lineType = connector.style?.lineType || 'solid';
  const lineColor = connector.style?.color || 'rgba(111, 163, 255, 0.6)';
  const lineWidth = connector.style?.width || 2;
  const label = connector.style?.label || '';
  
  // Calculate node dimensions and port positions based on node type
  const getNodeDimensions = (node: Node) => {
    switch (node.type) {
      case 'knowledge_silo':
        return { width: 480, height: 320 };
      case 'ai':
        return { width: 280, height: 200 };
      case 'note':
        return { width: 280, height: 180 };
      case 'group':
        return { width: node.config?.width || 400, height: node.config?.height || 300 };
      case 'diagram':
        return { width: node.config?.width || 120, height: node.config?.height || 80 };
      default:
        return { width: 200, height: 100 };
    }
  };

  const fromDimensions = getNodeDimensions(fromNode);
  const toDimensions = getNodeDimensions(toNode);
  
  // Output port is on the right side, middle vertically
  const startX = fromNode.position.x + fromDimensions.width;
  const startY = fromNode.position.y + fromDimensions.height / 2;
  
  // Input port is on the left side, middle vertically
  const endX = toNode.position.x;
  const endY = toNode.position.y + toDimensions.height / 2;
  
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  const cp1X = startX + Math.min(distance * 0.5, 150);
  const cp1Y = startY + (deltaY * 0.1);
  const cp2X = endX - Math.min(distance * 0.5, 150);
  const cp2Y = endY - (deltaY * 0.1);
  
  const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
  
  // Calculate arrow angle at the end of the curve
  const arrowSize = 10;
  const angle = Math.atan2(cp2Y - endY, cp2X - endX);
  const arrowPoint1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);
  
  // Dash array based on line type
  const getDashArray = () => {
    switch (lineType) {
      case 'dashed': return '10,5';
      case 'dotted': return '2,4';
      case 'bidirectional':
      case 'solid':
      default: return 'none';
    }
  };
  
  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${connector.id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={selected ? '#6fa3ff' : lineColor}
          />
        </marker>
        {lineType === 'bidirectional' && (
          <marker
            id={`arrowhead-reverse-${connector.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M9,0 L9,6 L0,3 z"
              fill={selected ? '#6fa3ff' : lineColor}
            />
          </marker>
        )}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id={`gradient-${connector.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(111, 163, 255, 0.8)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.6)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
        </linearGradient>
      </defs>
      
      {selected && (
        <path
          d={pathData}
          stroke="rgba(111, 163, 255, 0.3)"
          strokeWidth="8"
          fill="none"
          filter="url(#glow)"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      <path
        ref={pathRef}
        d={pathData}
        stroke={selected ? `url(#gradient-${connector.id})` : lineColor}
        strokeWidth={selected ? lineWidth + 1 : lineWidth}
        fill="none"
        strokeDasharray={getDashArray()}
        markerEnd={`url(#arrowhead-${connector.id})`}
        markerStart={lineType === 'bidirectional' ? `url(#arrowhead-reverse-${connector.id})` : undefined}
        style={{ 
          pointerEvents: 'stroke',
          transition: 'all 0.3s ease',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connector.id);
        }}
      />
      
      {/* Label if exists */}
      {label && (
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2 - 10}
          fill="rgba(255, 255, 255, 0.9)"
          fontSize="12"
          fontWeight="500"
          textAnchor="middle"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
