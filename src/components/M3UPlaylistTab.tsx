import React, { useRef, useState } from 'react';
import { Upload, FileText, Globe, Download, Loader2, AlertCircle, X } from 'lucide-react';
import { M3UChannel, parseM3UContent } from './m3u/M3UParser';
import { M3UStatsBanner } from './m3u/M3UStatsBanner';
import { M3UFilterBar } from './m3u/M3UFilterBar';
import { M3UChannelTable } from './m3u/M3UChannelTable';
import { M3UExportModal } from './m3u/M3UExportModal';

interface M3UPlaylistTabProps {
  onPlayChannelInPlayer: (channel: M3UChannel) => void;
}

export const M3UPlaylistTab: React.FC<M3UPlaylistTabProps> = ({ onPlayChannelInPlayer }) => {
  const [channels, setChannels] = useState<M3UChannel[]>([]);
  const [rawInput, setRawInput] = useState('');
  const [showRawInput, setShowRawInput] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'error' | 'idle'>('all');
  const [isValidating, setIsValidating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelValidationRef = useRef(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseM3UContent(text);
        setChannels(parsed);
        setShowRawInput(false);
        setShowUrlInput(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleParseRaw = () => {
    if (!rawInput.trim()) return;
    const parsed = parseM3UContent(rawInput);
    setChannels(parsed);
    setShowRawInput(false);
  };

  const handleFetchFromUrl = async () => {
    const trimmed = playlistUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter a valid playlist URL');
      return;
    }

    setIsFetchingUrl(true);
    setUrlError(null);

    try {
      const res = await fetch('/api/m3u/fetch-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server responded with HTTP ${res.status}`);
      }

      if (!data.content || typeof data.content !== 'string' || !data.content.trim()) {
        throw new Error('Received empty playlist content from the URL');
      }

      const parsed = parseM3UContent(data.content);
      if (parsed.length === 0) {
        throw new Error('No valid channels found in the fetched content. Ensure the URL points to a valid M3U/M3U8 file.');
      }

      setChannels(parsed);
      setShowUrlInput(false);
      setUrlError(null);
    } catch (err: any) {
      setUrlError(err?.message || 'Failed to fetch playlist from the URL');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Batch stream validation
  const startValidation = async () => {
    if (channels.length === 0 || isValidating) return;
    setIsValidating(true);
    cancelValidationRef.current = false;
    setProgressPercent(0);

    const total = channels.length;
    let completed = 0;
    const concurrency = 4;
    const queue = [...channels];

    const worker = async () => {
      while (queue.length > 0 && !cancelValidationRef.current) {
        const ch = queue.shift();
        if (!ch) break;

        // Mark as checking
        setChannels((prev) =>
          prev.map((c) => (c.id === ch.id ? { ...c, status: 'checking' } : c))
        );

        try {
          const res = await fetch('/api/m3u/check-channel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: ch.url,
              headers: ch.headers,
              timeoutMs: 6000,
            }),
          });
          const result = await res.json();

          setChannels((prev) =>
            prev.map((c) =>
              c.id === ch.id
                ? {
                    ...c,
                    status: result.status === 'online' ? 'online' : 'error',
                    latencyMs: result.latencyMs,
                    httpCode: result.httpCode,
                  }
                : c
            )
          );
        } catch (err) {
          setChannels((prev) =>
            prev.map((c) => (c.id === ch.id ? { ...c, status: 'error' } : c))
          );
        }

        completed++;
        setProgressPercent((completed / total) * 100);
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
    await Promise.all(workers);

    setIsValidating(false);
  };

  const stopValidation = () => {
    cancelValidationRef.current = true;
    setIsValidating(false);
  };

  const checkSingleChannel = async (channel: M3UChannel) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === channel.id ? { ...c, status: 'checking' } : c))
    );

    try {
      const res = await fetch('/api/m3u/check-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: channel.url,
          headers: channel.headers,
          timeoutMs: 6000,
        }),
      });
      const result = await res.json();
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channel.id
            ? {
                ...c,
                status: result.status === 'online' ? 'online' : 'error',
                latencyMs: result.latencyMs,
                httpCode: result.httpCode,
              }
            : c
        )
      );
    } catch (e) {
      setChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, status: 'error' } : c))
      );
    }
  };

  const categories = Array.from(new Set(channels.map((c) => c.group || 'General'))).filter(Boolean);

  const filteredChannels = channels.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (c.group || 'General') === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'online' && c.status === 'online') ||
      (statusFilter === 'error' && c.status === 'error') ||
      (statusFilter === 'idle' && (!c.status || c.status === 'idle'));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const onlineCount = channels.filter((c) => c.status === 'online').length;
  const errorCount = channels.filter((c) => c.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Upload / Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-slate-950 border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".m3u,.m3u8,text/plain"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Import M3U / M3U8 Playlist
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                if (!showUrlInput) setShowRawInput(false);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                showUrlInput
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>URL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowRawInput(!showRawInput);
                if (!showRawInput) setShowUrlInput(false);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                showRawInput
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>
        </div>
      </div>

      {/* From URL Panel */}
      {showUrlInput && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-white">Load Playlist from URL</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setUrlError(null);
              }}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => {
                  setPlaylistUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFetchFromUrl();
                  }
                }}
                placeholder="Paste URL (e.g. https://raw.githubusercontent.com/.../playlist.m3u or IPTV stream URL)"
                className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-3 py-2 pl-9 font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
              />
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {playlistUrl && (
                <button
                  type="button"
                  onClick={() => setPlaylistUrl('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleFetchFromUrl}
              disabled={isFetchingUrl || !playlistUrl.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-sm shrink-0 active:scale-95"
            >
              {isFetchingUrl ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Fetch & Load</span>
                </>
              )}
            </button>
          </div>

          {urlError && (
            <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{urlError}</span>
            </p>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Directly loads playlists from GitHub raw URLs (automatically handles /blob/ links), Pastebin, Gist, or external IPTV URLs. Requests are proxied server-side to bypass CORS limitations.
          </p>
        </div>
      )}

      {/* Raw Input Collapsible area */}
      {showRawInput && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white">Paste M3U or M3U8 Content</h3>
            <button
              type="button"
              onClick={() => setShowRawInput(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={5}
            placeholder="#EXTM3U&#10;#EXTINF:-1 group-title=&quot;News&quot;,My Channel&#10;https://..."
            className="w-full bg-slate-900 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg p-3 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleParseRaw}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
          >
            Parse Playlist
          </button>
        </div>
      )}

      {/* Stats and Batch Validation Banner */}
      {channels.length > 0 && (
        <M3UStatsBanner
          totalCount={channels.length}
          onlineCount={onlineCount}
          errorCount={errorCount}
          isValidating={isValidating}
          progressPercent={progressPercent}
          onStartValidation={startValidation}
          onStopValidation={stopValidation}
          onOpenExportModal={() => setShowExportModal(true)}
        />
      )}

      {/* Filter and Search Bar */}
      {channels.length > 0 && (
        <M3UFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      )}

      {/* Channels Table */}
      {channels.length > 0 && (
        <M3UChannelTable
          channels={filteredChannels}
          onPlayChannel={onPlayChannelInPlayer}
          onCheckSingleChannel={checkSingleChannel}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <M3UExportModal
          channels={channels}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
