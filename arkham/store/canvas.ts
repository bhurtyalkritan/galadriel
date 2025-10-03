import { create } from 'zustand';
import { Node, Connector, Dataset, Workspace } from '@/types';

interface CanvasStore {
  workspace: Workspace | null;
  nodes: Node[];
  connectors: Connector[];
  datasets: Dataset[];
  selectedNode: string | null;
  selectedConnector: string | null;
  canvasOffset: { x: number; y: number };
  canvasScale: number;
  scale: number;
  
  setWorkspace: (workspace: Workspace) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  addConnector: (connector: Connector) => void;
  removeConnector: (id: string) => void;
  addDataset: (dataset: Dataset) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedConnector: (id: string | null) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasScale: (scale: number) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  workspace: null,
  nodes: [],
  connectors: [],
  datasets: [],
  selectedNode: null,
  selectedConnector: null,
  canvasOffset: { x: 0, y: 0 },
  canvasScale: 1,
  scale: 1,

  setWorkspace: (workspace) => set({ workspace }),
  
  addNode: (node) => set(state => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  updateNode: (id, updates) => set(state => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    )
  })),
  
  removeNode: (id) => set(state => ({
    nodes: state.nodes.filter(node => node.id !== id),
    connectors: state.connectors.filter(
      conn => conn.fromNode !== id && conn.toNode !== id
    )
  })),
  
  addConnector: (connector) => set(state => ({ 
    connectors: [...state.connectors, connector] 
  })),
  
  removeConnector: (id) => set(state => ({
    connectors: state.connectors.filter(conn => conn.id !== id)
  })),
  
  addDataset: (dataset) => set(state => ({ 
    datasets: [...state.datasets, dataset] 
  })),
  
  setSelectedNode: (id) => set({ selectedNode: id }),
  setSelectedConnector: (id) => set({ selectedConnector: id }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCanvasScale: (scale) => set({ canvasScale: scale }),
}));
