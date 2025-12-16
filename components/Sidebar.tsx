import React from 'react';
import { NODE_TEMPLATES } from '../constants';
import { NodeType } from '../types';
import { GripVertical } from 'lucide-react';

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full z-10">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Library</h2>
        <p className="text-xs text-slate-500">Drag nodes to the canvas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Triggers</h3>
          <div className="space-y-2">
            {NODE_TEMPLATES.filter(t => t.type === NodeType.TRIGGER_START).map((template) => (
              <div
                key={template.type}
                className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-emerald-400 hover:shadow-sm transition-all"
                draggable
                onDragStart={(e) => onDragStart(e, template.type, template.label)}
              >
                <div className="text-slate-500 group-hover:text-emerald-500">{template.icon}</div>
                <div>
                  <div className="text-sm font-medium text-slate-700">{template.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{template.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Agents</h3>
          <div className="space-y-2">
            {NODE_TEMPLATES.filter(t => t.type.startsWith('ai_')).map((template) => (
              <div
                key={template.type}
                className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-sm transition-all"
                draggable
                onDragStart={(e) => onDragStart(e, template.type, template.label)}
              >
                <div className="text-slate-500 group-hover:text-purple-500">{template.icon}</div>
                <div>
                  <div className="text-sm font-medium text-slate-700">{template.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{template.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Actions</h3>
          <div className="space-y-2">
            {NODE_TEMPLATES.filter(t => t.type === NodeType.ACTION_OUTPUT).map((template) => (
              <div
                key={template.type}
                className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm transition-all"
                draggable
                onDragStart={(e) => onDragStart(e, template.type, template.label)}
              >
                 <div className="text-slate-500 group-hover:text-blue-500">{template.icon}</div>
                 <div>
                   <div className="text-sm font-medium text-slate-700">{template.label}</div>
                   <div className="text-[10px] text-slate-400 leading-tight">{template.description}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
