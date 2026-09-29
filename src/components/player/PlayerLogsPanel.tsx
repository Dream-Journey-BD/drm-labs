import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface PlayerLogsPanelProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const PlayerLogsPanel: React.FC<PlayerLogsPanelProps> = ({ logs, onClearLogs }) => {
  const allLogsText = logs.map((l) => `[${l.time}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-white">Playback & DRM Telemetry Log</h3>
          <span className="text-[10px] font-mono text-slate-500">({logs.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={allLogsText} showText={true} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer" />
          <button
            type="button"
            onClick={onClearLogs}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="h-44 overflow-y-auto bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-2 text-center">No playback events recorded yet.</div>
        ) : (
          logs.map((log) => {
            const colorClass =
              log.level === 'error'
                ? 'text-rose-400'
                : log.level === 'warn'
                ? 'text-amber-400'
                : log.level === 'success'
                ? 'text-emerald-400'
                : 'text-slate-300';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                <span className={colorClass}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
