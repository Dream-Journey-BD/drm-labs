import React from 'react';
import { FileCode, Tag } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsM3USpecs: React.FC = () => {
  const m3uSample = `#EXTM3U
#EXTINF:-1 tvg-id="Ch1" tvg-logo="https://logo.png" group-title="Sports",Premium Sports HD
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=00112233445566778899aabbccddeeff:ffeeddccbbaa99887766554433221100
#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
#EXTVLCOPT:http-referrer=https://stream-provider.com
https://example.com/live/ch1/stream.mpd`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          📡 IPTV & M3U DRM Specifications
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Modern IPTV applications (TiviMate, Kodi InputStream.Adaptive, OTT Navigator, Smarters) read DRM keys and HTTP headers from extended M3U directives.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1 text-indigo-400 font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>🏷️ #KODIPROP Directives</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-white">license_type=clearkey</code> specifies ClearKey DRM.
            <br />
            <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-white">license_key=KID:KEY</code> passes the 32-char hex credentials directly.
          </p>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1 text-sky-400 font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>🌐 #EXTVLCOPT Directives</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Custom headers like <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-white">http-user-agent</code> and <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-white">http-referrer</code> bypass hotlink and security protections.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>📋 Complete M3U Channel Directives Example:</span>
          <CopyButton text={m3uSample} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs" />
        </div>
        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {m3uSample}
        </pre>
      </div>
    </div>
  );
};
