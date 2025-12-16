import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  MarkerType,
  BackgroundVariant,
  Node,
} from 'reactflow';
import { Play, Rocket, MousePointer2 } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LogPanel } from './components/LogPanel';
import { nodeTypes, TriggerNode } from './components/CustomNodes'; // trigger import to ensure load
import { INITIAL_NODES, INITIAL_EDGES, NODE_TEMPLATES } from './constants';
import { AppNode, ExecutionLog, NodeData, NodeType } from './types';
import { runNodeLogic } from './services/geminiService';

// Basic topological sort to find execution order.
// Assumes a DAG (Directed Acyclic Graph).
const getExecutionOrder = (nodes: AppNode[], edges: Edge[]): string[] => {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    if (adjacencyList.has(edge.source) && inDegree.has(edge.target)) {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const order: string[] = [];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    order.push(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    neighbors.forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  return order;
};


const AppContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep', 
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed } 
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow/type') as NodeType;
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const template = NODE_TEMPLATES.find(t => t.type === type);
      const newConfig = template ? { ...template.defaultConfig } : {};

      const newNode: AppNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { 
            label: label || 'New Node', 
            config: newConfig,
            status: 'idle'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as AppNode);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (nodeId: string, newData: NodeData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
    // Update selected node reference as well to reflect changes immediately
    if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => prev ? { ...prev, data: newData } : null);
    }
  };

  const updateNodeStatus = (nodeId: string, status: 'idle' | 'running' | 'completed' | 'error') => {
      setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n));
  };

  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setIsLogPanelOpen(true);

    // Reset statuses
    setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));

    const executionOrder = getExecutionOrder(nodes, edges);
    const nodeDataMap = new Map<string, NodeData>();
    const nodeOutputMap = new Map<string, string>(); // Store output of each node

    // Initialize map
    nodes.forEach(n => nodeDataMap.set(n.id, n.data));

    try {
        for (const nodeId of executionOrder) {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) continue;

            updateNodeStatus(nodeId, 'running');
            
            // Find inputs
            // Get edges where target is this node
            const incomingEdges = edges.filter(e => e.target === nodeId);
            let inputData = '';
            
            // For simplicity, we just concatenate inputs from all parents, or take the first one
            // In a real app, you might map specific outputs to specific inputs
            if (incomingEdges.length > 0) {
                const parentOutputs = incomingEdges.map(e => nodeOutputMap.get(e.source) || '');
                inputData = parentOutputs.join('\n\n');
            }

            // Log start
            setLogs(prev => [...prev, {
                nodeId,
                nodeLabel: node.data.label,
                timestamp: Date.now(),
                input: inputData,
                output: '',
                status: 'pending'
            }]);

            // Execute logic
            const startTime = Date.now();
            const result = await runNodeLogic(node.type as NodeType, inputData, node.data.config);
            const duration = Date.now() - startTime;

            nodeOutputMap.set(nodeId, result);
            updateNodeStatus(nodeId, 'completed');

            // Log success
            setLogs(prev => {
                const newLogs = [...prev];
                const logIndex = newLogs.findIndex(l => l.nodeId === nodeId && l.status === 'pending');
                if (logIndex !== -1) {
                    newLogs[logIndex] = {
                        ...newLogs[logIndex],
                        output: result,
                        status: 'success',
                        duration
                    };
                }
                return newLogs;
            });
            
            // Small delay for visual effect
            await new Promise(r => setTimeout(r, 500));
        }
    } catch (e: any) {
        console.error("Workflow failed", e);
        // Find current running node and set to error
        setLogs(prev => [...prev, {
            nodeId: 'error',
            nodeLabel: 'System',
            timestamp: Date.now(),
            input: '',
            output: e.message,
            status: 'error'
        }]);
    } finally {
        setIsRunning(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight">Nexus <span className="text-slate-400 font-normal">AI Builder</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="text-xs text-slate-500 mr-4 hidden md:block">
                Drag nodes to canvas • Connect handles • Configure properties
            </div>
            <button 
                onClick={runWorkflow}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isRunning 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:transform active:scale-95'
                }`}
            >
                {isRunning ? <span className="animate-spin mr-1">⟳</span> : <Play className="w-4 h-4 fill-current" />}
                {isRunning ? 'Running...' : 'Run Workflow'}
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' } }}
            >
                <Background color="#e2e8f0" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls showInteractive={false} className="bg-white border-slate-200 shadow-sm" />
            </ReactFlow>

             {/* Canvas Instruction Empty State */}
             {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                    <MousePointer2 className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-xl font-medium text-slate-500">Drag items here to start building</p>
                </div>
            )}
        </div>

        {/* Properties Panel */}
        <PropertiesPanel 
            selectedNode={selectedNode} 
            onClose={() => setSelectedNode(null)} 
            onUpdateNode={updateNodeData}
        />
      </div>

      {/* Logs Panel */}
      <LogPanel 
        logs={logs} 
        isOpen={isLogPanelOpen} 
        onClose={() => setIsLogPanelOpen(false)}
        isRunning={isRunning} 
      />
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
