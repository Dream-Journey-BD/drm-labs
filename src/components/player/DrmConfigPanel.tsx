import React from 'react';
import { Shield, RotateCcw, Sparkles } from 'lucide-react';

interface DrmConfigPanelProps {
  drmType: string;
  onDrmTypeChange: (val: string) => void;
  kidHex: string;
  onKidHexChange: (val: string) => void;
  keyHex: string;
  onKeyHexChange: (val: string) => void;
  licenseServerUrl: string;
  onLicenseServerUrlChange: (val: string) => void;
  onResetDefaultDrm: () => void;
  onClearDrm: () => void;
}

export const DrmConfigPanel: React.FC<DrmConfigPanelProps> = ({
  drmType,
  onDrmTypeChange,
  kidHex,
  onKidHexChange,
  keyHex,
  onKeyHexChange,
  licenseServerUrl,
  onLicenseServerUrlChange,
  onResetDefaultDrm,
  onClearDrm,
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
          <h3 className="text-xs font-semibold text-white">DRM Decryption Configuration</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onResetDefaultDrm}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill Test Keys</span>
          </button>
          <button
            type="button"
            onClick={onClearDrm}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* DRM System */}
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block font-medium">DRM System:</label>
          <select
            value={drmType}
            onChange={(e) => onDrmTypeChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium"
          >
            <option value="clearkey">W3C ClearKey (org.w3.clearkey)</option>
            <option value="widevine">Google Widevine (com.widevine.alpha)</option>
            <option value="playready">Microsoft PlayReady (com.microsoft.playready)</option>
          </select>
        </div>

        {/* ClearKey KID */}
        {drmType === 'clearkey' ? (
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block font-medium">KID (32-char Hex):</label>
            <input
              type="text"
              value={kidHex}
              maxLength={32}
              onChange={(e) => onKidHexChange(e.target.value.toLowerCase())}
              placeholder="e.g. 00112233445566778899aabbccddeeff"
              className="w-full bg-slate-900 border border-slate-750 text-indigo-300 font-mono text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition"
            />
          </div>
        ) : (
          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 mb-1 block font-medium">License Server URL:</label>
            <input
              type="text"
              value={licenseServerUrl}
              onChange={(e) => onLicenseServerUrlChange(e.target.value)}
              placeholder="https://license.example.com/get-license"
              className="w-full bg-slate-900 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition"
            />
          </div>
        )}

        {/* ClearKey KEY */}
        {drmType === 'clearkey' && (
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block font-medium">KEY (32-char Hex):</label>
            <input
              type="text"
              value={keyHex}
              maxLength={32}
              onChange={(e) => onKeyHexChange(e.target.value.toLowerCase())}
              placeholder="e.g. ffeeddccbbaa99887766554433221100"
              className="w-full bg-slate-900 border border-slate-750 text-emerald-300 font-mono text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition"
            />
          </div>
        )}
      </div>

      {/* License Server URL for ClearKey if needed */}
      {drmType === 'clearkey' && (
        <div className="pt-1">
          <label className="text-[11px] text-slate-400 mb-1 block font-medium">
            ClearKey License Server URL (Optional):
          </label>
          <input
            type="text"
            value={licenseServerUrl}
            onChange={(e) => onLicenseServerUrlChange(e.target.value)}
            placeholder="http://your-server:3000/api/clearkey-license (Optional if raw hex provided)"
            className="w-full bg-slate-900 border border-slate-750 text-slate-300 font-mono text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 transition"
          />
        </div>
      )}
    </div>
  );
};
