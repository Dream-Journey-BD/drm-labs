import React from 'react';
import { Globe, Code2 } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsWebPlayers: React.FC = () => {
  const shakaJs = `// Google Shaka Player (Web JavaScript)
const video = document.getElementById('video');
const player = new shaka.Player(video);

player.configure({
  drm: {
    clearKeys: {
      '00112233445566778899aabbccddeeff': 'ffeeddccbbaa99887766554433221100'
    },
    servers: {
      'org.w3.clearkey': 'http://localhost:3000/api/clearkey-license'
    }
  }
});

await player.load('http://localhost:3000/streams/sample-stream/stream.mpd');
video.play();`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          🌐 Web Player Integration (Shaka & Video.js)
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Modern web browsers decrypt ClearKey content via HTML5 Encrypted Media Extensions (EME) using raw hex or JWK responses.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>🎬 Google Shaka Player Implementation:</span>
          </span>
          <CopyButton text={shakaJs} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs" />
        </div>
        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {shakaJs}
        </pre>
      </div>
    </div>
  );
};
