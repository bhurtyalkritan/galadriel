'use client';

import React, { useRef } from 'react';
import { Connector } from '@/types';

interface ConnectorLineProps {
  connector: Connector;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ConnectorLine({ 
  connector, 
  fromPosition, 
  toPosition, 
  selected, 
  onSelect 
}: ConnectorLineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  
  const startX = fromPosition.x + 200;
  const startY = fromPosition.y + 50;
  const endX = toPosition.x;
  const endY = toPosition.y + 50;
  
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  const cp1X = startX + Math.min(distance * 0.5, 150);
  const cp1Y = startY + (deltaY * 0.1);
  const cp2X = endX - Math.min(distance * 0.5, 150);
  const cp2Y = endY - (deltaY * 0.1);
  
  const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
  
  const isReversed = deltaX < 0;
  const curvature = Math.abs(deltaY) > 100 ? 0.7 : 0.3;
  
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
        stroke={selected ? `url(#gradient-${connector.id})` : 'rgba(111, 163, 255, 0.4)'}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        strokeDasharray={selected ? "none" : "5,5"}
        strokeDashoffset={selected ? 0 : -10}
        style={{ 
          pointerEvents: 'stroke',
          transition: 'all 0.3s ease',
          animation: selected ? 'none' : 'dash 2s linear infinite'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connector.id);
        }}
      />
      
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </svg>
  );
}
