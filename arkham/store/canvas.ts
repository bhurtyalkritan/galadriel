import { create } from 'zustand';
import { Node, Connector, Dataset, Workspace, Schedule } from '@/types';

interface HistoryState {
  nodes: Node[];
  connectors: Connector[];
}

interface ScheduledTask {
  nodeId: string;
  intervalId?: NodeJS.Timeout;
  timeoutId?: NodeJS.Timeout;
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
  runningNodes: Set<string>;
  runningGroups: Set<string>;
  isGlobalRunning: boolean;
  activeConnectors: Set<string>;
  scheduledTasks: Map<string, ScheduledTask>;
  isFrozen: boolean;
  
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
  setIsFrozen: (frozen: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  runGroup: (groupId: string) => void;
  stopGroup: (groupId: string) => void;
  runAll: () => void;
  stopAll: () => void;
  updateSchedule: (nodeId: string, schedule: Schedule) => void;
  startScheduledTask: (nodeId: string) => void;
  stopScheduledTask: (nodeId: string) => void;
  runNode: (nodeId: string) => void;
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
  runningNodes: new Set(),
  runningGroups: new Set(),
  isGlobalRunning: false,
  activeConnectors: new Set(),
  scheduledTasks: new Map(),
  isFrozen: false,

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
  setIsFrozen: (frozen) => set({ isFrozen: frozen }),
  
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

  runGroup: (groupId: string) => {
    const state = get();
    const group = state.nodes.find(n => n.id === groupId && n.type === 'group');
    if (!group) return;

    const newRunningGroups = new Set(state.runningGroups);
    newRunningGroups.add(groupId);
    set({ runningGroups: newRunningGroups });

    // Find all nodes inside this group
    const groupBounds = {
      x: group.position.x,
      y: group.position.y,
      width: group.config?.width || 400,
      height: group.config?.height || 300,
    };

    const nodesInGroup = state.nodes.filter(node => {
      if (node.id === groupId || node.type === 'group') return false;
      return (
        node.position.x >= groupBounds.x &&
        node.position.x <= groupBounds.x + groupBounds.width &&
        node.position.y >= groupBounds.y &&
        node.position.y <= groupBounds.y + groupBounds.height
      );
    });

    // Run nodes in topological order based on connections
    const runNodesSequentially = async (nodes: Node[]) => {
      const visited = new Set<string>();
      const activeConns = new Set<string>();

      const runNode = async (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        // Add running state
        set(state => {
          const newRunning = new Set(state.runningNodes);
          newRunning.add(nodeId);
          return { runningNodes: newRunning };
        });

        // Find incoming connectors and activate them
        const incomingConns = state.connectors.filter(c => c.toNode === nodeId);
        for (const conn of incomingConns) {
          activeConns.add(conn.id);
          set({ activeConnectors: new Set(activeConns) });
          await new Promise(resolve => setTimeout(resolve, 300)); // Travel time
        }

        // Simulate node execution
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find outgoing connectors
        const outgoingConns = state.connectors.filter(c => c.fromNode === nodeId);
        for (const conn of outgoingConns) {
          if (nodesInGroup.some(n => n.id === conn.toNode)) {
            await runNode(conn.toNode);
          }
        }

        // Remove running state
        set(state => {
          const newRunning = new Set(state.runningNodes);
          newRunning.delete(nodeId);
          return { runningNodes: newRunning };
        });

        // Clear connector animations
        for (const conn of incomingConns) {
          activeConns.delete(conn.id);
        }
        set({ activeConnectors: new Set(activeConns) });
      };

      // Find entry nodes (nodes with no incoming connections from within group)
      const groupNodeIds = new Set(nodes.map(n => n.id));
      const entryNodes = nodes.filter(node => {
        const hasInternalIncoming = state.connectors.some(
          c => c.toNode === node.id && groupNodeIds.has(c.fromNode)
        );
        return !hasInternalIncoming;
      });

      // Run all entry nodes
      for (const node of entryNodes) {
        await runNode(node.id);
      }

      // Cleanup
      set(state => {
        const newRunningGroups = new Set(state.runningGroups);
        newRunningGroups.delete(groupId);
        return {
          runningGroups: newRunningGroups,
          activeConnectors: new Set()
        };
      });
    };

    runNodesSequentially(nodesInGroup);
  },

  stopGroup: (groupId: string) => {
    set(state => {
      const newRunningGroups = new Set(state.runningGroups);
      newRunningGroups.delete(groupId);
      return {
        runningGroups: newRunningGroups,
        runningNodes: new Set(),
        activeConnectors: new Set()
      };
    });
  },

  runAll: () => {
    set({ isGlobalRunning: true });
    const state = get();
    const groups = state.nodes.filter(n => n.type === 'group');
    
    const runAllSequentially = async () => {
      for (const group of groups) {
        if (!get().isGlobalRunning) break;
        await get().runGroup(group.id);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      set({ isGlobalRunning: false });
    };

    runAllSequentially();
  },

  stopAll: () => {
    set({
      isGlobalRunning: false,
      runningGroups: new Set(),
      runningNodes: new Set(),
      activeConnectors: new Set()
    });
  },

  runNode: (nodeId: string) => {
    const state = get();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.type === 'group') {
      get().runGroup(nodeId);
    } else {
      // Run single node
      set(state => {
        const newRunning = new Set(state.runningNodes);
        newRunning.add(nodeId);
        return { runningNodes: newRunning };
      });

      setTimeout(() => {
        set(state => {
          const newRunning = new Set(state.runningNodes);
          newRunning.delete(nodeId);
          return { runningNodes: newRunning };
        });
      }, 800);
    }

    // Update last run time
    get().updateNode(nodeId, {
      schedule: {
        ...node.schedule,
        lastRun: new Date().toISOString(),
      } as Schedule,
    });
  },

  updateSchedule: (nodeId: string, schedule: Schedule) => {
    const state = get();
    get().updateNode(nodeId, { schedule });
    
    // Stop existing scheduled task
    get().stopScheduledTask(nodeId);
    
    // Start new scheduled task if enabled
    if (schedule.enabled) {
      get().startScheduledTask(nodeId);
    }
  },

  startScheduledTask: (nodeId: string) => {
    const state = get();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node?.schedule?.enabled) return;

    const schedule = node.schedule;
    
    const calculateNextRun = (): Date | null => {
      const now = new Date();
      
      switch (schedule.type) {
        case 'interval': {
          const ms = (schedule.intervalValue || 1) * 
            (schedule.intervalUnit === 'minutes' ? 60000 :
             schedule.intervalUnit === 'hours' ? 3600000 :
             86400000); // days
          return new Date(now.getTime() + ms);
        }
        
        case 'daily': {
          const [hours, minutes] = (schedule.dailyTime || '09:00').split(':').map(Number);
          const next = new Date(now);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
          return next;
        }
        
        case 'weekly': {
          const [hours, minutes] = (schedule.weeklyTime || '09:00').split(':').map(Number);
          const currentDay = now.getDay();
          const targetDays = schedule.weeklyDays || [1];
          
          let daysToAdd = 7; // Default to next week
          for (const targetDay of targetDays.sort()) {
            let diff = targetDay - currentDay;
            if (diff < 0) diff += 7;
            if (diff === 0) {
              // Same day - check if time has passed
              const todayTarget = new Date(now);
              todayTarget.setHours(hours, minutes, 0, 0);
              if (todayTarget > now) {
                daysToAdd = 0;
                break;
              }
            } else if (diff < daysToAdd) {
              daysToAdd = diff;
            }
          }
          
          const next = new Date(now);
          next.setDate(next.getDate() + daysToAdd);
          next.setHours(hours, minutes, 0, 0);
          return next;
        }
        
        case 'monthly': {
          const [hours, minutes] = (schedule.monthlyTime || '09:00').split(':').map(Number);
          const currentDay = now.getDate();
          const targetDays = schedule.monthlyDays || [1];
          
          const next = new Date(now);
          let found = false;
          
          for (const targetDay of targetDays.sort()) {
            if (targetDay > currentDay) {
              next.setDate(targetDay);
              found = true;
              break;
            } else if (targetDay === currentDay) {
              const todayTarget = new Date(now);
              todayTarget.setHours(hours, minutes, 0, 0);
              if (todayTarget > now) {
                next.setDate(targetDay);
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            // Next month
            next.setMonth(next.getMonth() + 1);
            next.setDate(targetDays[0]);
          }
          
          next.setHours(hours, minutes, 0, 0);
          return next;
        }
        
        default:
          return null;
      }
    };

    const scheduleNext = () => {
      const nextRun = calculateNextRun();
      if (!nextRun) return;

      const msUntilRun = nextRun.getTime() - Date.now();
      
      // Update next run time
      get().updateNode(nodeId, {
        schedule: {
          ...schedule,
          nextRun: nextRun.toISOString(),
        } as Schedule,
      });

      const timeoutId = setTimeout(() => {
        // Run the node/group
        get().runNode(nodeId);
        
        // Schedule next run for interval-based schedules
        if (schedule.type === 'interval') {
          const intervalMs = (schedule.intervalValue || 1) * 
            (schedule.intervalUnit === 'minutes' ? 60000 :
             schedule.intervalUnit === 'hours' ? 3600000 :
             86400000);
          
          const intervalId = setInterval(() => {
            get().runNode(nodeId);
          }, intervalMs);
          
          set(state => {
            const newTasks = new Map(state.scheduledTasks);
            newTasks.set(nodeId, { nodeId, intervalId });
            return { scheduledTasks: newTasks };
          });
        } else {
          // For time-based schedules, calculate and schedule next occurrence
          scheduleNext();
        }
      }, msUntilRun);

      if (schedule.type !== 'interval') {
        set(state => {
          const newTasks = new Map(state.scheduledTasks);
          newTasks.set(nodeId, { nodeId, timeoutId });
          return { scheduledTasks: newTasks };
        });
      }
    };

    scheduleNext();
  },

  stopScheduledTask: (nodeId: string) => {
    const state = get();
    const task = state.scheduledTasks.get(nodeId);
    
    if (task) {
      if (task.intervalId) {
        clearInterval(task.intervalId);
      }
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      
      set(state => {
        const newTasks = new Map(state.scheduledTasks);
        newTasks.delete(nodeId);
        return { scheduledTasks: newTasks };
      });
    }
  },
}));
