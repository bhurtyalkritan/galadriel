'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Node } from '@/types';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas';

interface AINodeProps {
  node: Node;
  selected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onInputPortMouseUp: (e: React.MouseEvent) => void;
  onInputPortMouseEnter: (e: React.MouseEvent) => void;
  onOutputPortMouseDown: (e: React.MouseEvent) => void;
}

export function AINode({
  node,
  selected,
  isDragging,
  onMouseDown,
  onInputPortMouseUp,
  onInputPortMouseEnter,
  onOutputPortMouseDown,
}: AINodeProps) {
  const { updateNode } = useCanvasStore();

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
      onMouseDown={onMouseDown}
    >
      {/* Input Port - for knowledge bases */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <button
          className="connection-port w-5 h-5 bg-violet-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer z-20 -translate-x-1/2"
          onMouseUp={onInputPortMouseUp}
          onMouseEnter={onInputPortMouseEnter}
          title="Input: knowledge"
        />
      </div>

      {/* Output Port - for chat/responses */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <button
          className="connection-port w-5 h-5 bg-violet-400 rounded-full border-2 border-white shadow-md hover:scale-150 hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer z-20 translate-x-1/2"
          onMouseDown={onOutputPortMouseDown}
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
