import React from 'react';
import { Radio, Code2, Play, Trash2, Volume2 } from 'lucide-react';
import { StreamItem } from '../../types';

interface StreamsListProps {
  streams: StreamItem[];
  selectedStreamId: string | null;
  onSelectStream: (id: string) => void;
  onOpenCodeModal: (stream: StreamItem) => void;
  onPlayInPlayer: (stream: StreamItem) => void;
  onDeleteStream: (id: string) => void;
  deletingStreamId: string | null;
  isDeleting: boolean;
}

export const StreamsList: React.FC<StreamsListProps> = ({
  streams,
  selectedStreamId,
  onSelectStream,
  onOpenCodeModal,
  onPlayInPlayer,
  onDeleteStream,
  deletingStreamId,
  isDeleting,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-semibold text-slate-300">Streams ({streams.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {streams.map((stream) => {
          const isSelected = stream.id === selectedStreamId;
          const isDeletingThis = deletingStreamId === stream.id && isDeleting;

          return (
            <div
              key={stream.id}
              onClick={() => onSelectStream(stream.id)}
              className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500/80 shadow-sm'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-white truncate" title={stream.customName || stream.originalName}>
                      {stream.customName || stream.originalName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{stream.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {stream.mpdUrl && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      DASH
                    </span>
                  )}
                  {stream.hlsUrl && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800/60">
                      HLS
                    </span>
                  )}
                  {stream.hasAudio && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-0.5">
                      <Volume2 className="w-2.5 h-2.5" />
                      AAC
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-500">
                  {new Date(stream.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onPlayInPlayer(stream)}
                    className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition flex items-center gap-1 text-[11px] font-medium"
                    title="Play in Universal Player"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCodeModal(stream)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-medium"
                    title="Generate Android ExoPlayer Code"
                  >
                    <Code2 className="w-3 h-3 text-emerald-400" />
                    <span>Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteStream(stream.id)}
                    disabled={isDeletingThis}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                    title="Delete Stream"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
