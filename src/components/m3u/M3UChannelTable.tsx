import React, { useState } from 'react';
import { Tv, Play, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { M3UChannel } from './M3UParser';
import { CopyButton } from '../common/CopyButton';

interface M3UChannelTableProps {
  channels: M3UChannel[];
  onPlayChannel: (channel: M3UChannel) => void;
  onCheckSingleChannel: (channel: M3UChannel) => void;
}

export const M3UChannelTable: React.FC<M3UChannelTableProps> = ({
  channels,
  onPlayChannel,
  onCheckSingleChannel,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const totalPages = Math.ceil(channels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleChannels = channels.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Group</th>
              <th className="py-2.5 px-3">DRM / Protection</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {visibleChannels.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                  No matching channels found.
                </td>
              </tr>
            ) : (
              visibleChannels.map((channel) => (
                <tr key={channel.id} className="hover:bg-slate-900/40 transition">
                  {/* Channel Title & Logo */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt=""
                          className="w-6 h-6 object-contain rounded bg-black/40 p-0.5 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                          <Tv className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{channel.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-xs">{channel.url}</div>
                      </div>
                    </div>
                  </td>

                  {/* Group / Category */}
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                      {channel.group || 'General'}
                    </span>
                  </td>

                  {/* DRM Status */}
                  <td className="py-2.5 px-3">
                    {channel.drm?.type || channel.drm?.kidHex ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 flex items-center gap-1 w-fit">
                        <KeyRound className="w-2.5 h-2.5" />
                        <span>{channel.drm.type || 'ClearKey'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Clear</span>
                    )}
                  </td>

                  {/* Online / Offline Status */}
                  <td className="py-2.5 px-3">
                    {channel.status === 'online' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1 w-fit font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Online</span>
                        {channel.latencyMs ? <span className="text-emerald-300">({channel.latencyMs}ms)</span> : null}
                      </span>
                    )}
                    {channel.status === 'error' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center gap-1 w-fit font-medium">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Offline</span>
                      </span>
                    )}
                    {channel.status === 'checking' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center gap-1 w-fit font-medium">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        <span>Checking</span>
                      </span>
                    )}
                    {(!channel.status || channel.status === 'idle') && (
                      <span className="text-[10px] text-slate-500 font-mono">Untested</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPlayChannel(channel)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 text-[11px] font-medium shadow-sm cursor-pointer"
                        title="Play in Universal Player"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCheckSingleChannel(channel)}
                        className="p-1 rounded text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                        title="Check Stream Health"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>

                      <CopyButton text={channel.url} className="p-1 text-slate-400 hover:text-white transition" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span className="text-[11px] sm:text-xs">
            Showing {startIndex + 1} - {Math.min(channels.length, startIndex + itemsPerPage)} of {channels.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-white text-[11px] sm:text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
