'use client';

import React from 'react';
import { Square, Navigation, Palette, Maximize2 } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';

interface GroupsPanelProps {
  className?: string;
}

export function GroupsPanel({ className }: GroupsPanelProps) {
  const { nodes, updateNode, setCanvasOffset, setCanvasScale } = useCanvasStore();

  // Get all group nodes
  const groupNodes = nodes.filter(node => node.type === 'group');

  // Calculate which nodes are inside each group
  const getNodesInGroup = (groupNode: typeof nodes[0]) => {
    const groupBounds = {
      x1: groupNode.position.x,
      y1: groupNode.position.y,
      x2: groupNode.position.x + groupNode.config.width,
      y2: groupNode.position.y + groupNode.config.height,
    };

    return nodes.filter(node => {
      if (node.id === groupNode.id) return false;
      if (node.type === 'group') return false; // Don't include other groups
      
      const nodeWidth = node.type === 'knowledge_silo' ? 480 : node.type === 'ai' ? 280 : node.type === 'note' ? 280 : 200;
      const nodeHeight = node.type === 'knowledge_silo' ? 320 : node.type === 'ai' ? 200 : node.type === 'note' ? 180 : 100;
      
      const nodeCenterX = node.position.x + nodeWidth / 2;
      const nodeCenterY = node.position.y + nodeHeight / 2;

      return (
        nodeCenterX >= groupBounds.x1 &&
        nodeCenterX <= groupBounds.x2 &&
        nodeCenterY >= groupBounds.y1 &&
        nodeCenterY <= groupBounds.y2
      );
    });
  };

  const handleTeleportToGroup = (groupNode: typeof nodes[0]) => {
    // Center the viewport on the group
    const groupCenterX = groupNode.position.x + groupNode.config.width / 2;
    const groupCenterY = groupNode.position.y + groupNode.config.height / 2;
    
    // Move viewport to center the group (assuming viewport center is 0,0)
    setCanvasOffset({ x: -groupCenterX + 400, y: -groupCenterY + 300 });
    setCanvasScale(1); // Reset zoom
  };

  const colorOptions = [
    { value: 'slate', label: 'Slate', class: 'bg-slate-400' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-400' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-400' },
    { value: 'green', label: 'Green', class: 'bg-green-400' },
    { value: 'amber', label: 'Amber', class: 'bg-amber-400' },
    { value: 'red', label: 'Red', class: 'bg-red-400' },
  ];

  if (groupNodes.length === 0) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center gap-2 mb-6">
          <Square size={20} className="text-accent" />
          <h2 className="text-lg font-medium">Groups</h2>
        </div>

        <div className="bg-background/50 border border-border/30 rounded-lg p-6 text-center">
          <Square size={48} className="text-text-subtle mx-auto mb-3 opacity-50" />
          <p className="text-sm text-text-subtle mb-2">No groups created yet</p>
          <p className="text-xs text-text-subtle">
            Create a group from the + menu to organize your canvas nodes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-6 overflow-y-auto`}>
      <div className="flex items-center gap-2 mb-6">
        <Square size={20} className="text-accent" />
        <h2 className="text-lg font-medium">Groups</h2>
        <span className="text-xs text-text-subtle ml-auto">{groupNodes.length} total</span>
      </div>

      <div className="space-y-4">
        {groupNodes.map(groupNode => {
          const nodesInGroup = getNodesInGroup(groupNode);
          
          return (
            <div
              key={groupNode.id}
              className="bg-background/50 border border-border/30 rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              {/* Group Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={groupNode.config.label || 'Unnamed Group'}
                    onChange={(e) => {
                      updateNode(groupNode.id, {
                        config: { ...groupNode.config, label: e.target.value },
                      });
                    }}
                    className="bg-transparent text-sm font-medium text-text outline-none border-b border-transparent hover:border-border/30 focus:border-accent/50 transition-colors w-full"
                    placeholder="Group name"
                  />
                  <div className="text-xs text-text-subtle mt-1">
                    {nodesInGroup.length} node{nodesInGroup.length !== 1 ? 's' : ''} inside
                  </div>
                </div>

                <button
                  onClick={() => handleTeleportToGroup(groupNode)}
                  className="p-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-colors"
                  title="Jump to group"
                >
                  <Navigation size={14} className="text-accent" />
                </button>
              </div>

              {/* Nodes in Group */}
              {nodesInGroup.length > 0 && (
                <div className="mb-3 space-y-1">
                  {nodesInGroup.slice(0, 3).map(node => (
                    <div
                      key={node.id}
                      className="text-xs text-text-subtle flex items-center gap-2 px-2 py-1 bg-background/30 rounded"
                    >
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <span className="truncate">
                        {node.config?.name || node.config?.label || node.config?.title || node.type}
                      </span>
                    </div>
                  ))}
                  {nodesInGroup.length > 3 && (
                    <div className="text-xs text-text-subtle px-2 py-1">
                      + {nodesInGroup.length - 3} more
                    </div>
                  )}
                </div>
              )}

              {/* Group Settings */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20">
                {/* Color */}
                <div>
                  <label className="text-xs text-text-subtle mb-1 block flex items-center gap-1">
                    <Palette size={12} />
                    Color
                  </label>
                  <select
                    value={groupNode.config.color}
                    onChange={(e) => {
                      updateNode(groupNode.id, {
                        config: { ...groupNode.config, color: e.target.value },
                      });
                    }}
                    className="w-full bg-background/50 border border-border/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent/50"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opacity */}
                <div>
                  <label className="text-xs text-text-subtle mb-1 block">
                    Opacity: {groupNode.config.opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={groupNode.config.opacity}
                    onChange={(e) => {
                      updateNode(groupNode.id, {
                        config: { ...groupNode.config, opacity: parseInt(e.target.value) },
                      });
                    }}
                    className="w-full"
                  />
                </div>

                {/* Size */}
                <div className="col-span-2">
                  <label className="text-xs text-text-subtle mb-1 block flex items-center gap-1">
                    <Maximize2 size={12} />
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-subtle">W:</span>
                      <input
                        type="number"
                        value={groupNode.config.width}
                        onChange={(e) => {
                          updateNode(groupNode.id, {
                            config: { ...groupNode.config, width: Math.max(200, parseInt(e.target.value) || 200) },
                          });
                        }}
                        className="flex-1 bg-background/50 border border-border/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent/50"
                        min="200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-subtle">H:</span>
                      <input
                        type="number"
                        value={groupNode.config.height}
                        onChange={(e) => {
                          updateNode(groupNode.id, {
                            config: { ...groupNode.config, height: Math.max(150, parseInt(e.target.value) || 150) },
                          });
                        }}
                        className="flex-1 bg-background/50 border border-border/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent/50"
                        min="150"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
