'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Activity } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { cn } from '@/lib/utils';

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

            {/* Machine Learning Configuration */}
            {selectedNodeData.type === 'ml' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Framework</label>
                  <select
                    value={selectedNodeData.config.framework || 'pytorch'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, framework: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="pytorch">PyTorch</option>
                    <option value="tensorflow">TensorFlow</option>
                    <option value="sklearn">Scikit-Learn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Model Type</label>
                  <select
                    value={selectedNodeData.config.modelType || 'classification'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, modelType: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                    <option value="clustering">Clustering</option>
                    <option value="neural_network">Neural Network</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Notebook Artifact</label>
                  <select
                    value={selectedNodeData.config.notebookArtifact || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, notebookArtifact: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="">None</option>
                    {artifacts.filter(a => a.language === 'python' && a.name.includes('notebook')).map(artifact => (
                      <option key={artifact.id} value={artifact.id}>{artifact.name}</option>
                    ))}
                  </select>
                  <div className="mt-1 text-[10px] text-text-subtle italic">
                    Select a Python notebook artifact for custom training
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">Hyperparameters</label>
                  <div className="space-y-2 bg-background/30 rounded p-2">
                    <div>
                      <label className="block text-[10px] font-medium mb-1">Epochs</label>
                      <input
                        type="number"
                        value={selectedNodeData.config.hyperparameters?.epochs || 10}
                        onChange={(e) => updateNode(selectedNodeData.id, {
                          config: { 
                            ...selectedNodeData.config, 
                            hyperparameters: { 
                              ...selectedNodeData.config.hyperparameters, 
                              epochs: Number(e.target.value) 
                            }
                          }
                        })}
                        className="input-field w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium mb-1">Learning Rate</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedNodeData.config.hyperparameters?.learningRate || 0.001}
                        onChange={(e) => updateNode(selectedNodeData.id, {
                          config: { 
                            ...selectedNodeData.config, 
                            hyperparameters: { 
                              ...selectedNodeData.config.hyperparameters, 
                              learningRate: Number(e.target.value) 
                            }
                          }
                        })}
                        className="input-field w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium mb-1">Batch Size</label>
                      <input
                        type="number"
                        value={selectedNodeData.config.hyperparameters?.batchSize || 32}
                        onChange={(e) => updateNode(selectedNodeData.id, {
                          config: { 
                            ...selectedNodeData.config, 
                            hyperparameters: { 
                              ...selectedNodeData.config.hyperparameters, 
                              batchSize: Number(e.target.value) 
                            }
                          }
                        })}
                        className="input-field w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
                {selectedNodeData.config.trainedModel && (
                  <div className="p-3 bg-green-400/10 border border-green-400/30 rounded text-xs">
                    <div className="font-medium text-green-400 mb-1">✓ Model Trained</div>
                    <div className="text-text-subtle text-[10px]">
                      Ready to make predictions on new data
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Visualization Configuration */}
            {selectedNodeData.type === 'visualization' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Chart Type</label>
                  <select
                    value={selectedNodeData.config.chartType || 'bar'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, chartType: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="pie">Pie Chart</option>
                    <option value="heatmap">Heatmap</option>
                    <option value="histogram">Histogram</option>
                    <option value="box">Box Plot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.title || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, title: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                    placeholder="My Visualization"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">X-Axis Field</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.xAxis || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, xAxis: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="field_name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Y-Axis Field</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.yAxis || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, yAxis: e.target.value }
                    })}
                    className="input-field w-full text-xs font-mono"
                    placeholder="field_name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Theme</label>
                  <select
                    value={selectedNodeData.config.theme || 'dark'}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      config: { ...selectedNodeData.config, theme: e.target.value }
                    })}
                    className="input-field w-full text-xs"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                {selectedNodeData.config.savedChart && (
                  <div className="space-y-2">
                    <div className="p-3 bg-green-400/10 border border-green-400/30 rounded text-xs">
                      <div className="font-medium text-green-400 mb-1">✓ Chart Saved</div>
                      <div className="text-text-subtle text-[10px]">
                        Visualization saved as artifact
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Save to artifacts
                        const savedArtifacts = localStorage.getItem('arkham_artifacts');
                        const artifacts = savedArtifacts ? JSON.parse(savedArtifacts) : [];
                        const newArtifact = {
                          id: Date.now().toString(),
                          name: selectedNodeData.config.title || 'visualization',
                          description: `${selectedNodeData.config.chartType} chart`,
                          type: 'visualization',
                          data: selectedNodeData.config.savedChart,
                          createdAt: new Date().toISOString(),
                        };
                        artifacts.push(newArtifact);
                        localStorage.setItem('arkham_artifacts', JSON.stringify(artifacts));
                      }}
                      className="w-full btn-secondary text-xs"
                    >
                      💾 Save Chart as Artifact
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Note Configuration */}
            {selectedNodeData.type === 'note' && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.title || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, title: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Note title"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Color Theme</label>
                  <select
                    value={selectedNodeData.config.color || 'amber'}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, color: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs"
                  >
                    <option value="amber">Amber</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="18"
                    value={selectedNodeData.config.fontSize || 14}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, fontSize: parseInt(e.target.value) },
                      });
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-text-subtle">{selectedNodeData.config.fontSize || 14}px</span>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Content</label>
                  <textarea
                    value={selectedNodeData.config.content || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, content: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs h-32 resize-none"
                    placeholder="Add your notes here..."
                  />
                  <div className="text-[10px] text-text-subtle mt-1">
                    {selectedNodeData.config.content?.length || 0} characters
                  </div>
                </div>

                {/* Password Protection */}
                <div className="mb-3 p-3 bg-background/50 border border-border/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium flex items-center gap-2">
                      🔒 Password Protection
                    </label>
                    <button
                      onClick={() => {
                        updateNode(selectedNodeData.id, {
                          ...selectedNodeData,
                          config: { 
                            ...selectedNodeData.config, 
                            isLocked: !selectedNodeData.config.isLocked,
                            password: selectedNodeData.config.isLocked ? '' : selectedNodeData.config.password
                          },
                        });
                      }}
                      className={cn(
                        "px-3 py-1 rounded text-xs transition-all",
                        selectedNodeData.config.isLocked 
                          ? "bg-accent/20 text-accent border border-accent/30" 
                          : "bg-background border border-border/30 text-text-subtle hover:border-accent/30"
                      )}
                    >
                      {selectedNodeData.config.isLocked ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  {selectedNodeData.config.isLocked && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Set Password</label>
                      <input
                        type="password"
                        value={selectedNodeData.config.password || ''}
                        onChange={(e) => {
                          updateNode(selectedNodeData.id, {
                            ...selectedNodeData,
                            config: { ...selectedNodeData.config, password: e.target.value },
                          });
                        }}
                        className="input-field w-full text-xs"
                        placeholder="Enter password..."
                      />
                      <div className="text-[10px] text-text-subtle mt-1">
                        {selectedNodeData.config.password ? 
                          `Password set (${selectedNodeData.config.password.length} characters)` : 
                          'No password set - note will be accessible'}
                      </div>
                    </div>
                  )}
                  
                  {!selectedNodeData.config.isLocked && (
                    <div className="text-[10px] text-text-subtle">
                      Enable to protect sensitive note content with a password
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Knowledge Silo Configuration */}
            {selectedNodeData.type === 'knowledge_silo' && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Silo Name</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.name || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, name: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Knowledge Silo"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea
                    value={selectedNodeData.config.description || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, description: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs h-20 resize-none"
                    placeholder="Describe the purpose of this knowledge base..."
                  />
                </div>

                {/* Knowledge Items */}
                <div className="mb-3 p-3 bg-background/50 border border-border/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium flex items-center gap-2">
                      📦 Knowledge Items
                    </label>
                    <span className="text-xs text-text-subtle">
                      {selectedNodeData.config.items?.length || 0} items
                    </span>
                  </div>
                  
                  {selectedNodeData.config.items && selectedNodeData.config.items.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedNodeData.config.items.map((item: any) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-background border border-border/30 rounded text-xs"
                        >
                          <span className="text-lg">{
                            item.type === 'image' ? '🖼️' :
                            item.type === 'pdf' ? '📄' :
                            item.type === 'dataset' ? '📊' : '📁'
                          }</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="text-[10px] text-text-subtle">
                              {item.type} {item.size && `• ${(item.size / 1024).toFixed(1)}KB`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-text-subtle text-center py-4">
                      Drag and drop files onto the node to add them
                    </div>
                  )}
                </div>

                {/* AI Settings */}
                <div className="mb-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <label className="text-xs font-medium mb-2 flex items-center gap-2">
                    🤖 AI Configuration
                  </label>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-subtle">Model</span>
                      <select className="input-field text-xs px-2 py-1">
                        <option>GPT-4</option>
                        <option>GPT-3.5</option>
                        <option>Claude</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-subtle">Context Size</span>
                      <span className="font-mono text-accent">
                        {selectedNodeData.config.items?.reduce((sum: number, item: any) => sum + (item.size || 0), 0) || 0} bytes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-subtle">Status</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* AI Assistant Configuration */}
            {selectedNodeData.type === 'ai' && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">AI Name</label>
                  <input
                    type="text"
                    value={selectedNodeData.config.name || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, name: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs"
                    placeholder="AI Assistant"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Model</label>
                  <select
                    value={selectedNodeData.config.modelId || 'gpt-4'}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, modelId: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs"
                  >
                    <option value="gpt-4">GPT-4 (OpenAI)</option>
                    <option value="gpt-3.5">GPT-3.5 Turbo (OpenAI)</option>
                    <option value="claude-3">Claude 3 (Anthropic)</option>
                    <option value="gemini-pro">Gemini Pro (Google)</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Temperature</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedNodeData.config.temperature || 70}
                      onChange={(e) => {
                        updateNode(selectedNodeData.id, {
                          ...selectedNodeData,
                          config: { ...selectedNodeData.config, temperature: parseInt(e.target.value) },
                        });
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs text-text-subtle w-8 text-right">{selectedNodeData.config.temperature || 70}</span>
                  </div>
                  <div className="text-[10px] text-text-subtle mt-1">
                    Lower = more focused, Higher = more creative
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">System Prompt</label>
                  <textarea
                    value={selectedNodeData.config.systemPrompt || ''}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, systemPrompt: e.target.value },
                      });
                    }}
                    className="input-field w-full text-xs h-24 resize-none font-mono"
                    placeholder="You are a helpful AI assistant..."
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={selectedNodeData.config.maxTokens || 2000}
                    onChange={(e) => {
                      updateNode(selectedNodeData.id, {
                        ...selectedNodeData,
                        config: { ...selectedNodeData.config, maxTokens: parseInt(e.target.value) },
                      });
                    }}
                    className="input-field w-full text-xs"
                    min="100"
                    max="8000"
                    step="100"
                  />
                  <div className="text-[10px] text-text-subtle mt-1">
                    Maximum response length
                  </div>
                </div>

                {/* Connection Info */}
                <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                  <div className="text-xs font-medium mb-2 text-violet-300">💡 Usage</div>
                  <div className="text-[10px] text-text-subtle space-y-1">
                    <div>• Connect Knowledge Silo nodes to provide context</div>
                    <div>• Connect to chat interface for conversations</div>
                    <div>• Multiple knowledge bases = richer context</div>
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
          <div className="space-y-4">
            {selectedNodeData.type === 'dataset' && selectedNodeData.config.schema && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Data Schema</h4>
                  <span className="text-xs text-text-subtle">
                    {selectedNodeData.config.schema.length} fields
                  </span>
                </div>
                
                <div className="space-y-2">
                  {selectedNodeData.config.schema.map((field: any, index: number) => (
                    <div 
                      key={index} 
                      className="bg-background/50 border border-border/30 rounded-lg p-3 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium text-accent">
                            {field.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              field.type === 'string' ? 'bg-blue-500/20 text-blue-400' :
                              field.type === 'number' ? 'bg-green-500/20 text-green-400' :
                              field.type === 'boolean' ? 'bg-purple-500/20 text-purple-400' :
                              field.type === 'timestamp' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {field.type}
                            </span>
                            {field.nullable && (
                              <span className="text-xs text-text-subtle">nullable</span>
                            )}
                            {!field.nullable && (
                              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                                required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Mock data quality stats */}
                      <div className="mt-2 pt-2 border-t border-border/20">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-text-subtle">Unique</div>
                            <div className="font-medium">
                              {field.type === 'number' ? '847' : 
                               field.type === 'boolean' ? '2' : 
                               Math.floor(Math.random() * 500 + 100)}
                            </div>
                          </div>
                          <div>
                            <div className="text-text-subtle">Nulls</div>
                            <div className="font-medium">
                              {field.nullable ? 
                                `${Math.floor(Math.random() * 15)}%` : 
                                '0%'}
                            </div>
                          </div>
                          <div>
                            <div className="text-text-subtle">Valid</div>
                            <div className="font-medium text-green-400">
                              {100 - Math.floor(Math.random() * 5)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Schema Summary */}
                <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <div className="text-xs text-accent font-medium mb-2">Schema Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-subtle">Total Fields:</span>
                      <span className="ml-2 font-medium">{selectedNodeData.config.schema.length}</span>
                    </div>
                    <div>
                      <span className="text-text-subtle">Required:</span>
                      <span className="ml-2 font-medium">
                        {selectedNodeData.config.schema.filter((f: any) => !f.nullable).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-subtle">Nullable:</span>
                      <span className="ml-2 font-medium">
                        {selectedNodeData.config.schema.filter((f: any) => f.nullable).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-subtle">Total Rows:</span>
                      <span className="ml-2 font-medium">
                        {selectedNodeData.config.rows?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedNodeData.type !== 'dataset' && (
              <div className="text-center py-8 text-text-subtle text-sm">
                <Database size={32} className="mx-auto mb-2 opacity-50" />
                <p>Schema information is only available for dataset nodes</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Performance Metrics</h4>
              <span className="text-xs text-accent">Live</span>
            </div>

            {/* Execution Stats */}
            <div className="space-y-3">
              <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                <div className="text-xs text-text-subtle mb-2">Execution Time</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-400">
                    {selectedNodeData.type === 'dataset' ? '142' :
                     selectedNodeData.type === 'code' ? '87' :
                     selectedNodeData.type === 'ml' ? '3,420' :
                     Math.floor(Math.random() * 200 + 50)}
                  </span>
                  <span className="text-xs text-text-subtle">ms avg</span>
                </div>
                <div className="mt-2 h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-accent w-3/4"></div>
                </div>
              </div>

              {/* Data Throughput */}
              {(selectedNodeData.type === 'dataset' || 
                selectedNodeData.type === 'filter' || 
                selectedNodeData.type === 'join') && (
                <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                  <div className="text-xs text-text-subtle mb-2">Data Throughput</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Rows In</div>
                      <div className="text-xl font-bold text-blue-400">
                        {selectedNodeData.config.rows?.toLocaleString() || '1,000'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Rows Out</div>
                      <div className="text-xl font-bold text-accent">
                        {selectedNodeData.type === 'filter' ? 
                          Math.floor((selectedNodeData.config.rows || 1000) * 0.67).toLocaleString() :
                          selectedNodeData.config.rows?.toLocaleString() || '1,000'}
                      </div>
                    </div>
                  </div>
                  {selectedNodeData.type === 'filter' && (
                    <div className="mt-2 text-xs text-text-subtle">
                      Reduction: <span className="text-yellow-400 font-medium">33%</span>
                    </div>
                  )}
                </div>
              )}

              {/* ML Metrics */}
              {selectedNodeData.type === 'ml' && (
                <>
                  <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                    <div className="text-xs text-text-subtle mb-3">Model Performance</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-text-subtle">Accuracy</div>
                        <div className="text-lg font-bold text-green-400">94.2%</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-subtle">F1 Score</div>
                        <div className="text-lg font-bold text-green-400">0.91</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-subtle">Precision</div>
                        <div className="text-lg font-bold text-blue-400">92.8%</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-subtle">Recall</div>
                        <div className="text-lg font-bold text-blue-400">89.5%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                    <div className="text-xs text-text-subtle mb-2">Training Progress</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Epochs Completed</span>
                        <span className="font-medium">
                          {selectedNodeData.config.hyperparameters?.epochs || 50} / {selectedNodeData.config.hyperparameters?.epochs || 50}
                        </span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 w-full"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* API Metrics */}
              {selectedNodeData.type === 'api' && (
                <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                  <div className="text-xs text-text-subtle mb-3">API Performance</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Success Rate</span>
                      <span className="text-sm font-bold text-green-400">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Avg Response</span>
                      <span className="text-sm font-bold text-blue-400">145ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Requests/min</span>
                      <span className="text-sm font-bold text-accent">1,247</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resource Usage */}
              <div className="bg-background/50 border border-border/30 rounded-lg p-3">
                <div className="text-xs text-text-subtle mb-3">Resource Usage</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Memory</span>
                      <span className="font-medium">
                        {selectedNodeData.type === 'ml' ? '2.4 GB' :
                         selectedNodeData.type === 'dataset' ? '847 MB' :
                         Math.floor(Math.random() * 500 + 100) + ' MB'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div className={`h-full ${
                        selectedNodeData.type === 'ml' ? 'bg-orange-500 w-4/5' :
                        'bg-blue-500 w-1/2'
                      }`}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>CPU</span>
                      <span className="font-medium">
                        {Math.floor(Math.random() * 40 + 20)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Node Healthy</span>
                  <span className="ml-auto text-text-subtle">
                    Last run: {Math.floor(Math.random() * 60)} seconds ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
