'use client';

import React, { useState } from 'react';
import { X, Settings, Database, Activity } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';

interface InspectorProps {
  className?: string;
}

export function Inspector({ className }: InspectorProps) {
  const { selectedNode, nodes, updateNode } = useCanvasStore();
  const [activeTab, setActiveTab] = useState('configure');
  
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  
  if (!selectedNodeData) {
    return (
      <div className={`${className}`}>
        <div className="p-4 text-center text-text-subtle">
          <div className="mb-4">
            <Settings size={32} className="mx-auto mb-2 opacity-50" />
          </div>
          Select a node to configure
        </div>
      </div>
    );
  }
  
  const tabs = [
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'schema', label: 'Schema', icon: Database },
    { id: 'metrics', label: 'Metrics', icon: Activity },
  ];
  
  return (
    <div className={`${className}`}>
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-sm font-medium">{selectedNodeData.type} Node</h3>
        <button
          className="text-text-subtle hover:text-text transition-colors"
          onClick={() => useCanvasStore.getState().setSelectedNode(null)}
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="border-b border-border/30">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 text-xs border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-subtle hover:text-text'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'configure' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Node ID</label>
              <input
                type="text"
                value={selectedNodeData.id}
                disabled
                className="input-field w-full text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">Type</label>
              <input
                type="text"
                value={selectedNodeData.type}
                disabled
                className="input-field w-full text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={selectedNodeData.position.x}
                  onChange={(e) => updateNode(selectedNodeData.id, {
                    position: { ...selectedNodeData.position, x: Number(e.target.value) }
                  })}
                  className="input-field text-xs"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={selectedNodeData.position.y}
                  onChange={(e) => updateNode(selectedNodeData.id, {
                    position: { ...selectedNodeData.position, y: Number(e.target.value) }
                  })}
                  className="input-field text-xs"
                  placeholder="Y"
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'schema' && (
          <div className="text-xs text-text-subtle">
            Schema information for {selectedNodeData.type} node
          </div>
        )}
        
        {activeTab === 'metrics' && (
          <div className="text-xs text-text-subtle">
            Performance metrics for {selectedNodeData.type} node
          </div>
        )}
      </div>
    </div>
  );
}
