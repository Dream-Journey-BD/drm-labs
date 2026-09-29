import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Settings,
  Languages,
  Subtitles,
  Gauge,
  Tv,
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  onSeek: (time: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLive: boolean;
  videoTracks: any[];
  selectedVideoTrackId: number | string;
  onSelectVideoTrack: (id: any) => void;
  audioTracks: any[];
  selectedAudioTrackId: number | string;
  onSelectAudioTrack: (id: any) => void;
  textTracks: any[];
  selectedTextTrackId: number | string;
  onSelectTextTrack: (id: any) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  aspectRatio: string;
  onToggleAspectRatio: () => void;
  onTogglePip?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  bufferedEnd,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  isLive,
  videoTracks,
  selectedVideoTrackId,
  onSelectVideoTrack,
  audioTracks,
  selectedAudioTrackId,
  onSelectAudioTrack,
  textTracks,
  selectedTextTrackId,
  onSelectTextTrack,
  playbackRate,
  onPlaybackRateChange,
  aspectRatio,
  onToggleAspectRatio,
  onTogglePip,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pt-8 flex flex-col gap-2 transition opacity-0 group-hover:opacity-100 focus-within:opacity-100">
      {/* Seekbar */}
      {!isLive && (
        <div
          className="relative w-full h-2 group/seek cursor-pointer flex items-center"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * duration);
          }}
        >
          {/* Background rail */}
          <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
          {/* Buffered rail */}
          <div
            className="absolute left-0 h-1 bg-white/40 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, bufferedPercent))}%` }}
          />
          {/* Played progress rail */}
          <div
            className="absolute left-0 h-1 bg-indigo-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
          {/* Seek thumb */}
          <div
            className="absolute w-3 h-3 bg-white rounded-full shadow-md -translate-x-1/2 scale-0 group-hover/seek:scale-100 transition-transform"
            style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-2 text-white">
        {/* Left Side: Play/Pause, Live badge, Current Time, Sound/Volume */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/80 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>LIVE</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}

          {/* Sound / Volume Control (Right after Play button and Time) */}
          <div className="flex items-center gap-1.5 group/vol ml-1">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 rounded-lg hover:bg-white/20 transition text-slate-300 hover:text-white cursor-pointer"
              title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 bg-white/30 rounded-full accent-indigo-500 cursor-pointer hidden xs:block"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>

        {/* Right Side Controls: Resolution/Bitrate, Audio, Subs, Speed, Aspect, PiP, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quality / Resolution & Bitrate Track Selector (placed before Speed) */}
          {videoTracks && videoTracks.length > 0 && (
            <select
              value={selectedVideoTrackId}
              onChange={(e) => onSelectVideoTrack(e.target.value)}
              className="bg-black/70 border border-white/25 text-white text-[11px] font-medium rounded-md px-1.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer"
              title="Resolution & Bitrate"
            >
              <option value="auto">Quality: Auto</option>
              {videoTracks.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.height ? `${tr.height}p` : 'Video'}{tr.bandwidth ? ` (${Math.round(tr.bandwidth / 1000)}k)` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Audio Language / Track Selector */}
          {audioTracks && audioTracks.length > 1 && (
            <select
              value={selectedAudioTrackId}
              onChange={(e) => onSelectAudioTrack(e.target.value)}
              className="bg-black/70 border border-white/25 text-white text-[11px] font-medium rounded-md px-1.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer hidden sm:block"
              title="Audio Track / Language"
            >
              <option value="auto">Audio: Auto</option>
              {audioTracks.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.language ? tr.language.toUpperCase() : tr.label || 'Audio'}
                </option>
              ))}
            </select>
          )}

          {/* Subtitles Selector */}
          {textTracks && textTracks.length > 0 && (
            <select
              value={selectedTextTrackId}
              onChange={(e) => onSelectTextTrack(e.target.value)}
              className="bg-black/70 border border-white/25 text-white text-[11px] font-medium rounded-md px-1.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer hidden md:block"
              title="Subtitles"
            >
              <option value="off">Subs: Off</option>
              {textTracks.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.language || tr.label || 'Sub'}
                </option>
              ))}
            </select>
          )}

          {/* Playback Speed (placed after Resolution) */}
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="bg-black/70 border border-white/25 text-white text-[11px] font-medium rounded-md px-1.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer hidden sm:block"
            title="Playback Speed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Aspect Ratio Toggle */}
          <button
            type="button"
            onClick={onToggleAspectRatio}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-slate-300 hover:text-white text-[10px] font-mono hidden sm:block cursor-pointer"
            title={`Aspect Ratio: ${aspectRatio}`}
          >
            {aspectRatio}
          </button>

          {/* Picture in Picture */}
          {onTogglePip && (
            <button
              type="button"
              onClick={onTogglePip}
              className="p-1.5 rounded-lg hover:bg-white/20 transition text-slate-300 hover:text-white cursor-pointer"
              title="Picture-in-Picture"
            >
              <Tv className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-slate-300 hover:text-white cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
