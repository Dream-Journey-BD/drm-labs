import React from 'react';
import { ShieldCheck, KeyRound, Lock, Server } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsDrmOverview: React.FC = () => {
  const jsonSample = `{
  "keys": [
    {
      "kty": "oct",
      "k": "/+7dzLuqmYh3ZlVEMyIRAA==",
      "kid": "ABEiM0RVZneImaq7zN3u/w=="
    }
  ],
  "type": "temporary"
}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          🛡️ ClearKey DRM Architecture & Fundamentals
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          W3C ClearKey is the standard, royalty-free digital rights management system built directly into HTML5 Encrypted Media Extensions (EME) and Android Media3 ExoPlayer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <KeyRound className="w-4 h-4 text-indigo-400 mb-1.5" />
          <h3 className="font-semibold text-white">🔑 Symmetric Keys</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Media is encrypted using 128-bit AES-128-CTR (Counter Mode) or AES-128-CBC with a 16-byte Key Identifier (KID).
          </p>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <Lock className="w-4 h-4 text-emerald-400 mb-1.5" />
          <h3 className="font-semibold text-white">🔒 W3C System ID</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            1077efec-c0b2-4d02-ace3-3c1e52e2fb4b
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Recognized natively by Android C.CLEARKEY_UUID</p>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <Server className="w-4 h-4 text-sky-400 mb-1.5" />
          <h3 className="font-semibold text-white">📡 License Protocol</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Exchange uses JSON Web Key (JWK) formatting where KID and KEY are encoded in Base64url (without padding).
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Standard W3C ClearKey Response Payload:</span>
          <CopyButton text={jsonSample} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs" />
        </div>
        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300">
          {jsonSample}
        </pre>
      </div>
    </div>
  );
};
