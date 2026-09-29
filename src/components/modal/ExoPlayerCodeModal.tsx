import React, { useState } from 'react';
import { X, Code2 } from 'lucide-react';
import { StreamItem } from '../../types';
import { CopyButton } from '../common/CopyButton';

interface ExoPlayerCodeModalProps {
  stream: StreamItem | null;
  serverLanIp: string;
  onClose: () => void;
}

export const ExoPlayerCodeModal: React.FC<ExoPlayerCodeModalProps> = ({
  stream,
  serverLanIp,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'http' | 'hls' | 'hex' | 'data' | 'strict' | 'manifest'>('http');

  if (!stream) return null;

  const baseUrl = serverLanIp ? `http://${serverLanIp}:3000` : 'http://YOUR_PC_LAN_IP:3000';
  const fullMpdUrl = stream.mpdUrl ? `${baseUrl}${stream.mpdUrl}` : `${baseUrl}/streams/${stream.id}/stream.mpd`;
  const fullHlsUrl = stream.hlsUrl ? `${baseUrl}${stream.hlsUrl}` : `${baseUrl}/streams/${stream.id}/master.m3u8`;
  const fullLicenseUrl = `${baseUrl}/api/clearkey-license`;

  const tabs = [
    { id: 'http', label: 'HTTP License' },
    { id: 'hls', label: 'HLS ClearKey' },
    { id: 'hex', label: 'Local Hex' },
    { id: 'data', label: 'Data URI' },
    { id: 'strict', label: 'Strict DRM' },
    { id: 'manifest', label: 'Manifest' },
  ];

  let codeSnippet = '';

  if (activeTab === 'http') {
    codeSnippet = `// Android Media3 ExoPlayer (Java) - ClearKey DRM via HTTP License Server
import android.net.Uri;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;

ExoPlayer player = new ExoPlayer.Builder(context).build();

MediaItem.DrmConfiguration drmConfig = new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
    .setLicenseUri("${fullLicenseUrl}")
    .setMultiSession(true)
    .build();

MediaItem mediaItem = new MediaItem.Builder()
    .setUri("${fullMpdUrl}")
    .setMimeType(MimeTypes.APPLICATION_MPD)
    .setDrmConfiguration(drmConfig)
    .build();

player.setMediaItem(mediaItem);
player.prepare();
player.play();`;
  } else if (activeTab === 'hls') {
    codeSnippet = `// Android Media3 ExoPlayer (Java) - Apple HLS ClearKey Playback
import android.net.Uri;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;

ExoPlayer player = new ExoPlayer.Builder(context).build();

MediaItem.DrmConfiguration drmConfig = new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
    .setLicenseUri("${fullLicenseUrl}")
    .build();

MediaItem mediaItem = new MediaItem.Builder()
    .setUri("${fullHlsUrl}")
    .setMimeType(MimeTypes.APPLICATION_M3U8)
    .setDrmConfiguration(drmConfig)
    .build();

player.setMediaItem(mediaItem);
player.prepare();
player.play();`;
  } else if (activeTab === 'hex') {
    codeSnippet = `// Android Media3 ExoPlayer (Java) - Offline/Local ClearKey Hex Key
// KID: ${stream.keys.kidHex}
// KEY: ${stream.keys.keyHex}
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;

ExoPlayer player = new ExoPlayer.Builder(context).build();

// W3C ClearKey JSON response format string
String clearKeyJson = "{\\"keys\\":[{\\"kty\\":\\"oct\\",\\"k\\":\\"${stream.keys.keyBase64Url}\\",\\"kid\\":\\"${stream.keys.kidBase64Url}\\"}],\\"type\\":\\"temporary\\"}";
byte[] keyResponseBytes = clearKeyJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);

MediaItem.DrmConfiguration drmConfig = new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
    .setLicenseUri(android.net.Uri.parse("data:application/json;base64," + 
        android.util.Base64.encodeToString(keyResponseBytes, android.util.Base64.NO_WRAP)))
    .build();

MediaItem mediaItem = new MediaItem.Builder()
    .setUri("${fullMpdUrl}")
    .setMimeType(MimeTypes.APPLICATION_MPD)
    .setDrmConfiguration(drmConfig)
    .build();

player.setMediaItem(mediaItem);
player.prepare();
player.play();`;
  } else if (activeTab === 'data') {
    codeSnippet = `// Android Media3 ExoPlayer (Java) - Direct Data URI License
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;

ExoPlayer player = new ExoPlayer.Builder(context).build();

// Base64 encoded ClearKey JSON
String dataUri = "data:application/json;base64," + 
    android.util.Base64.encodeToString(
        "{\\"keys\\":[{\\"kty\\":\\"oct\\",\\"k\\":\\"${stream.keys.keyBase64Url}\\",\\"kid\\":\\"${stream.keys.kidBase64Url}\\"}],\\"type\\":\\"temporary\\"}".getBytes(),
        android.util.Base64.NO_WRAP
    );

MediaItem.DrmConfiguration drmConfig = new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
    .setLicenseUri(android.net.Uri.parse(dataUri))
    .build();

MediaItem mediaItem = new MediaItem.Builder()
    .setUri("${fullMpdUrl}")
    .setMimeType(MimeTypes.APPLICATION_MPD)
    .setDrmConfiguration(drmConfig)
    .build();

player.setMediaItem(mediaItem);
player.prepare();
player.play();`;
  } else if (activeTab === 'strict') {
    codeSnippet = `// Android Media3 ExoPlayer (Java) - Strict DRM Verification (clear_lead=0)
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.drm.DefaultDrmSessionManager;
import androidx.media3.exoplayer.drm.HttpMediaDrmCallback;
import androidx.media3.datasource.DefaultHttpDataSource;

DefaultHttpDataSource.Factory httpDataSourceFactory = new DefaultHttpDataSource.Factory()
    .setConnectTimeoutMs(8000)
    .setReadTimeoutMs(8000)
    .setAllowCrossProtocolRedirects(true);

HttpMediaDrmCallback drmCallback = new HttpMediaDrmCallback("${fullLicenseUrl}", httpDataSourceFactory);

DefaultDrmSessionManager drmSessionManager = new DefaultDrmSessionManager.Builder()
    .setUuidAndExoMediaDrmProvider(C.CLEARKEY_UUID, androidx.media3.exoplayer.drm.FrameworkMediaDrm.DEFAULT_PROVIDER)
    .setMultiSession(true)
    .build(drmCallback);

ExoPlayer player = new ExoPlayer.Builder(context).build();

MediaItem mediaItem = new MediaItem.Builder()
    .setUri("${fullMpdUrl}")
    .setMimeType(MimeTypes.APPLICATION_MPD)
    .build();

player.setMediaItem(mediaItem);
player.prepare();
player.play();`;
  } else if (activeTab === 'manifest') {
    codeSnippet = `<!-- AndroidManifest.xml Configuration -->
<!-- Required for local network testing and HTTP cleartext streaming -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.drmlabs">

    <!-- Internet & Network State Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/Theme.DrmLabs"
        <!-- Allows HTTP cleartext traffic for local LAN IP streaming -->
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Android Media3 ExoPlayer Integration</h3>
              <p className="text-[11px] text-slate-400">{stream.customName || stream.originalName} ({stream.id})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 pt-3 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Android Media3 1.2+ Java:</span>
            <CopyButton text={codeSnippet} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 text-xs font-medium" />
          </div>
          <pre className="p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            {codeSnippet}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="text-center sm:text-left">Target Platform: Android Media3 ExoPlayer (Java + XML)</span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
