import { Node, Edge } from 'reactflow';

export enum NodeType {
  TRIGGER_START = 'trigger_start',
  AI_GENERATION = 'ai_generation',
  AI_ANALYSIS = 'ai_analysis',
  AI_CHAT = 'ai_chat',
  ACTION_OUTPUT = 'action_output'
}

export interface NodeData {
  label: string;
  description?: string;
  config: Record<string, any>;
  icon?: string;
  output?: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export type AppNode = Node<NodeData>;

export interface ExecutionLog {
  nodeId: string;
  nodeLabel: string;
  timestamp: number;
  input: string;
  output: string;
  status: 'success' | 'error' | 'pending';
  duration?: number;
}

export interface DragItem {
  type: NodeType;
  label: string;
}
