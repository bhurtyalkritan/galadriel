'use client';

import React, { useState, useEffect } from 'react';
import { Package, X, Plus, Trash2, Copy } from 'lucide-react';
import { CodeEditor } from '@/components/editor/CodeEditor';

interface Artifact {
  id: string;
  name: string;
  description: string;
  language: 'javascript' | 'python' | 'sql';
  code: string;
  createdAt: string;
}

export function ArtifactsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'sql'>('javascript');
  const [code, setCode] = useState('');

  useEffect(() => {
    // Load artifacts from localStorage
    const savedArtifacts = localStorage.getItem('arkham_artifacts');
    if (savedArtifacts) {
      setArtifacts(JSON.parse(savedArtifacts));
    }
  }, []);

  const createArtifact = () => {
    const newArtifact: Artifact = {
      id: Date.now().toString(),
      name: name || `artifact${artifacts.length + 1}`,
      description: description || 'No description',
      language,
      code: code || '// Your code here',
      createdAt: new Date().toISOString(),
    };

    const updatedArtifacts = [...artifacts, newArtifact];
    setArtifacts(updatedArtifacts);
    localStorage.setItem('arkham_artifacts', JSON.stringify(updatedArtifacts));
    
    resetForm();
    setShowCreateDialog(false);
    setSelectedArtifact(null);
  };

  const updateArtifact = () => {
    if (!selectedArtifact) return;

    const updatedArtifacts = artifacts.map(a => 
      a.id === selectedArtifact.id 
        ? { ...a, name, description, language, code }
        : a
    );
    
    setArtifacts(updatedArtifacts);
    localStorage.setItem('arkham_artifacts', JSON.stringify(updatedArtifacts));
    
    resetForm();
    setSelectedArtifact(null);
    setShowCreateDialog(false);
  };

  const deleteArtifact = (id: string) => {
    const updatedArtifacts = artifacts.filter(a => a.id !== id);
    setArtifacts(updatedArtifacts);
    localStorage.setItem('arkham_artifacts', JSON.stringify(updatedArtifacts));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLanguage('javascript');
    setCode('');
  };

  const editArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setName(artifact.name);
    setDescription(artifact.description);
    setLanguage(artifact.language);
    setCode(artifact.code);
    setShowCreateDialog(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-40 w-12 h-12 bg-surface border border-border/30 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110 z-50"
        title="Artifacts"
      >
        <Package size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
          <div className="bg-surface border border-border/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Package size={20} className="text-purple-400" />
                Code Artifacts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-subtle hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              <button
                onClick={() => {
                  resetForm();
                  setSelectedArtifact(null);
                  setShowCreateDialog(true);
                }}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
              >
                <Plus size={16} />
                Create New Artifact
              </button>

              {showCreateDialog && (
                <div className="mb-4 p-4 bg-background/50 rounded-lg border border-border/30">
                  <h3 className="text-sm font-medium mb-3">
                    {selectedArtifact ? 'Edit Artifact' : 'New Artifact'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="validateEmail"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="Validates email format using regex"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="input-field w-full text-sm"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="sql">SQL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Code</label>
                      <CodeEditor
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        language={language}
                        height="250px"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={selectedArtifact ? updateArtifact : createArtifact} 
                        className="btn-primary flex-1"
                      >
                        {selectedArtifact ? 'Update' : 'Create'}
                      </button>
                      <button 
                        onClick={() => {
                          setShowCreateDialog(false);
                          resetForm();
                          setSelectedArtifact(null);
                        }} 
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {artifacts.length === 0 ? (
                  <div className="text-center py-8 text-text-subtle text-sm">
                    No artifacts yet. Create reusable code snippets to use across your pipelines.
                  </div>
                ) : (
                  artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="bg-background/30 rounded-lg p-3 border border-border/20 hover:border-purple-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm font-mono">{artifact.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 bg-purple-400/10 text-purple-400 rounded">
                              {artifact.language}
                            </span>
                          </div>
                          <p className="text-xs text-text-subtle mb-1">{artifact.description}</p>
                          <div className="text-[10px] text-text-subtle">
                            Created {new Date(artifact.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(artifact.code)}
                            className="text-accent hover:text-accent/80 p-1"
                            title="Copy code"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => editArtifact(artifact)}
                            className="text-text-subtle hover:text-text p-1"
                            title="Edit"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => deleteArtifact(artifact.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded p-2 border border-border/10">
                        <pre className="text-[10px] font-mono text-text-subtle overflow-x-auto">
                          {artifact.code.substring(0, 200)}{artifact.code.length > 200 ? '...' : ''}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
