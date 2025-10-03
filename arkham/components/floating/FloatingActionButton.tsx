'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Database, Filter, GitBranch, Zap, Download, Globe } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { generateId } from '@/lib/utils';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { addNode, nodes, canvasOffset, canvasScale } = useCanvasStore();

  useEffect(() => {
    console.log('Current nodes:', nodes.length);
  }, [nodes]);

  const nodeTypes = [
    { type: 'dataset', icon: Database, label: 'Dataset', color: 'text-blue-400' },
    { type: 'filter', icon: Filter, label: 'Filter', color: 'text-yellow-400' },
    { type: 'join', icon: GitBranch, label: 'Join', color: 'text-green-400' },
    { type: 'if', icon: GitBranch, label: 'If/Then', color: 'text-purple-400' },
    { type: 'api', icon: Zap, label: 'API', color: 'text-red-400' },
    { type: 'enrich', icon: Download, label: 'Enrich', color: 'text-orange-400' },
  ];

  const handleAddNode = (type: string) => {
    let config = {};
    let outputs = [];
    
    if (type === 'dataset') {
      config = { 
        name: `Sample Dataset ${Math.floor(Math.random() * 100)}`,
        rows: Math.floor(Math.random() * 10000) + 1000,
        schema: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'value', type: 'number' }
        ]
      };
      outputs = ['data_out'];
    } else if (type === 'filter') {
      config = { condition: 'value > 0' };
    } else if (type === 'api') {
      config = { 
        endpoint: 'https://api.example.com/webhook',
        method: 'POST'
      };
    }
    
    const newNode = {
      id: generateId(),
      type: type as any,
      config,
      inputs: type === 'dataset' ? [] : ['data_in'],
      outputs: type === 'api' ? [] : ['data_out'],
      position: { 
        x: (window.innerWidth / 2 - canvasOffset.x) / canvasScale,
        y: (window.innerHeight / 2 - canvasOffset.y) / canvasScale + (nodes.length * 150)
      },
      owner: 'current-user',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Adding node:', newNode);
    addNode(newNode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'mb-4' : 'mb-0'}`}>
        {isOpen && nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <button
              key={nodeType.type}
              onClick={() => handleAddNode(nodeType.type)}
              className="group flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border/30 text-text hover:text-accent p-3 rounded-lg transition-all duration-200 hover:bg-card hover:scale-105 hover:shadow-lg"
            >
              <Icon size={18} className={nodeType.color} />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {nodeType.label}
              </span>
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-accent hover:bg-accent-hover text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
