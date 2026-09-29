import React from 'react';
import { KeyRound, RotateCcw } from 'lucide-react';

interface DrmCredentialsInputsProps {
  kidInput: string;
  keyInput: string;
  onKidChange: (val: string) => void;
  onKeyChange: (val: string) => void;
  onRandomizeBoth: () => void;
  onResetDefaults: () => void;
  onRandomizeKid: () => void;
  onRandomizeKey: () => void;
}

export const DrmCredentialsInputs: React.FC<DrmCredentialsInputsProps> = ({
  kidInput,
  keyInput,
  onKidChange,
  onKeyChange,
  onRandomizeBoth,
  onResetDefaults,
  onRandomizeKid,
  onRandomizeKey,
}) => {
  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* KID Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-indigo-400" />
              KID (Hex):
            </label>
            <button
              type="button"
              onClick={onRandomizeKid}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Random
            </button>
          </div>
          <input
            type="text"
            value={kidInput}
            maxLength={32}
            onChange={(e) => onKidChange(e.target.value.toLowerCase())}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300 tracking-wider focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* KEY Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-emerald-400" />
              KEY (Hex):
            </label>
            <button
              type="button"
              onClick={onRandomizeKey}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Random
            </button>
          </div>
          <input
            type="text"
            value={keyInput}
            maxLength={32}
            onChange={(e) => onKeyChange(e.target.value.toLowerCase())}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 tracking-wider focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons: fully mobile-friendly and compact */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onRandomizeBoth}
          className="flex-1 sm:flex-initial px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Random Keys</span>
        </button>
        <button
          type="button"
          onClick={onResetDefaults}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Defaults</span>
        </button>
      </div>
    </div>
  );
};
