'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Activity } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { CodeEditor } from '@/components/editor/CodeEditor';

interface InspectorProps {
  className?: string;
}

export function Inspector({ className }: InspectorProps) {
  const { selectedNode, nodes, updateNode } = useCanvasStore();
  const [activeTab, setActiveTab] = useState('configure');
  const [artifacts, setArtifacts] = useState<any[]>([]);
  
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  useEffect(() => {
    // Load artifacts from localStorage
    const savedArtifacts = localStorage.getItem('arkham_artifacts');
    if (savedArtifacts) {
      setArtifacts(JSON.parse(savedArtifacts));
    }
  }, [selectedNode]);
  
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
      
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
        {activeTab === 'configure' && (
          <div className="space-y-4">
            {/* Dataset Configuration */}
            {selectedNodeData.type === 'dataset' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Dataset Name</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.name || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, name: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                    placeholder="My Dataset"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Row Count</label>
                  <input
                    type="number"
                    value={selectedNodeData.config.rows || 0}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, rows: Number(e.target.value) }
                    })}
                    className="input-field w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">Schema</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedNodeData.config.schema?.map((field: any, index: number) => (
                      <div key={index} className="bg-background/50 rounded p-2 text-xs">
                        <div className="font-mono">{field.name}</div>
                        <div className="text-text-subtle text-[10px]">{field.type} {field.nullable ? '(nullable)' : ''}</div>
                      </div>
                    ))}
                    {(!selectedNodeData.config.schema || selectedNodeData.config.schema.length === 0) && (
                      <div className="text-text-subtle text-xs italic">No schema defined</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Filter Configuration */}
            {selectedNodeData.type === 'filter' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Filter Mode</label>
                  <select
                    value={selectedNodeData.config.mode || 'include'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, mode: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Condition</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.condition || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, condition: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="value > 100"
                  />
                </div>
              </>
            )}

            {/* Join Configuration */}
            {selectedNodeData.type === 'join' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Join Type</label>
                  <select
                    value={selectedNodeData.config.joinType || 'inner'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, joinType: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="inner">Inner Join</option>
                    <option value="left">Left Join</option>
                    <option value="right">Right Join</option>
                    <option value="full">Full Outer Join</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Left Key</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.leftKey || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, leftKey: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="id"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Right Key</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.rightKey || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, rightKey: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="user_id"
                  />
                </div>
              </>
            )}

            {/* If/Then Configuration */}
            {selectedNodeData.type === 'if' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-2">Conditions</label>
                  <div className="space-y-2">
                    {selectedNodeData.config.conditions?.map((cond: any, index: number) => (
                      <div key={index} className="bg-background/50 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={cond.label || `condition_${index + 1}`}
                            onChange={(e) => {
                              const newConditions = [...selectedNodeData.config.conditions];
                              newConditions[index] = { ...newConditions[index], label: e.target.value };
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, conditions: newConditions }
                              });
                            }}
                            className="input-field w-full text-xs"
                            placeholder="Label"
                          />
                          <button
                            onClick={() => {
                              const newConditions = selectedNodeData.config.conditions.filter((_: any, i: number) => i !== index);
                              const newOutputs = selectedNodeData.outputs.filter((o: string) => o !== cond.label);
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, conditions: newConditions },
                                outputs: newOutputs
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cond.expression || ''}
                          onChange={(e) => {
                            const newConditions = [...selectedNodeData.config.conditions];
                            newConditions[index] = { ...newConditions[index], expression: e.target.value };
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, conditions: newConditions }
                            });
                          }}
                          className="input-field w-full text-xs font-mono"
                          placeholder="value > 100"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const newLabel = `condition_${selectedNodeData.config.conditions.length + 1}`;
                      const newConditions = [...(selectedNodeData.config.conditions || []), { expression: '', label: newLabel }];
                      const newOutputs = [...selectedNodeData.outputs, newLabel];
                      updateNode(selectedNodeData.id, {
                        config: { ...selectedNodeData.config, conditions: newConditions },
                        outputs: newOutputs
                      });
                    }}
                    className="mt-2 w-full btn-secondary text-xs"
                  >
                    + Add Condition
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Default Output</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.defaultOutput || 'else'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, defaultOutput: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                    placeholder="else"
                  />
                </div>
              </>
            )}

            {/* API Configuration */}
            {selectedNodeData.type === 'api' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">HTTP Method</label>
                  <select
                    value={selectedNodeData.config.method || 'POST'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, method: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Endpoint URL</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.endpoint || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, endpoint: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Body Template</label>
                  <textarea
                    value={selectedNodeData.config.bodyTemplate || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, bodyTemplate: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    rows={3}
                    placeholder='{"data": "{{input}}"}'
                  />
                </div>
              </>
            )}

            {/* Enrich Configuration */}
            {selectedNodeData.type === 'enrich' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Enrich Type</label>
                  <select
                    value={selectedNodeData.config.enrichType || 'lookup'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, enrichType: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="lookup">Lookup</option>
                    <option value="calculate">Calculate</option>
                    <option value="geocode">Geocode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Source Field</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.sourceField || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, sourceField: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Target Field</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.targetField || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, targetField: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="coordinates"
                  />
                </div>
              </>
            )}

            {/* Code Canvas Configuration */}
            {selectedNodeData.type === 'code' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Language</label>
                  <select
                    value={selectedNodeData.config.language || 'javascript'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, language: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Main Code</label>
                  {(selectedNodeData.config.blocks && selectedNodeData.config.blocks.length > 0) || (artifacts && artifacts.length > 0) ? (
                    <div className="mb-2 p-2 bg-background/30 rounded border border-border/20 text-[10px] text-text-subtle space-y-2">
                      {selectedNodeData.config.blocks && selectedNodeData.config.blocks.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Code Blocks:</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedNodeData.config.blocks.map((block: any, idx: number) => (
                              <code key={idx} className="px-1.5 py-0.5 bg-accent/10 text-accent rounded font-mono">
                                {block.name || `block${idx + 1}`}()
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                      {artifacts && artifacts.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Artifacts:</div>
                          <div className="flex flex-wrap gap-2">
                            {artifacts.filter(a => a.language === selectedNodeData.config.language).map((artifact: any) => (
                              <code key={artifact.id} className="px-1.5 py-0.5 bg-purple-400/10 text-purple-400 rounded font-mono">
                                {artifact.name}()
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-[9px] italic border-t border-border/10 pt-1">
                        Call these as functions in your main code
                      </div>
                    </div>
                  ) : null}
                  <CodeEditor
                    value={selectedNodeData.config.code || ''}
                    onChange={(value) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, code: value || '' }
                    })}
                    language={selectedNodeData.config.language || 'javascript'}
                    height="300px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">Code Blocks (composable)</label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedNodeData.config.blocks?.map((block: any, index: number) => (
                      <div key={index} className="bg-background/50 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={block.name || `Block ${index + 1}`}
                            onChange={(e) => {
                              const newBlocks = [...selectedNodeData.config.blocks];
                              newBlocks[index] = { ...newBlocks[index], name: e.target.value };
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, blocks: newBlocks }
                              });
                            }}
                            className="input-field w-full text-xs"
                            placeholder="Block name"
                          />
                          <button
                            onClick={() => {
                              const newBlocks = selectedNodeData.config.blocks.filter((_: any, i: number) => i !== index);
                              updateNode(selectedNodeData.id, {
                                config: { ...selectedNodeData.config, blocks: newBlocks }
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        <CodeEditor
                          value={block.code || ''}
                          onChange={(value) => {
                            const newBlocks = [...selectedNodeData.config.blocks];
                            newBlocks[index] = { ...newBlocks[index], code: value || '' };
                            updateNode(selectedNodeData.id, {
                              config: { ...selectedNodeData.config, blocks: newBlocks }
                            });
                          }}
                          language={selectedNodeData.config.language || 'javascript'}
                          height="200px"
                          minimap={false}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const newBlocks = [...(selectedNodeData.config.blocks || []), { name: `block${(selectedNodeData.config.blocks?.length || 0) + 1}`, code: '' }];
                      updateNode(selectedNodeData.id, {
                        config: { ...selectedNodeData.config, blocks: newBlocks }
                      });
                    }}
                    className="mt-2 w-full btn-secondary text-xs"
                  >
                    + Add Code Block
                  </button>
                  <div className="mt-2 p-2 bg-background/30 rounded border border-border/20 text-[10px] text-text-subtle">
                    <div className="font-medium mb-1">💡 Usage:</div>
                    <div className="space-y-1">
                      <div>• <strong>Code Blocks</strong>: Define reusable functions specific to this node</div>
                      <div>• <strong>Artifacts</strong>: Import global functions from Artifacts manager (same language only)</div>
                      <div>• Reference them in main code by name: <code className="px-1 bg-accent/10 text-accent rounded font-mono">block1()</code> or <code className="px-1 bg-purple-400/10 text-purple-400 rounded font-mono">validateEmail()</code></div>
                      <div className="text-[9px] italic mt-1">Example: Create "validate" artifact globally, then call validate(data) in any code node</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-border/30">
              <label className="block text-xs font-medium mb-1 text-text-subtle">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={Math.round(selectedNodeData.position.x)}
                  onChange={(e) => updateNode(selectedNodeData.id, {
                    position: { ...selectedNodeData.position, x: Number(e.target.value) }
                  })}
                  className="input-field w-full text-xs"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={Math.round(selectedNodeData.position.y)}
                  onChange={(e) => updateNode(selectedNodeData.id, {
                    position: { ...selectedNodeData.position, y: Number(e.target.value) }
                  })}
                  className="input-field w-full text-xs"
                  placeholder="Y"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-text-subtle">Inputs</label>
              <div className="text-xs text-text-subtle bg-background/50 rounded p-2">
                {selectedNodeData.inputs.length > 0 ? selectedNodeData.inputs.join(', ') : 'None'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-text-subtle">Outputs</label>
              <div className="text-xs text-text-subtle bg-background/50 rounded p-2">
                {selectedNodeData.outputs.length > 0 ? selectedNodeData.outputs.join(', ') : 'None'}
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
