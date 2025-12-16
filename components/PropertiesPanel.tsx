import React from 'react';
import { AppNode, NodeType } from '../types';
import { Settings2, X } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: AppNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onClose, onUpdateNode }) => {
  if (!selectedNode) {
    return (
        <aside className="w-80 border-l border-slate-200 bg-slate-50 h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center z-10">
            <Settings2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Select a node to configure its properties.</p>
        </aside>
    );
  }

  const { data, id, type } = selectedNode;

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...data.config, [key]: value };
    onUpdateNode(id, { ...data, config: newConfig });
  };

  const handleLabelChange = (value: string) => {
    onUpdateNode(id, { ...data, label: value });
  };

  return (
    <aside className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shadow-xl z-20">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            Configuration
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Common Settings */}
        <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Node Name</label>
            <input 
                type="text" 
                value={data.label} 
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
        </div>

        <hr className="border-slate-100" />

        {/* Specific Settings based on Type */}
        {type === NodeType.TRIGGER_START && (
            <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Initial Input Data</label>
                <textarea 
                    rows={6}
                    value={data.config.initialInput || ''} 
                    onChange={(e) => handleConfigChange('initialInput', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="Enter the starting text for this workflow..."
                />
            </div>
        )}

        {type === NodeType.AI_GENERATION && (
            <>
                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">System Instruction</label>
                    <textarea 
                        rows={6}
                        value={data.config.systemInstruction || ''} 
                        onChange={(e) => handleConfigChange('systemInstruction', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                        placeholder="e.g., You are a creative writer..."
                    />
                    <p className="text-xs text-slate-400">Define the persona and rules for the AI model.</p>
                </div>
                 <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Temperature (Creativity)</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1"
                        value={data.config.temperature || '0.7'} 
                        onChange={(e) => handleConfigChange('temperature', e.target.value)}
                        className="w-full accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Precise (0.0)</span>
                        <span>{data.config.temperature || '0.7'}</span>
                        <span>Creative (2.0)</span>
                    </div>
                </div>
            </>
        )}

        {type === NodeType.AI_ANALYSIS && (
            <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Aspects</label>
                <input 
                    type="text" 
                    value={data.config.aspects || ''} 
                    onChange={(e) => handleConfigChange('aspects', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g., Sentiment, Key Entities, Tone"
                />
                <p className="text-xs text-slate-400">Comma separated list of things to look for.</p>
            </div>
        )}

        {type === NodeType.AI_CHAT && (
            <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona Name</label>
                <input 
                    type="text" 
                    value={data.config.persona || ''} 
                    onChange={(e) => handleConfigChange('persona', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    placeholder="e.g., Customer Support Agent"
                />
            </div>
        )}

         {type === NodeType.ACTION_OUTPUT && (
             <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                 This node displays the final output of the workflow. No configuration needed.
             </div>
        )}

      </div>
    </aside>
  );
};
