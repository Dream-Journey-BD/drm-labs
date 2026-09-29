import React from 'react';
import { Smartphone, Code2 } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsAndroidExoPlayer: React.FC = () => {
  const javaCode = `// MainActivity.java - Media3 ExoPlayer with ClearKey DRM
package com.example.drmlabs;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;

public class MainActivity extends AppCompatActivity {
    private ExoPlayer player;
    private PlayerView playerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        playerView = findViewById(R.id.player_view);
        player = new ExoPlayer.Builder(this).build();
        playerView.setPlayer(player);

        // ClearKey DRM Configuration
        MediaItem.DrmConfiguration drmConfig = new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
            .setLicenseUri("http://192.168.1.100:3000/api/clearkey-license/sample-stream")
            .setMultiSession(true)
            .build();

        MediaItem mediaItem = new MediaItem.Builder()
            .setUri("http://192.168.1.100:3000/streams/sample-stream/stream.mpd")
            .setMimeType(MimeTypes.APPLICATION_MPD)
            .setDrmConfiguration(drmConfig)
            .build();

        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (player != null) {
            player.release();
        }
    }
}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          📱 Android Media3 ExoPlayer Implementation
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Media3 ExoPlayer provides out-of-the-box hardware-accelerated playback for ClearKey DRM using Java.
        </p>
      </div>

      <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1">
        <div className="font-semibold text-white">⚠️ Crucial for Local Network Testing:</div>
        <p className="text-[11px] text-amber-300/90 leading-relaxed">
          Android 9.0+ (API 28+) blocks unencrypted HTTP traffic by default. Make sure to add <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-white">android:usesCleartextTraffic="true"</code> to your <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-white">&lt;application&gt;</code> tag in AndroidManifest.xml.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>💻 Complete Java Implementation:</span>
          </span>
          <CopyButton text={javaCode} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs" />
        </div>
        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {javaCode}
        </pre>
      </div>
    </div>
  );
};
