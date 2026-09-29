import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface StreamUrlBarProps {
  streamUrl: string;
  onStreamUrlChange: (val: string) => void;
  format: string;
  onFormatChange: (val: string) => void;
  isLoading: boolean;
  onLoadAndPlay: () => void;
  onClear: () => void;
}

export const StreamUrlBar: React.FC<StreamUrlBarProps> = ({
  streamUrl,
  onStreamUrlChange,
  format,
  onFormatChange,
  isLoading,
  onLoadAndPlay,
  onClear,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && streamUrl.trim() && !isLoading) {
      onLoadAndPlay();
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Stream URL Input */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => onStreamUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter stream URL (.mpd, .m3u8, .mp4, direct stream link...)"
            className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-500 transition"
          />
        </div>

        {/* Action Controls - Mobile responsive sub-row */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Format Selector */}
          <div className="flex-1 sm:w-36 shrink-0 min-w-[110px]">
            <select
              value={format}
              onChange={(e) => onFormatChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="auto">Auto-Detect</option>
              <option value="hls">Apple HLS (.m3u8)</option>
              <option value="dash">MPEG-DASH (.mpd)</option>
              <option value="mp4">MP4 Video (.mp4)</option>
              <option value="webm">WebM Video (.webm)</option>
              <option value="aac">AAC Audio (.aac)</option>
              <option value="mp3">MP3 Audio (.mp3)</option>
              <option value="smooth">Smooth Streaming</option>
            </select>
          </div>

          {/* Load & Play Button */}
          <button
            type="button"
            onClick={onLoadAndPlay}
            disabled={isLoading || !streamUrl.trim()}
            className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:border disabled:border-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLoading ? 'Loading...' : 'Play'}</span>
          </button>

          {/* Clear / Reset button */}
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition shrink-0 cursor-pointer"
            title="Clear stream URL and reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
