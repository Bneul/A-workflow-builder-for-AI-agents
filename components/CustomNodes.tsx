import React, { memo, PropsWithChildren } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircle, Sparkles, BrainCircuit, MessageSquareText, FileOutput, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { NodeData, NodeType } from '../types';

const StatusIcon = ({ status }: { status?: string }) => {
    if (!status || status === 'idle') return null;
    if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
};

interface NodeWrapperProps {
    selected: boolean;
    status?: string;
}

const NodeWrapper = ({ children, selected, status }: PropsWithChildren<NodeWrapperProps>) => {
    let borderColor = 'border-slate-200';
    if (selected) borderColor = 'border-blue-500 ring-2 ring-blue-500/20';
    if (status === 'error') borderColor = 'border-red-500';
    if (status === 'completed') borderColor = 'border-green-500';

    return (
        <div className={`px-4 py-3 shadow-sm rounded-xl bg-white border-2 w-64 transition-all duration-200 ${borderColor}`}>
            {children}
        </div>
    );
};

const Header = ({ icon, label, status }: { icon: React.ReactNode, label: string, status?: string }) => (
    <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg">
                {icon}
            </div>
            <span className="text-sm font-semibold text-slate-800">{label}</span>
        </div>
        <StatusIcon status={status} />
    </div>
);

// --- Custom Node Implementations ---

export const TriggerNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper selected={selected} status={data.status}>
      <Header icon={<PlayCircle className="w-4 h-4 text-emerald-600" />} label={data.label} status={data.status} />
      <div className="text-xs text-slate-500 line-clamp-2">
        Start: {data.config.initialInput || "No input configured"}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400" />
    </NodeWrapper>
  );
});

export const AiGenNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper selected={selected} status={data.status}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400" />
      <Header icon={<Sparkles className="w-4 h-4 text-purple-600" />} label={data.label} status={data.status} />
      <div className="text-xs text-slate-500">Gemini Flash Model</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400" />
    </NodeWrapper>
  );
});

export const AnalysisNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper selected={selected} status={data.status}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400" />
        <Header icon={<BrainCircuit className="w-4 h-4 text-blue-600" />} label={data.label} status={data.status} />
        <div className="text-xs text-slate-500">Analysis logic</div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400" />
    </NodeWrapper>
  );
});

export const ChatNode = memo(({ data, selected }: NodeProps<NodeData>) => {
    return (
      <NodeWrapper selected={selected} status={data.status}>
          <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400" />
          <Header icon={<MessageSquareText className="w-4 h-4 text-orange-600" />} label={data.label} status={data.status} />
          <div className="text-xs text-slate-500">Persona: {data.config.persona}</div>
          <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400" />
      </NodeWrapper>
    );
});

export const OutputNode = memo(({ data, selected }: NodeProps<NodeData>) => {
    return (
      <NodeWrapper selected={selected} status={data.status}>
          <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400" />
          <Header icon={<FileOutput className="w-4 h-4 text-slate-600" />} label={data.label} status={data.status} />
          <div className="text-xs text-slate-500">Final Result</div>
      </NodeWrapper>
    );
});

export const nodeTypes = {
  [NodeType.TRIGGER_START]: TriggerNode,
  [NodeType.AI_GENERATION]: AiGenNode,
  [NodeType.AI_ANALYSIS]: AnalysisNode,
  [NodeType.AI_CHAT]: ChatNode,
  [NodeType.ACTION_OUTPUT]: OutputNode,
};