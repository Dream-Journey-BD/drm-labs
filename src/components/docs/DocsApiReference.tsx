import React from 'react';
import { Terminal, Server } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsApiReference: React.FC = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/streams',
      desc: 'Lists all packaged DRM video streams with URLs and keys',
    },
    {
      method: 'GET',
      path: '/api/streams/:id',
      desc: 'Returns details and manifest endpoints for a specific stream',
    },
    {
      method: 'POST / GET',
      path: '/api/clearkey-license',
      desc: 'W3C ClearKey DRM license server (auto-matches KID from POST payload or :id)',
    },
    {
      method: 'POST',
      path: '/api/m3u/check-channel',
      desc: 'Checks upstream channel health, latency, HTTP status code and headers',
    },
    {
      method: 'ALL',
      path: '/api/stream-proxy?url=...',
      desc: 'Universal media proxy for CORS bypass and custom header injection',
    },
    {
      method: 'GET',
      path: '/api/network-info',
      desc: 'Returns host local router LAN IP for Android physical device testing',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          ⚡ Server REST API Reference
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          DRM Labs exposes clean REST endpoints for stream management, license verification, and proxying.
        </p>
      </div>

      <div className="bg-slate-900/60 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs">
        {endpoints.map((ep) => (
          <div key={ep.path} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {ep.method}
                </span>
                <span className="text-white text-xs">{ep.path}</span>
              </div>
              <p className="text-[11px] text-slate-400">{ep.desc}</p>
            </div>
            <CopyButton text={ep.path} />
          </div>
        ))}
      </div>
    </div>
  );
};
