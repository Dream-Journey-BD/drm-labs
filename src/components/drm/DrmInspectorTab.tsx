import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RotateCcw,
  Trash2,
  Filter,
  PlusCircle,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { DrmRequestLog, StreamItem } from '../../types';
import { DrmLogItemCard } from './DrmLogItemCard';
import { DrmSimulateModal } from './DrmSimulateModal';

interface DrmInspectorTabProps {
  streams: StreamItem[];
  serverLanIp: string;
}

export const DrmInspectorTab: React.FC<DrmInspectorTabProps> = ({
  streams,
  serverLanIp,
}) => {
  const [logs, setLogs] = useState<DrmRequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch('/api/drm/logs');
      const data = await res.json();
      if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch DRM logs:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();

    // Real-time Server-Sent Events (SSE) listener
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/drm/logs/stream');
      es.onmessage = (event) => {
        try {
          const newLog = JSON.parse(event.data);
          if (newLog && newLog.id) {
            setLogs((prev) => {
              if (prev.some((p) => p.id === newLog.id)) return prev;
              return [newLog, ...prev];
            });
          }
        } catch {
          // ignore keepalive
        }
      };
    } catch (e) {
      console.warn('SSE initialization error:', e);
    }

    return () => {
      if (es) es.close();
    };
  }, [fetchLogs]);

  // Secondary fallback polling if autoRefresh is active
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/drm/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear DRM logs:', err);
    }
  };

  const handleReplay = async (log: DrmRequestLog) => {
    setReplayingId(log.id);
    try {
      if (log.method === 'POST') {
        await fetch(log.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': log.userAgent,
          },
          body: JSON.stringify(log.body),
        });
      } else {
        await fetch(log.url, {
          method: 'GET',
          headers: {
            'User-Agent': log.userAgent,
          },
        });
      }
      // Re-fetch immediately
      await fetchLogs(true);
    } catch (err) {
      console.error('Failed to replay request:', err);
    } finally {
      setReplayingId(null);
    }
  };

  // Metrics
  const totalCount = logs.length;
  const exoCount = logs.filter((l) => l.clientCategory === 'Android ExoPlayer').length;
  const successCount = logs.filter((l) => l.status >= 200 && logStatusOk(l.status)).length;
  const errorCount = logs.filter((l) => l.status >= 400).length;
  const avgLatency =
    totalCount > 0
      ? Math.round(logs.reduce((acc, curr) => acc + curr.durationMs, 0) / totalCount)
      : 0;

  function logStatusOk(status: number) {
    return status >= 200 && status < 300;
  }

  // Filtered logs
  const filteredLogs = logs.filter((l) => {
    if (selectedCategory !== 'all' && l.clientCategory !== selectedCategory) {
      return false;
    }
    if (selectedStatus === 'success' && !logStatusOk(l.status)) {
      return false;
    }
    if (selectedStatus === 'error' && logStatusOk(l.status)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUrl = l.url.toLowerCase().includes(q);
      const matchIp = l.clientIp.toLowerCase().includes(q);
      const matchUa = l.userAgent.toLowerCase().includes(q);
      const matchKids = l.extractedKids.some((k) => k.toLowerCase().includes(q));
      if (!matchUrl && !matchIp && !matchUa && !matchKids) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              DRM Logs
            </h2>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/80 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Auto Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-slate-800 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{autoRefresh ? 'Live' : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            disabled={loading}
            onClick={() => fetchLogs()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Refresh"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Simulate Button */}
          <button
            type="button"
            onClick={() => setIsSimulateOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>

          {/* Clear Logs */}
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Total Captured
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">{totalCount}</span>
            <span className="text-[11px] text-slate-400">requests</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-emerald-400" />
            ExoPlayer
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-400">{exoCount}</span>
            <span className="text-[11px] text-slate-400">hits</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Success (200 OK)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-300">{successCount}</span>
            {errorCount > 0 && (
              <span className="text-[11px] text-rose-400">({errorCount} errors)</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            Avg Latency
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-sky-400">{avgLatency}</span>
            <span className="text-[11px] text-slate-400">ms</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IP, URL, KID, or User-Agent..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-500 font-medium px-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'Android ExoPlayer', label: 'ExoPlayer' },
            { id: 'Shaka Player', label: 'Shaka' },
            { id: 'API Tool / cURL', label: 'API/cURL' },
            { id: 'Web Browser', label: 'Browser' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Status Filter */}
          <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />
          {[
            { id: 'all', label: 'All Status' },
            { id: 'success', label: '200 OK' },
            { id: 'error', label: '4xx Errors' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${
                selectedStatus === st.id
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <DrmLogItemCard
              key={log.id}
              log={log}
              onReplay={handleReplay}
              isReplaying={replayingId === log.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center mx-auto">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-xs font-semibold text-white">No DRM Requests Logged</h3>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            License transactions from ExoPlayer, Shaka Player, or API tools will appear here in real time.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsSimulateOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      <DrmSimulateModal
        streams={streams}
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSimulationComplete={() => {
          fetchLogs(true);
        }}
      />
    </div>
  );
};
