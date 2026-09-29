import React from 'react';
import { Activity, Cpu, Film, Wifi } from 'lucide-react';

interface PlayerStatsPanelProps {
  stats: {
    width?: number;
    height?: number;
    streamBandwidth?: number;
    estimatedBandwidth?: number;
    droppedFrames?: number;
    decodedFrames?: number;
    manifestType?: string;
    loadLatencyMs?: number;
  };
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ stats }) => {
  const formatBps = (bps?: number) => {
    if (!bps) return '0 kbps';
    if (bps > 1000000) return `${(bps / 1000000).toFixed(2)} Mbps`;
    return `${Math.round(bps / 1000)} kbps`;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
        <Activity className="w-4 h-4 text-indigo-400" />
        <h3 className="text-xs font-semibold text-white">Stream Performance & Engine Diagnostics</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Film className="w-3 h-3 text-indigo-400" />
            <span>Resolution</span>
          </div>
          <div className="font-mono font-medium text-white text-xs">
            {stats.width && stats.height ? `${stats.width} × ${stats.height}` : 'Auto / Unknown'}
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Wifi className="w-3 h-3 text-sky-400" />
            <span>Current Bitrate</span>
          </div>
          <div className="font-mono font-medium text-white text-xs">
            {formatBps(stats.streamBandwidth)}
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Frame Integrity</span>
          </div>
          <div className="font-mono font-medium text-white text-xs">
            <span className="text-emerald-400">{stats.decodedFrames || 0} dec</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className={stats.droppedFrames ? 'text-rose-400' : 'text-slate-400'}>
              {stats.droppedFrames || 0} drop
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Manifest / Latency</span>
          </div>
          <div className="font-mono font-medium text-white text-xs">
            <span className="uppercase text-amber-300">{stats.manifestType || 'Generic'}</span>
            {stats.loadLatencyMs ? ` (${stats.loadLatencyMs}ms)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
