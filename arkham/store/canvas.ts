import { create } from 'zustand';
import { Node, Connector, Dataset, Workspace } from '@/types';

interface HistoryState {
  nodes: Node[];
  connectors: Connector[];
}

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
  history: HistoryState[];
  historyIndex: number;
  
  setWorkspace: (workspace: Workspace) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  removeConnector: (id: string) => void;
  addDataset: (dataset: Dataset) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedConnector: (id: string | null) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setCanvasScale: (scale: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
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
  history: [],
  historyIndex: -1,

  setWorkspace: (workspace) => set({ workspace }),
  
  addNode: (node) => set(state => {
    const newState = { nodes: [...state.nodes, node], connectors: state.connectors };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return { 
      ...newState,
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  updateNode: (id, updates) => set(state => {
    const newState = {
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      ),
      connectors: state.connectors
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  removeNode: (id) => set(state => {
    const newState = {
      nodes: state.nodes.filter(node => node.id !== id),
      connectors: state.connectors.filter(
        conn => conn.fromNode !== id && conn.toNode !== id
      )
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  addConnector: (connector) => set(state => {
    const newState = { nodes: state.nodes, connectors: [...state.connectors, connector] };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  updateConnector: (id, updates) => set(state => {
    const newState = {
      nodes: state.nodes,
      connectors: state.connectors.map(conn =>
        conn.id === id ? { ...conn, ...updates } : conn
      )
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  removeConnector: (id) => set(state => {
    const newState = {
      nodes: state.nodes,
      connectors: state.connectors.filter(conn => conn.id !== id)
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    };
  }),
  
  addDataset: (dataset) => set(state => ({ 
    datasets: [...state.datasets, dataset] 
  })),
  
  setSelectedNode: (id) => set({ selectedNode: id }),
  setSelectedConnector: (id) => set({ selectedConnector: id }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setCanvasScale: (scale) => set({ canvasScale: scale }),
  
  undo: () => set(state => {
    if (state.historyIndex > 0) {
      const prevState = state.history[state.historyIndex - 1];
      return {
        nodes: prevState.nodes,
        connectors: prevState.connectors,
        historyIndex: state.historyIndex - 1
      };
    }
    return state;
  }),
  
  redo: () => set(state => {
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      return {
        nodes: nextState.nodes,
        connectors: nextState.connectors,
        historyIndex: state.historyIndex + 1
      };
    }
    return state;
  }),
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
}));
