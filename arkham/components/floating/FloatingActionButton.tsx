'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Database, Filter, GitBranch, Zap, Download, Globe } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { generateId } from '@/lib/utils';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { addNode, nodes } = useCanvasStore();

  const nodeTypes = [
    { type: 'dataset', icon: Database, label: 'Dataset', color: 'text-blue-400' },
    { type: 'filter', icon: Filter, label: 'Filter', color: 'text-yellow-400' },
    { type: 'join', icon: GitBranch, label: 'Join', color: 'text-green-400' },
    { type: 'if', icon: GitBranch, label: 'If/Then', color: 'text-purple-400' },
    { type: 'api', icon: Zap, label: 'API', color: 'text-red-400' },
    { type: 'enrich', icon: Download, label: 'Enrich', color: 'text-orange-400' },
    { type: 'code', icon: Globe, label: 'Code Canvas', color: 'text-cyan-400' },
  ];

  const handleAddNode = (type: string) => {
    let config = {};
    let inputs: string[] = [];
    let outputs: string[] = [];
    
    switch (type) {
      case 'dataset':
        config = { 
          name: `Dataset ${nodes.length + 1}`,
          rows: 1000,
          schema: [
            { name: 'id', type: 'number', nullable: false },
            { name: 'name', type: 'string', nullable: false },
            { name: 'value', type: 'number', nullable: true }
          ]
        };
        inputs = [];
        outputs = ['data'];
        break;
        
      case 'filter':
        config = { 
          condition: '',
          mode: 'include' // include or exclude
        };
        inputs = ['data'];
        outputs = ['filtered'];
        break;
        
      case 'join':
        config = { 
          joinType: 'inner', // inner, left, right, full
          leftKey: '',
          rightKey: ''
        };
        inputs = ['left', 'right'];
        outputs = ['joined'];
        break;
        
      case 'if':
        config = { 
          conditions: [
            { expression: '', label: 'condition_1' }
          ],
          defaultOutput: 'else'
        };
        inputs = ['data'];
        outputs = ['condition_1', 'else'];
        break;
        
      case 'api':
        config = { 
          endpoint: '',
          method: 'POST',
          headers: {},
          bodyTemplate: ''
        };
        inputs = ['data'];
        outputs = ['response'];
        break;
        
      case 'enrich':
        config = { 
          enrichType: 'lookup', // lookup, calculate, geocode
          sourceField: '',
          targetField: ''
        };
        inputs = ['data'];
        outputs = ['enriched'];
        break;
        
      case 'code':
        config = { 
          language: 'javascript',
          code: '// Transform your data\nfunction transform(input) {\n  return input;\n}',
          blocks: []
        };
        inputs = ['input'];
        outputs = ['output'];
        break;
    }
    
    const newNode = {
      id: generateId(),
      type: type as any,
      config,
      inputs,
      outputs,
      position: { 
        x: 400 + (nodes.length * 50),
        y: 300 + (nodes.length * 50)
      },
      owner: 'current-user',
      createdAt: new Date().toISOString(),
    };
    
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
