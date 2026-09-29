import React from 'react';
import { Package, Terminal } from 'lucide-react';
import { CopyButton } from '../common/CopyButton';

export const DocsPackaging: React.FC = () => {
  const packagerCmd = `# Bento4 / Shaka Packager ClearKey Encryption Command
packager \\
  in=input.mp4,stream=video,init_segment=video_init.mp4,segment_template=video_$Number$.m4s \\
  in=input.mp4,stream=audio,init_segment=audio_init.mp4,segment_template=audio_$Number$.m4s \\
  --enable_raw_key_encryption \\
  --keys=label=:key_id=00112233445566778899aabbccddeeff:key=ffeeddccbbaa99887766554433221100 \\
  --protection_scheme=cenc \\
  --clear_lead=0 \\
  --generate_static_live_mpd \\
  --mpd_output=stream.mpd \\
  --hls_master_playlist_output=master.m3u8`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          📦 Packaging Pipeline (DASH & HLS)
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          DRM Labs automatically normalizes any container (MP4, MKV, WebM, MOV, TS) via FFmpeg into fragmented MP4 ISO BMFF segments and generates interoperable manifests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
          <h3 className="font-semibold text-white">🔒 Strict DRM (clear_lead=0)</h3>
          <p className="text-[11px] text-slate-400">
            Every video segment including the very first frame is encrypted. Playback will immediately fail if decryption keys are missing or rejected.
          </p>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
          <h3 className="font-semibold text-white">⚡ Standard DRM (clear_lead=6)</h3>
          <p className="text-[11px] text-slate-400">
            The first 6 seconds of media remain unencrypted, allowing immediate startup while the player obtains license credentials in the background.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>💻 Underlying Packager Command:</span>
          </span>
          <CopyButton text={packagerCmd} showText={true} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs" />
        </div>
        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {packagerCmd}
        </pre>
      </div>
    </div>
  );
};
