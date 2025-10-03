export interface Dataset {
  id: string;
  name: string;
  schema: Field[];
  sample: any[];
  storageRef: string;
  rowCount: number;
  geomType?: string;
  createdAt: string;
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'timestamp' | 'geometry';
  nullable: boolean;
}

export interface Node {
  id: string;
  type: NodeType;
  config: any;
  inputs: string[];
  outputs: string[];
  position: { x: number; y: number };
  owner: string;
  createdAt: string;
}

export type NodeType = 
  | 'dataset' 
  | 'filter' 
  | 'join' 
  | 'if' 
  | 'api' 
  | 'enrich' 
  | 'mapview';

export interface Connector {
  id: string;
  fromNode: string;
  toNode: string;
  mapping?: any;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  version: string;
  nodes: Node[];
  connectors: Connector[];
  policies: Policy[];
  purpose: string;
}

export interface Policy {
  id: string;
  effect: 'allow' | 'deny';
  subject: string;
  action: string;
  resource: string;
  condition?: any;
}

export interface Run {
  id: string;
  workspaceId: string;
  version: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  metrics: any;
  startedAt: string;
  finishedAt?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  verb: string;
  target: string;
  at: string;
  purpose: string;
  delta?: any;
}

export interface Envelope {
  id: string;
  ts: string;
  direction: 'ingress' | 'internal' | 'egress';
  source?: string;
  actor?: string;
  purpose: string;
  policy: {
    tenant: string;
    scope: string;
  };
  schema: {
    contentId: string;
    version: string;
  };
  content: any;
  attrs: any;
  trace: {
    traceId: string;
    spanId: string;
  };
  sign: {
    alg: string;
    kid: string;
    sig: string;
  };
}
