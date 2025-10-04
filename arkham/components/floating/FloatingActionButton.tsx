'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Database, Filter, GitBranch, Zap, Download, Globe, Brain, BarChart3, StickyNote, MoreHorizontal, X, Archive, Sparkles } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { generateId, cn } from '@/lib/utils';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [recentNodeTypes, setRecentNodeTypes] = useState<string[]>([]);
  const { addNode, nodes } = useCanvasStore();

  const nodeTypes = [
    { type: 'dataset', icon: Database, label: 'Dataset', color: 'text-blue-400', description: 'Load and manage data sources' },
    { type: 'filter', icon: Filter, label: 'Filter', color: 'text-yellow-400', description: 'Filter data based on conditions' },
    { type: 'join', icon: GitBranch, label: 'Join', color: 'text-green-400', description: 'Combine datasets together' },
    { type: 'if', icon: GitBranch, label: 'If/Then', color: 'text-purple-400', description: 'Conditional branching logic' },
    { type: 'api', icon: Zap, label: 'API', color: 'text-red-400', description: 'Call external APIs' },
    { type: 'enrich', icon: Download, label: 'Enrich', color: 'text-orange-400', description: 'Enhance data with lookups' },
    { type: 'code', icon: Globe, label: 'Code Canvas', color: 'text-cyan-400', description: 'Write custom transformations' },
    { type: 'ml', icon: Brain, label: 'ML Model', color: 'text-pink-400', description: 'Train and run ML models' },
    { type: 'visualization', icon: BarChart3, label: 'Visualization', color: 'text-emerald-400', description: 'Create data visualizations' },
    { type: 'note', icon: StickyNote, label: 'Note', color: 'text-amber-400', description: 'Add annotations and notes' },
    { type: 'knowledge_silo', icon: Archive, label: 'Knowledge Silo', color: 'text-indigo-400', description: 'Store files for AI context' },
    { type: 'ai', icon: Sparkles, label: 'AI Assistant', color: 'text-violet-400', description: 'Conversational AI model' },
  ];

  // Load recent node types from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arkham_recent_nodes');
    if (saved) {
      setRecentNodeTypes(JSON.parse(saved));
    }
  }, []);

  const trackRecentNode = (type: string) => {
    const updated = [type, ...recentNodeTypes.filter(t => t !== type)].slice(0, 5);
    setRecentNodeTypes(updated);
    localStorage.setItem('arkham_recent_nodes', JSON.stringify(updated));
  };

  const recentNodes = nodeTypes.filter(n => recentNodeTypes.includes(n.type)).slice(0, 5);

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
        
      case 'ml':
        config = { 
          framework: 'pytorch', // pytorch, tensorflow, sklearn
          modelType: 'classification', // classification, regression, clustering
          notebookArtifact: '',
          hyperparameters: {
            epochs: 10,
            learningRate: 0.001,
            batchSize: 32
          },
          trainedModel: null
        };
        inputs = ['training_data'];
        outputs = ['model', 'predictions'];
        break;
        
      case 'visualization':
        config = { 
          chartType: 'bar', // bar, line, scatter, pie, heatmap, histogram
          xAxis: '',
          yAxis: '',
          title: 'Data Visualization',
          theme: 'dark',
          savedChart: null
        };
        inputs = ['data'];
        outputs = ['chart'];
        break;
        
      case 'note':
        config = { 
          title: 'Note',
          content: 'Add your notes here...',
          color: 'amber', // amber, blue, green, purple, pink
          fontSize: 14,
          isLocked: false,
          password: '',
        };
        inputs = [];
        outputs = [];
        break;
        
      case 'knowledge_silo':
        config = { 
          name: 'Knowledge Silo',
          items: [], // Array of { id, type: 'dataset'|'file'|'image'|'pdf', name, data }
          description: 'A collection of knowledge resources',
        };
        inputs = [];
        outputs = ['knowledge'];
        break;
        
      case 'ai':
        config = { 
          name: 'AI Assistant',
          modelId: 'gpt-4', // gpt-4, gpt-3.5, claude-3, gemini-pro, custom
          temperature: 70,
          systemPrompt: 'You are a helpful AI assistant.',
          maxTokens: 2000,
        };
        inputs = ['knowledge'];
        outputs = ['response'];
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
    trackRecentNode(type);
    setIsOpen(false);
    setShowAllNodes(false);
  };

  const displayNodes = recentNodes.length > 0 ? recentNodes : nodeTypes.slice(0, 5);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'mb-4' : 'mb-0'}`}>
          {isOpen && displayNodes.map((nodeType) => {
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
          {isOpen && (
            <button
              onClick={() => setShowAllNodes(true)}
              className="group flex items-center gap-3 bg-accent/10 backdrop-blur-sm border border-accent/30 text-accent hover:text-accent-hover p-3 rounded-lg transition-all duration-200 hover:bg-accent/20 hover:scale-105 hover:shadow-lg"
            >
              <MoreHorizontal size={18} />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                More Nodes
              </span>
            </button>
          )}
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

      {/* All Nodes Grid Modal */}
      {showAllNodes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border/50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div>
                <h2 className="text-xl font-bold text-text">Add Node</h2>
                <p className="text-sm text-text-secondary mt-1">Select a node type to add to your pipeline</p>
              </div>
              <button
                onClick={() => setShowAllNodes(false)}
                className="text-text-secondary hover:text-text transition-colors p-2 hover:bg-background/50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid Content */}
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <button
                      key={nodeType.type}
                      onClick={() => handleAddNode(nodeType.type)}
                      className="group relative bg-background/50 hover:bg-background border border-border/30 hover:border-accent/50 rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-card/50 group-hover:bg-card transition-colors",
                          nodeType.color.includes('text-') ? '' : 'bg-accent/10'
                        )}>
                          <Icon size={20} className={nodeType.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text text-sm mb-1">{nodeType.label}</h3>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                            {nodeType.description}
                          </p>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
