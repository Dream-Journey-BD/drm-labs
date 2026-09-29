import React, { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { M3UChannel, generateCleanM3U } from './M3UParser';
import { CopyButton } from '../common/CopyButton';

interface M3UExportModalProps {
  channels: M3UChannel[];
  onClose: () => void;
}

export const M3UExportModal: React.FC<M3UExportModalProps> = ({ channels, onClose }) => {
  const [exportFilter, setExportFilter] = useState<'online' | 'all'>('online');

  const filteredChannels =
    exportFilter === 'online' ? channels.filter((c) => c.status === 'online') : channels;

  const m3uContent = generateCleanM3U(filteredChannels);

  const handleDownload = () => {
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drmlabs_${exportFilter}_channels_${Date.now()}.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Export Clean M3U Playlist</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Export Scope:</label>
            <select
              value={exportFilter}
              onChange={(e) => setExportFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="online">Only Online / Working Streams ({channels.filter((c) => c.status === 'online').length})</option>
              <option value="all">All Channels ({channels.length})</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Preview ({filteredChannels.length} channels):</span>
              <CopyButton text={m3uContent} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-medium" />
            </div>
            <pre className="h-48 overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 leading-relaxed">
              {m3uContent.slice(0, 1500)}
              {m3uContent.length > 1500 ? '\n... (truncated for preview)' : ''}
            </pre>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Filtered {filteredChannels.length} channels ready for IPTV players
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .M3U</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
