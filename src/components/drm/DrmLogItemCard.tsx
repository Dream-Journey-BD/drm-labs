import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  Play,
  Globe,
  Terminal,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { DrmRequestLog } from '../../types';

interface DrmLogItemCardProps {
  log: DrmRequestLog;
  onReplay: (log: DrmRequestLog) => void;
  isReplaying?: boolean;
}

export const DrmLogItemCard: React.FC<DrmLogItemCardProps> = ({
  log,
  onReplay,
  isReplaying = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [activeTab, setActiveTab] = useState<'payload' | 'response' | 'headers'>('payload');

  const handleCopyCurl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(log.curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      typeof log.body === 'object' ? JSON.stringify(log.body, null, 2) : String(log.body)
    );
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleCopyResponse = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(log.responseBody, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const isSuccess = log.status >= 200 && log.status < 300;

  // Icon for category
  const getCategoryIcon = () => {
    switch (log.clientCategory) {
      case 'Android ExoPlayer':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Shaka Player':
        return <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />;
      case 'API Tool / cURL':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div
      className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
        expanded
          ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/20'
          : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Header bar / Summary Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
      >
        {/* Left: Method, URL, Category */}
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
              isSuccess
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
            }`}
          >
            {isSuccess ? (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            )}
            <span>{log.status}</span>
          </span>

          {/* Method */}
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold ${
              log.method === 'POST'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                : 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
            }`}
          >
            {log.method}
          </span>

          {/* URL */}
          <span className="font-mono text-xs text-slate-200 truncate max-w-[220px] sm:max-w-xs font-medium">
            {log.url}
          </span>

          {/* Category Chip */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            {getCategoryIcon()}
            <span>{log.clientCategory}</span>
          </div>
        </div>

        {/* Right: IP, Latency, Timestamp & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60">
              {log.clientIp}
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-medium">
              {log.durationMs}ms
            </span>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              {log.timeFormatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Replay Button */}
            <button
              type="button"
              disabled={isReplaying}
              onClick={(e) => {
                e.stopPropagation();
                onReplay(log);
              }}
              title="Replay this request against the server"
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isReplaying ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Replay</span>
            </button>

            {/* Copy cURL */}
            <button
              type="button"
              onClick={handleCopyCurl}
              title="Copy cURL command"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              {copiedCurl ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Expand / Collapse Icon */}
            <div className="p-1 rounded-lg text-slate-400 hover:text-white">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="border-t border-slate-800 bg-slate-950/70 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Client Device / User-Agent
              </span>
              <p className="font-mono text-slate-300 truncate" title={log.userAgent}>
                {log.userAgent}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Matched Stream
              </span>
              <p className="text-slate-300 font-medium">
                {log.matchedStreamName ? (
                  <span className="text-indigo-400">{log.matchedStreamName}</span>
                ) : (
                  <span className="text-slate-500">None (Auto KID search)</span>
                )}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Extracted KIDs in Request
              </span>
              <p className="font-mono text-emerald-300 truncate">
                {log.extractedKids.length > 0 ? log.extractedKids.join(', ') : 'None'}
              </p>
            </div>
          </div>

          {/* Tab Navigation for Payload / Response / Headers */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeTab === 'payload'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Payload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('response')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeTab === 'response'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Response
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('headers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeTab === 'headers'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Headers ({Object.keys(log.headers).length})
              </button>
            </div>

            {/* Quick Copy for current active tab */}
            {activeTab === 'payload' && (
              <button
                type="button"
                onClick={handleCopyBody}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
              >
                {copiedBody ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'response' && (
              <button
                type="button"
                onClick={handleCopyResponse}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
              >
                {copiedResponse ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'payload' && (
            <div>
              {log.body ? (
                <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-48 leading-relaxed">
                  {typeof log.body === 'object'
                    ? JSON.stringify(log.body, null, 2)
                    : String(log.body)}
                </pre>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                  No request body (GET request).
                </div>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div>
              <pre
                className={`p-3 bg-slate-900 rounded-xl border text-xs font-mono overflow-x-auto max-h-48 leading-relaxed ${
                  isSuccess
                    ? 'border-slate-800 text-indigo-300'
                    : 'border-rose-900/50 text-rose-300'
                }`}
              >
                {JSON.stringify(log.responseBody, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-1.5">Header</th>
                    <th className="px-3 py-1.5">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(log.headers).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-800/40">
                      <td className="px-3 py-1.5 text-indigo-300 font-semibold">{k}</td>
                      <td className="px-3 py-1.5 text-slate-300 break-all">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* cURL Snippet Row */}
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                cURL
              </span>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg overflow-x-auto whitespace-pre">
              {log.curlCommand}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
