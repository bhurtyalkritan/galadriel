'use client';

import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Trash2, X, Plus } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';

interface Project {
  id: string;
  name: string;
  description: string;
  savedAt: string;
  data: any;
}

export function ProjectManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { nodes, connectors, datasets } = useCanvasStore();

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('arkham_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const saveProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName || `Project ${projects.length + 1}`,
      description: projectDescription || 'No description',
      savedAt: new Date().toISOString(),
      data: {
        nodes,
        connectors,
        datasets,
      }
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('arkham_projects', JSON.stringify(updatedProjects));
    
    setProjectName('');
    setProjectDescription('');
    setShowSaveDialog(false);
  };

  const loadProject = (project: Project) => {
    const store = useCanvasStore.getState();
    store.nodes = project.data.nodes || [];
    store.connectors = project.data.connectors || [];
    store.datasets = project.data.datasets || [];
    
    // Force re-render
    useCanvasStore.setState({
      nodes: project.data.nodes || [],
      connectors: project.data.connectors || [],
      datasets: project.data.datasets || [],
    });
    
    setIsOpen(false);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('arkham_projects', JSON.stringify(updatedProjects));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-24 w-12 h-12 bg-surface border border-border/30 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110 z-50"
        title="Projects"
      >
        <FolderOpen size={20} className="text-accent group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
          <div className="bg-surface border border-border/30 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <FolderOpen size={20} className="text-accent" />
                Projects
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-subtle hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
              >
                <Save size={16} />
                Save Current Project
              </button>

              {showSaveDialog && (
                <div className="mb-4 p-4 bg-background/50 rounded-lg border border-border/30">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Project Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="My Data Pipeline"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="input-field w-full text-sm"
                        rows={2}
                        placeholder="Optional description..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveProject} className="btn-primary flex-1">
                        Save
                      </button>
                      <button onClick={() => setShowSaveDialog(false)} className="btn-secondary flex-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-text-subtle text-sm">
                    No saved projects yet
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-background/30 rounded-lg p-3 border border-border/20 hover:border-accent/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{project.name}</h3>
                          <p className="text-xs text-text-subtle mb-2">{project.description}</p>
                          <div className="text-[10px] text-text-subtle">
                            Saved {new Date(project.savedAt).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-text-subtle mt-1">
                            {project.data.nodes?.length || 0} nodes, {project.data.connectors?.length || 0} connections
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadProject(project)}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
