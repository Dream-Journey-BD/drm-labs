import React from 'react';
import { PlayCircle, StopCircle, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface M3UStatsBannerProps {
  totalCount: number;
  onlineCount: number;
  errorCount: number;
  isValidating: boolean;
  progressPercent: number;
  onStartValidation: () => void;
  onStopValidation: () => void;
  onOpenExportModal: () => void;
}

export const M3UStatsBanner: React.FC<M3UStatsBannerProps> = ({
  totalCount,
  onlineCount,
  errorCount,
  isValidating,
  progressPercent,
  onStartValidation,
  onStopValidation,
  onOpenExportModal,
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Metric Pills */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Total: <span className="font-semibold text-white">{totalCount}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Online:</span>
            <span className="font-semibold">{onlineCount}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Offline:</span>
            <span className="font-semibold">{errorCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isValidating ? (
            <button
              type="button"
              onClick={onStopValidation}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Validation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartValidation}
              disabled={totalCount === 0}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Validate All</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenExportModal}
            disabled={totalCount === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export M3U</span>
          </button>
        </div>
      </div>

      {/* Progress Bar when validating */}
      {isValidating && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Validating streams concurrently...</span>
            <span className="font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
