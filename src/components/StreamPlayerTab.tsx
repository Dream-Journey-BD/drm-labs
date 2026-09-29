import React, { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import { Shield, Globe, Terminal, Activity } from 'lucide-react';
import { StreamUrlBar } from './player/StreamUrlBar';
import { PlayerControls } from './player/PlayerControls';
import { DrmConfigPanel } from './player/DrmConfigPanel';
import { HeadersConfigPanel, CustomHeaderItem } from './player/HeadersConfigPanel';
import { PlayerLogsPanel, LogEntry } from './player/PlayerLogsPanel';
import { PlayerStatsPanel } from './player/PlayerStatsPanel';

export interface ExternalPlayRequest {
  url: string;
  format?: string;
  drm?: {
    type?: string;
    kidHex?: string;
    keyHex?: string;
    licenseUrl?: string;
  };
  headers?: Record<string, string>;
  title?: string;
}

interface StreamPlayerTabProps {
  externalPlayRequest?: ExternalPlayRequest | null;
  serverLanIp?: string;
}

export const StreamPlayerTab: React.FC<StreamPlayerTabProps> = ({ externalPlayRequest, serverLanIp }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [format, setFormat] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Track selections
  const [videoTracks, setVideoTracks] = useState<any[]>([]);
  const [selectedVideoTrackId, setSelectedVideoTrackId] = useState<any>('auto');
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<any>('auto');
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [selectedTextTrackId, setSelectedTextTrackId] = useState<any>('off');

  // DRM configuration
  const [drmType, setDrmType] = useState('clearkey');
  const [kidHex, setKidHex] = useState('');
  const [keyHex, setKeyHex] = useState('');
  const [licenseServerUrl, setLicenseServerUrl] = useState('');

  // Custom Headers & Proxy
  const [useProxy, setUseProxy] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [customHeaders, setCustomHeaders] = useState<CustomHeaderItem[]>([]);

  // Diagnostic tabs & telemetry
  const [activeBottomTab, setActiveBottomTab] = useState<'drm' | 'headers' | 'logs' | 'stats'>('drm');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>({});

  const addLog = (level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 100));
  };

  // Initialize Shaka Player
  useEffect(() => {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      addLog('error', 'Browser does not support Shaka Player / MSE');
      return;
    }

    if (!videoRef.current) return;
    const player = new shaka.Player(videoRef.current);
    playerRef.current = player;

    player.addEventListener('error', (event: any) => {
      const err = event.detail;
      addLog('error', `Playback error code: ${err?.code} (${err?.message || 'unknown'})`);
    });

    player.addEventListener('buffering', (event: any) => {
      if (event.buffering) addLog('info', 'Buffering content...');
    });

    player.addEventListener('trackschanged', () => {
      if (!playerRef.current) return;
      const vTracks = playerRef.current.getVariantTracks();
      const tTracks = playerRef.current.getTextTracks();

      // Deduplicate video tracks by height
      const uniqueVideo = vTracks.filter((t, i, arr) => arr.findIndex((x) => x.height === t.height) === i);
      setVideoTracks(uniqueVideo);

      // Unique audio languages
      const uniqueAudio = vTracks.filter((t, i, arr) => arr.findIndex((x) => x.language === t.language) === i);
      setAudioTracks(uniqueAudio);
      setTextTracks(tTracks);
    });

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  // Update playback stats periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!playerRef.current || !videoRef.current) return;
      const shakaStats = playerRef.current.getStats();
      setStats({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
        streamBandwidth: shakaStats.streamBandwidth,
        estimatedBandwidth: shakaStats.estimatedBandwidth,
        droppedFrames: shakaStats.droppedFrames,
        decodedFrames: shakaStats.decodedFrames,
        manifestType: shakaStats.manifestType,
      });

      // Update buffer
      const buf = videoRef.current.buffered;
      if (buf.length > 0) {
        setBufferedEnd(buf.end(buf.length - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle external play requests (from streams list or M3U playlist)
  useEffect(() => {
    if (!externalPlayRequest || !externalPlayRequest.url) return;
    setStreamUrl(externalPlayRequest.url);
    if (externalPlayRequest.format) setFormat(externalPlayRequest.format);
    if (externalPlayRequest.drm?.kidHex) setKidHex(externalPlayRequest.drm.kidHex);
    if (externalPlayRequest.drm?.keyHex) setKeyHex(externalPlayRequest.drm.keyHex);
    if (externalPlayRequest.drm?.licenseUrl) setLicenseServerUrl(externalPlayRequest.drm.licenseUrl);
    if (externalPlayRequest.drm?.type) setDrmType(externalPlayRequest.drm.type);
    if (externalPlayRequest.headers) {
      const incomingHeaders: CustomHeaderItem[] = [];
      Object.entries(externalPlayRequest.headers).forEach(([k, v]) => {
        const valStr = typeof v === 'string' ? v : String(v || '');
        if (k.toLowerCase() === 'user-agent') {
          setUserAgent(valStr);
        } else {
          incomingHeaders.push({
            id: Math.random().toString(36).substring(2, 9),
            key: k,
            value: valStr,
            enabled: true,
          });
        }
      });
      if (incomingHeaders.length > 0) {
        setCustomHeaders(incomingHeaders);
      }
    }

    addLog('info', `External stream request received: ${externalPlayRequest.title || externalPlayRequest.url}`);
    setTimeout(() => {
      loadAndPlayStream(externalPlayRequest.url);
    }, 100);
  }, [externalPlayRequest]);

  // Load stream into player
  const loadAndPlayStream = async (targetUrl = streamUrl) => {
    if (!playerRef.current || !targetUrl.trim()) return;
    setIsLoading(true);
    addLog('info', `Initiating playback: ${targetUrl}`);

    try {
      let finalUrl = targetUrl;
      if (useProxy) {
        finalUrl = `/api/stream-proxy?url=${encodeURIComponent(targetUrl)}`;
        addLog('info', 'Routing stream through universal backend proxy');
      }

      // Configure DRM
      const drmConfig: any = {};
      if (drmType === 'clearkey') {
        if (kidHex.trim() && keyHex.trim()) {
          drmConfig.clearKeys = {
            [kidHex.trim()]: keyHex.trim(),
          };
          addLog('info', `ClearKey DRM configured with KID: ${kidHex.slice(0, 8)}...`);
        }
        if (licenseServerUrl.trim()) {
          drmConfig.servers = {
            'org.w3.clearkey': licenseServerUrl.trim(),
          };
        }
      } else if (drmType === 'widevine' && licenseServerUrl.trim()) {
        drmConfig.servers = { 'com.widevine.alpha': licenseServerUrl.trim() };
      } else if (drmType === 'playready' && licenseServerUrl.trim()) {
        drmConfig.servers = { 'com.microsoft.playready': licenseServerUrl.trim() };
      }

      playerRef.current.configure({
        drm: drmConfig,
        streaming: {
          bufferingGoal: 10,
          rebufferingGoal: 2,
        },
      });

      // Attach request filters for custom headers
      playerRef.current.getNetworkingEngine()?.clearAllRequestFilters();
      playerRef.current.getNetworkingEngine()?.registerRequestFilter((type, request) => {
        if (userAgent) {
          request.headers['User-Agent'] = userAgent;
          if (useProxy) {
            request.headers['x-proxy-user-agent'] = userAgent;
          }
        }

        customHeaders
          .filter((h) => h.enabled && h.key.trim())
          .forEach((h) => {
            const k = h.key.trim();
            const v = h.value.trim();
            request.headers[k] = v;

            if (useProxy) {
              const lower = k.toLowerCase();
              if (lower === 'user-agent') request.headers['x-proxy-user-agent'] = v;
              else if (lower === 'referer') request.headers['x-proxy-referer'] = v;
              else if (lower === 'origin') request.headers['x-proxy-origin'] = v;
              else if (lower === 'cookie') request.headers['x-proxy-cookie'] = v;
              else if (lower === 'authorization') request.headers['x-proxy-authorization'] = v;
              else request.headers[`x-proxy-hdr-${lower}`] = v;
            }
          });
      });

      // Determine MIME type
      let mimeType: string | undefined = undefined;
      const lower = targetUrl.toLowerCase();
      if (format === 'hls' || lower.endsWith('.m3u8')) mimeType = 'application/x-mpegurl';
      else if (format === 'dash' || lower.endsWith('.mpd')) mimeType = 'application/dash+xml';
      else if (format === 'mp4' || lower.endsWith('.mp4')) mimeType = 'video/mp4';
      else if (format === 'webm' || lower.endsWith('.webm')) mimeType = 'video/webm';

      await playerRef.current.load(finalUrl, undefined, mimeType);
      addLog('success', 'Stream loaded successfully into player engine');

      if (videoRef.current) {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      addLog('error', `Failed to load stream: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (vol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSelectVideoTrack = (trackId: any) => {
    if (!playerRef.current) return;
    setSelectedVideoTrackId(trackId);
    if (trackId === 'auto') {
      playerRef.current.configure({ abr: { enabled: true } });
    } else {
      playerRef.current.configure({ abr: { enabled: false } });
      const tracks = playerRef.current.getVariantTracks();
      const chosen = tracks.find((t) => t.id === parseInt(trackId, 10));
      if (chosen) playerRef.current.selectVariantTrack(chosen, true);
    }
  };

  const handleSelectAudioTrack = (trackId: any) => {
    if (!playerRef.current) return;
    setSelectedAudioTrackId(trackId);
    const tracks = playerRef.current.getVariantTracks();
    const chosen = tracks.find((t) => t.id === parseInt(trackId, 10));
    if (chosen) playerRef.current.selectAudioLanguage(chosen.language);
  };

  const handleSelectTextTrack = (trackId: any) => {
    if (!playerRef.current) return;
    setSelectedTextTrackId(trackId);
    if (trackId === 'off') {
      playerRef.current.setTextTrackVisibility(false);
    } else {
      playerRef.current.setTextTrackVisibility(true);
      const tracks = playerRef.current.getTextTracks();
      const chosen = tracks.find((t) => t.id === parseInt(trackId, 10));
      if (chosen) playerRef.current.selectTextTrack(chosen);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleToggleAspectRatio = () => {
    const ratios = ['16:9', '4:3', '21:9', 'fill'];
    const nextIdx = (ratios.indexOf(aspectRatio) + 1) % ratios.length;
    setAspectRatio(ratios[nextIdx]);
  };

  const handleTogglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        if (videoRef.current.readyState === 0) {
          addLog('warn', 'Please load and play a video first before enabling Picture-in-Picture.');
          return;
        }
        await videoRef.current.requestPictureInPicture();
      } else {
        addLog('warn', 'Picture-in-Picture is not supported by your browser or iframe policy.');
      }
    } catch (err: any) {
      addLog('warn', `Picture-in-Picture: ${err?.message || 'Could not enter PiP mode'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Video Player Container (At top so user can see playback directly) */}
      <div
        ref={containerRef}
        className="relative group bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center min-h-[300px] sm:min-h-[440px]"
      >
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${
            aspectRatio === 'fill'
              ? 'object-fill'
              : aspectRatio === '4:3'
              ? 'aspect-[4/3]'
              : aspectRatio === '21:9'
              ? 'aspect-[21/9]'
              : 'aspect-video'
          }`}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
              setIsLive(videoRef.current.duration === Infinity);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Video Overlay Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          onSeek={handleSeek}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          isLive={isLive}
          videoTracks={videoTracks}
          selectedVideoTrackId={selectedVideoTrackId}
          onSelectVideoTrack={handleSelectVideoTrack}
          audioTracks={audioTracks}
          selectedAudioTrackId={selectedAudioTrackId}
          onSelectAudioTrack={handleSelectAudioTrack}
          textTracks={textTracks}
          selectedTextTrackId={selectedTextTrackId}
          onSelectTextTrack={handleSelectTextTrack}
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRateChange}
          aspectRatio={aspectRatio}
          onToggleAspectRatio={handleToggleAspectRatio}
          onTogglePip={handleTogglePip}
        />
      </div>

      {/* 2. Stream URL and Format input bar (Below the Video as originally positioned) */}
      <StreamUrlBar
        streamUrl={streamUrl}
        onStreamUrlChange={setStreamUrl}
        format={format}
        onFormatChange={setFormat}
        isLoading={isLoading}
        onLoadAndPlay={() => loadAndPlayStream()}
        onClear={() => {
          setStreamUrl('');
          setKidHex('');
          setKeyHex('');
          setLicenseServerUrl('');
          if (playerRef.current) {
            playerRef.current.unload();
          }
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
          }
          setIsPlaying(false);
          addLog('info', 'Cleared player stream URL and DRM configuration');
        }}
      />

      {/* Diagnostics Sub-Tabs - Mobile horizontally scrollable without cutting off */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => setActiveBottomTab('drm')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'drm'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>DRM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('headers')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'headers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Headers</span>
            {(customHeaders.filter((h) => h.enabled && h.key.trim()).length > 0 || userAgent || useProxy) && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('logs')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('stats')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeBottomTab === 'drm' && (
          <DrmConfigPanel
            drmType={drmType}
            onDrmTypeChange={setDrmType}
            kidHex={kidHex}
            onKidHexChange={setKidHex}
            keyHex={keyHex}
            onKeyHexChange={setKeyHex}
            licenseServerUrl={licenseServerUrl}
            onLicenseServerUrlChange={setLicenseServerUrl}
            onResetDefaultDrm={() => {
              setKidHex('00112233445566778899aabbccddeeff');
              setKeyHex('ffeeddccbbaa99887766554433221100');
            }}
            onClearDrm={() => {
              setKidHex('');
              setKeyHex('');
              setLicenseServerUrl('');
            }}
          />
        )}

        {activeBottomTab === 'headers' && (
          <HeadersConfigPanel
            useProxy={useProxy}
            onToggleProxy={() => setUseProxy(!useProxy)}
            userAgent={userAgent}
            onUserAgentChange={setUserAgent}
            customHeaders={customHeaders}
            onCustomHeadersChange={setCustomHeaders}
            onResetHeaders={() => {
              setUserAgent('');
              setCustomHeaders([]);
              setUseProxy(false);
            }}
          />
        )}

        {activeBottomTab === 'logs' && (
          <PlayerLogsPanel logs={logs} onClearLogs={() => setLogs([])} />
        )}

        {activeBottomTab === 'stats' && <PlayerStatsPanel stats={stats} />}
      </div>
    </div>
  );
};
