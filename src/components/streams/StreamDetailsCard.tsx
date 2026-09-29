import React, { useState } from 'react';
import { Play, Code2, Trash2, KeyRound, ExternalLink, Terminal } from 'lucide-react';
import { StreamItem } from '../../types';
import { CopyButton } from '../common/CopyButton';

interface StreamDetailsCardProps {
  stream: StreamItem;
  serverLanIp: string;
  onPlayInPlayer: (stream: StreamItem) => void;
  onOpenCodeModal: (stream: StreamItem) => void;
  onDeleteStream: (id: string) => void;
  isDeleting: boolean;
}

export const StreamDetailsCard: React.FC<StreamDetailsCardProps> = ({
  stream,
  serverLanIp,
  onPlayInPlayer,
  onOpenCodeModal,
  onDeleteStream,
  isDeleting,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const baseUrl = serverLanIp ? `http://${serverLanIp}:3000` : window.location.origin;
  const fullMpdUrl = stream.mpdUrl ? `${baseUrl}${stream.mpdUrl}` : '';
  const fullHlsUrl = stream.hlsUrl ? `${baseUrl}${stream.hlsUrl}` : '';
  const fullLicenseUrl = `${baseUrl}/api/clearkey-license`;

  // Standard W3C ClearKey JWK payload used by ExoPlayer / EME / Shaka Player
  const clearkeyJwkJson = JSON.stringify(
    {
      keys: [
        {
          kty: 'oct',
          k: stream.keys.keyBase64Url,
          kid: stream.keys.kidBase64Url,
        },
      ],
      type: 'temporary',
    },
    null,
    2
  );

  // Compact one-line JWK JSON for inline preview
  const compactJwk = JSON.stringify({
    keys: [{ kty: 'oct', k: stream.keys.keyBase64Url, kid: stream.keys.kidBase64Url }],
    type: 'temporary',
  });

  // Simple Hex Key-Pair JSON used by IPTV, OTT apps, and custom DRM players
  const hexPairJson = JSON.stringify(
    {
      [stream.keys.kidHex]: stream.keys.keyHex,
    },
    null,
    2
  );

  // Compact one-line Hex Pair JSON for inline preview
  const compactHexPair = JSON.stringify({
    [stream.keys.kidHex]: stream.keys.keyHex,
  });

  const curlCommand = `curl -s -X POST "${fullLicenseUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"kids":["${stream.keys.kidBase64Url}"]}'`;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-4 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>{stream.customName || stream.originalName}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{stream.id}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onPlayInPlayer(stream)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCodeModal(stream)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exo Code</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Delete Stream"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-950/40 p-1 rounded-lg border border-rose-800/60 text-xs">
              <button
                type="button"
                onClick={() => {
                  onDeleteStream(stream.id);
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[11px]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stream Endpoints */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300">Stream URLs</h3>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {fullMpdUrl && (
            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase">MPEG-DASH (.mpd)</div>
                <div className="font-mono text-slate-300 text-[11px] truncate">{fullMpdUrl}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CopyButton text={fullMpdUrl} />
                <a href={fullMpdUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {fullHlsUrl && (
            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-amber-400 font-semibold uppercase">Apple HLS (.m3u8)</div>
                <div className="font-mono text-slate-300 text-[11px] truncate">{fullHlsUrl}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CopyButton text={fullHlsUrl} />
                <a href={fullHlsUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">License Server URL</div>
              <div className="font-mono text-slate-300 text-[11px] truncate">{fullLicenseUrl}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <CopyButton text={fullLicenseUrl} />
            </div>
          </div>
        </div>
      </div>

      {/* ClearKey DRM Keys & JSONs (Serial items) */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span>DRM Keys & JSON</span>
        </h3>
        <div className="bg-slate-900/60 rounded-lg border border-slate-800 divide-y divide-slate-800/80 text-[11px] font-mono">
          {/* KID Hex */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 shrink-0">KID (Hex):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-indigo-300 text-[10px] sm:text-[11px] truncate select-all">{stream.keys.kidHex}</span>
              <CopyButton text={stream.keys.kidHex} />
            </div>
          </div>

          {/* KEY Hex */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 shrink-0">KEY (Hex):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-emerald-300 text-[10px] sm:text-[11px] truncate select-all">{stream.keys.keyHex}</span>
              <CopyButton text={stream.keys.keyHex} />
            </div>
          </div>

          {/* KID Base64URL */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 shrink-0">KID (Base64url):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-slate-300 text-[10px] sm:text-[11px] truncate select-all">{stream.keys.kidBase64Url}</span>
              <CopyButton text={stream.keys.kidBase64Url} />
            </div>
          </div>

          {/* KEY Base64URL */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 shrink-0">KEY (Base64url):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-slate-300 text-[10px] sm:text-[11px] truncate select-all">{stream.keys.keyBase64Url}</span>
              <CopyButton text={stream.keys.keyBase64Url} />
            </div>
          </div>

          {/* W3C JWK JSON (Ready to use for local ExoPlayer / Shaka playback) */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-indigo-400 font-semibold shrink-0">W3C JWK (JSON):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-indigo-200 text-[10px] sm:text-[11px] truncate select-all font-mono" title={compactJwk}>
                {compactJwk}
              </span>
              <CopyButton text={clearkeyJwkJson} />
            </div>
          </div>

          {/* Hex Pair JSON (Ready to use for IPTV / custom key maps) */}
          <div className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-emerald-400 font-semibold shrink-0">Hex Pair (JSON):</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 min-w-0">
              <span className="text-emerald-200 text-[10px] sm:text-[11px] truncate select-all font-mono" title={compactHexPair}>
                {compactHexPair}
              </span>
              <CopyButton text={hexPairJson} />
            </div>
          </div>
        </div>
      </div>

      {/* cURL Snippet */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>cURL Test:</span>
          </span>
          <CopyButton text={curlCommand} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]" />
        </div>
        <pre className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto">
          {curlCommand}
        </pre>
      </div>
    </div>
  );
};
