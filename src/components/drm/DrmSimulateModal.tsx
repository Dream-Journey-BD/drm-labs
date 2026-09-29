import React, { useState } from 'react';
import { X, Send, Play, Terminal, Check, Copy } from 'lucide-react';
import { StreamItem } from '../../types';

interface DrmSimulateModalProps {
  streams: StreamItem[];
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: () => void;
}

export const DrmSimulateModal: React.FC<DrmSimulateModalProps> = ({
  streams,
  isOpen,
  onClose,
  onSimulationComplete,
}) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string>(
    streams[0]?.id || ''
  );
  const [requestMethod, setRequestMethod] = useState<'POST' | 'GET'>('POST');
  const [customKid, setCustomKid] = useState<string>('');
  const [endpointType, setEndpointType] = useState<'standard' | 'by_id'>('standard');
  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    data: any;
    durationMs: number;
  } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!isOpen) return null;

  const currentStream = streams.find((s) => s.id === selectedStreamId) || streams[0];

  const handleSelectStream = (id: string) => {
    setSelectedStreamId(id);
    const found = streams.find((s) => s.id === id);
    if (found && found.keys) {
      setCustomKid(found.keys.kidBase64Url);
    }
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setResponseResult(null);

    const startTime = performance.now();
    try {
      const kidToSend = customKid.trim() || currentStream?.keys?.kidBase64Url || 'EjRWeJCrze8SNFZ4kKvN7w';
      let targetUrl = '/api/clearkey-license';

      if (endpointType === 'by_id' && currentStream) {
        targetUrl = `/api/clearkey-license/${currentStream.id}`;
      }

      let res: Response;
      if (requestMethod === 'POST') {
        res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ExoPlayerLib/2.19.1 (Simulated Android Client)',
          },
          body: JSON.stringify({
            kids: [kidToSend],
            type: 'temporary',
          }),
        });
      } else {
        const getUrl = endpointType === 'by_id'
          ? targetUrl
          : `${targetUrl}?kid=${encodeURIComponent(kidToSend)}`;
        res = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Simulated',
          },
        });
      }

      const durationMs = Math.round(performance.now() - startTime);
      const data = await res.json();
      setResponseResult({
        status: res.status,
        data,
        durationMs,
      });
      onSimulationComplete();
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      setResponseResult({
        status: 500,
        data: { error: err.message || 'Simulation network error' },
        durationMs,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult.data, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Test DRM License</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Stream Preset Selector */}
          {streams.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Load Preset From Stream
              </label>
              <select
                value={selectedStreamId}
                onChange={(e) => handleSelectStream(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.customName || s.originalName} ({s.streamFormat || 'DASH'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Request Method & Endpoint Format */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                HTTP Method
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRequestMethod('POST')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                    requestMethod === 'POST'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  POST (ExoPlayer)
                </button>
                <button
                  type="button"
                  onClick={() => setRequestMethod('GET')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                    requestMethod === 'GET'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GET (Query)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Endpoint URL
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEndpointType('standard')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                    endpointType === 'standard'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Universal
                </button>
                <button
                  type="button"
                  onClick={() => setEndpointType('by_id')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                    endpointType === 'by_id'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  With Stream ID
                </button>
              </div>
            </div>
          </div>

          {/* Key ID (KID) to test */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Key ID (KID)
              </label>
              {currentStream?.keys?.kidBase64Url && (
                <button
                  type="button"
                  onClick={() => setCustomKid(currentStream.keys.kidBase64Url)}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Fill Stream KID
                </button>
              )}
            </div>
            <input
              type="text"
              value={customKid}
              onChange={(e) => setCustomKid(e.target.value)}
              placeholder={currentStream?.keys?.kidBase64Url || 'Enter Base64URL or Hex KID'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {requestMethod === 'POST'
                ? 'Will be sent as {"kids": ["<KID>"], "type": "temporary"} just like ExoPlayer does.'
                : 'Will be sent as query parameter ?kid=<KID>.'}
            </p>
          </div>

          {/* Response Preview */}
          {responseResult && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      responseResult.status === 200
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    HTTP {responseResult.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {responseResult.durationMs}ms
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded-lg overflow-x-auto max-h-40">
                {JSON.stringify(responseResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleRunSimulation}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
