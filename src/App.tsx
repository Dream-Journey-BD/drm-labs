import React, { useEffect, useState } from 'react';
import { StreamItem } from './types';
import { Header } from './components/layout/Header';
import { Navbar, AppView } from './components/layout/Navbar';
import { VideoUploadCard } from './components/streams/VideoUploadCard';
import { StreamsList } from './components/streams/StreamsList';
import { StreamDetailsCard } from './components/streams/StreamDetailsCard';
import { ExoPlayerCodeModal } from './components/modal/ExoPlayerCodeModal';
import { StreamPlayerTab, ExternalPlayRequest } from './components/StreamPlayerTab';
import { M3UPlaylistTab } from './components/M3UPlaylistTab';
import { DocsTab } from './components/docs/DocsTab';
import { DrmInspectorTab } from './components/drm/DrmInspectorTab';
import { M3UChannel } from './components/m3u/M3UParser';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('streams');
  const [streams, setStreams] = useState<StreamItem[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [serverLanIp, setServerLanIp] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [codeModalStream, setCodeModalStream] = useState<StreamItem | null>(null);
  const [externalPlayRequest, setExternalPlayRequest] = useState<ExternalPlayRequest | null>(null);

  const fetchStreams = async () => {
    try {
      const res = await fetch('/api/streams');
      const data = await res.json();
      setStreams(data);
      if (data.length > 0 && !selectedStreamId) {
        setSelectedStreamId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch streams:', err);
    }
  };

  const fetchNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network-info');
      const data = await res.json();
      if (data.ip) {
        setServerLanIp(data.ip);
      }
    } catch (err) {
      console.warn('Could not detect LAN IP:', err);
    }
  };

  useEffect(() => {
    fetchStreams();
    fetchNetworkInfo();
  }, []);

  const generateRandomHex = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUploadSubmit = async (formData: FormData) => {
    setUploading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/streams/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }
      await fetchStreams();
      if (data.stream) {
        setSelectedStreamId(data.stream.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading and packaging video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStream = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/streams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStreams((prev) => prev.filter((s) => s.id !== id));
        if (selectedStreamId === id) {
          const remaining = streams.filter((s) => s.id !== id);
          setSelectedStreamId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error('Failed to delete stream:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayStreamInPlayer = (stream: StreamItem) => {
    const baseUrl = serverLanIp ? `http://${serverLanIp}:3000` : window.location.origin;
    const targetUrl = stream.mpdUrl
      ? `${baseUrl}${stream.mpdUrl}`
      : `${baseUrl}${stream.hlsUrl}`;

    setExternalPlayRequest({
      url: targetUrl,
      format: stream.mpdUrl ? 'dash' : 'hls',
      drm: {
        type: 'clearkey',
        kidHex: stream.keys.kidHex,
        keyHex: stream.keys.keyHex,
        licenseUrl: `${baseUrl}${stream.licenseUrl || `/api/clearkey-license/${stream.id}`}`,
      },
      title: stream.customName || stream.originalName,
    });
    setCurrentView('player');
  };

  const handlePlayChannelInPlayer = (channel: M3UChannel) => {
    setExternalPlayRequest({
      url: channel.url,
      format: channel.url.includes('.m3u8') ? 'hls' : channel.url.includes('.mpd') ? 'dash' : 'auto',
      drm: channel.drm
        ? {
            type: channel.drm.type || 'clearkey',
            kidHex: channel.drm.kidHex,
            keyHex: channel.drm.keyHex,
            licenseUrl: channel.drm.licenseUrl,
          }
        : undefined,
      headers: channel.headers,
      title: channel.name,
    });
    setCurrentView('player');
  };

  const selectedStream = streams.find((s) => s.id === selectedStreamId) || streams[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        serverLanIp={serverLanIp}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Navigation Bar */}
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'streams' && (
          <div className="space-y-5">
            {/* Upload Video Card */}
            <VideoUploadCard
              uploading={uploading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
              onSubmit={handleUploadSubmit}
              generateRandomHex={generateRandomHex}
            />

            {/* Streams List & Selected Stream Details */}
            {streams.length > 0 && (
              <div className="space-y-4">
                <StreamsList
                  streams={streams}
                  selectedStreamId={selectedStreamId}
                  onSelectStream={setSelectedStreamId}
                  onOpenCodeModal={setCodeModalStream}
                  onPlayInPlayer={handlePlayStreamInPlayer}
                  onDeleteStream={handleDeleteStream}
                  deletingStreamId={selectedStreamId}
                  isDeleting={isDeleting}
                />

                {selectedStream && (
                  <StreamDetailsCard
                    stream={selectedStream}
                    serverLanIp={serverLanIp}
                    onPlayInPlayer={handlePlayStreamInPlayer}
                    onOpenCodeModal={setCodeModalStream}
                    onDeleteStream={handleDeleteStream}
                    isDeleting={isDeleting}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'player' && (
          <StreamPlayerTab
            externalPlayRequest={externalPlayRequest}
            serverLanIp={serverLanIp}
          />
        )}

        {currentView === 'playlist' && (
          <M3UPlaylistTab onPlayChannelInPlayer={handlePlayChannelInPlayer} />
        )}

        {currentView === 'inspector' && (
          <DrmInspectorTab streams={streams} serverLanIp={serverLanIp} />
        )}

        {currentView === 'docs' && <DocsTab />}
      </main>

      {/* Android Media3 ExoPlayer Code Modal */}
      {codeModalStream && (
        <ExoPlayerCodeModal
          stream={codeModalStream}
          serverLanIp={serverLanIp}
          onClose={() => setCodeModalStream(null)}
        />
      )}
    </div>
  );
}

export default App;
