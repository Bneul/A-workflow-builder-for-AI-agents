import React, { useEffect, useRef } from 'react';
import { ExecutionLog } from '../types';
import { Terminal, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface LogPanelProps {
  logs: ExecutionLog[];
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs, isOpen, onClose, isRunning }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-72 z-30 flex flex-col transition-transform duration-300">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-sm text-slate-800">Execution Logs</span>
            {isRunning && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"/>}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
            Close
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900 font-mono text-sm">
        {logs.length === 0 ? (
            <div className="text-slate-500 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Ready to start...
            </div>
        ) : (
            logs.map((log, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 mb-1">
                         {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                         ) : log.status === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                         ) : (
                             <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                         )}
                         <span className="text-slate-300 font-semibold">{log.nodeLabel}</span>
                         <span className="text-slate-600 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="ml-7 space-y-2">
                        {log.input && (
                             <div className="text-slate-500">
                                <span className="text-slate-600 uppercase text-[10px] tracking-wider">Input: </span>
                                <span className="line-clamp-2">{log.input.substring(0, 150)}{log.input.length > 150 ? '...' : ''}</span>
                             </div>
                        )}
                        {log.output && (
                             <div className="text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                <span className="text-slate-500 uppercase text-[10px] tracking-wider block mb-1">Output: </span>
                                {log.output}
                             </div>
                        )}
                         {log.status === 'error' && (
                             <div className="text-red-300 bg-red-900/20 p-2 rounded border border-red-900/50">
                                Error occurred during execution.
                             </div>
                        )}
                    </div>
                </div>
            ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
