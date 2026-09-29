import fs from 'fs';
import path from 'path';
import https from 'https';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { StreamItem } from '../src/types';
import { computeKeyMetadata } from './key-utils';
import { STREAMS_DIR, UPLOADS_DIR, saveDatabase, loadDatabase } from './db';

const execFileAsync = promisify(execFile);

export interface PackagingOptions {
  streamFormat?: 'dash' | 'hls' | 'both';
  audioCodec?: 'aac' | 'aac_hq' | 'mp3' | 'passthrough' | 'none';
  clearLeadSeconds?: number;
  noDrm?: boolean;
}

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isArm = process.arch === 'arm64';

/**
 * Safely checks if a CLI command (e.g. ffmpeg, ffprobe) exists in system PATH
 * without throwing shell execution errors on Windows or Linux.
 */
function isCommandAvailable(cmd: string): boolean {
  try {
    if (isWin) {
      execSync(`where ${cmd}`, { stdio: 'ignore' });
    } else {
      execSync(`command -v ${cmd} || which ${cmd}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads a file using Node's native https client with redirect support.
 * Works uniformly on Windows, macOS, and Linux without curl or bash.
 */
function downloadBinaryFile(url: string, destPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        if (!res.headers.location) {
          return reject(new Error(`Redirect status ${res.statusCode} missing location header`));
        }
        return downloadBinaryFile(res.headers.location, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
      }

      const parentDir = path.dirname(destPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          if (!isWin) {
            try {
              fs.chmodSync(destPath, 0o755);
            } catch (chmodErr) {
              // Ignore chmod error if filesystem doesn't support it
            }
          }
          resolve(destPath);
        });
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Ensures the Shaka Packager binary exists and is executable across Windows, Mac, and Linux.
 */
export async function ensurePackagerBinary(): Promise<string> {
  const binDir = path.join(process.cwd(), 'bin');
  fs.mkdirSync(binDir, { recursive: true });

  // 1. Candidate paths to check in local bin/
  const candidateNames: string[] = [];
  if (isWin) {
    candidateNames.push('packager.exe', 'packager-win-x64.exe');
  } else if (isMac) {
    candidateNames.push(isArm ? 'packager-osx-arm64' : 'packager-osx-x64', 'packager');
  } else {
    candidateNames.push(isArm ? 'packager-linux-arm64' : 'packager-linux-x64', 'packager', 'packager-linux-x64');
  }

  for (const name of candidateNames) {
    const candidatePath = path.join(binDir, name);
    if (fs.existsSync(candidatePath)) {
      try {
        const stat = fs.statSync(candidatePath);
        if (stat.size > 500000) { // Valid binary is >500KB
          if (!isWin) {
            try {
              fs.chmodSync(candidatePath, 0o755);
            } catch {}
          }
          return candidatePath;
        }
      } catch {}
    }
  }

  // 2. Check if packager or shaka-packager is installed globally in system PATH
  if (isCommandAvailable('packager')) {
    return 'packager';
  }
  if (isCommandAvailable('shaka-packager')) {
    return 'shaka-packager';
  }

  // 3. Auto-download official Shaka Packager release binary for current OS
  const downloadTargetName = isWin ? 'packager.exe' : 'packager';
  const downloadTargetPath = path.join(binDir, downloadTargetName);

  const releaseTag = 'v3.4.0';
  let remoteFile = 'packager-linux-x64';
  if (isWin) {
    remoteFile = 'packager-win-x64.exe';
  } else if (isMac) {
    remoteFile = isArm ? 'packager-osx-arm64' : 'packager-osx-x64';
  } else if (isArm) {
    remoteFile = 'packager-linux-arm64';
  }

  const downloadUrl = `https://github.com/shaka-project/shaka-packager/releases/download/${releaseTag}/${remoteFile}`;

  console.log(`[Packager] Shaka Packager binary not found. Downloading for ${process.platform} (${process.arch})...`);
  console.log(`[Packager] Source: ${downloadUrl}`);

  try {
    await downloadBinaryFile(downloadUrl, downloadTargetPath);
    if (fs.existsSync(downloadTargetPath)) {
      console.log(`[Packager] Successfully downloaded binary: ${downloadTargetPath}`);
      return downloadTargetPath;
    }
  } catch (dlErr: any) {
    console.error(`[Packager] Download failed: ${dlErr.message}`);
  }

  throw new Error(
    `Shaka Packager binary is missing. Please place '${downloadTargetName}' inside the 'bin/' folder or ensure internet access.`
  );
}

/**
 * Shortens long filenames into clean readable stream titles
 */
export function formatAndShortenStreamName(filename: string, maxLength: number = 26): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  let cleaned = withoutExt
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    cleaned = 'Stream';
  }

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength).trim();
  }

  return cleaned;
}

/**
 * Sanitizes stream names into clean URL-safe folder identifiers
 */
export function sanitizeStreamName(inputName: string): string {
  const nameWithoutExt = inputName.replace(/\.[^/.]+$/, '');
  let cleaned = nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleaned || cleaned.length < 2) {
    cleaned = 'stream';
  }
  cleaned = cleaned.substring(0, 24);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleaned}-${randomNum}`;
}

/**
 * Encodes, transcode-normalizes (any video format like MP4, MKV, WebM, MOV, TS),
 * and packages into ClearKey DASH and/or HLS streams.
 */
export async function processAndEncryptVideo(
  inputFilePath: string,
  originalFilename: string,
  customKid?: string,
  customKey?: string,
  userStreamName?: string,
  options?: PackagingOptions
): Promise<StreamItem> {
  const chosenPrefix = userStreamName && userStreamName.trim().length > 0 ? userStreamName.trim() : originalFilename;
  const streamDisplayName = formatAndShortenStreamName(chosenPrefix, 26);
  const id = sanitizeStreamName(chosenPrefix);
  const streamOutputDir = path.join(STREAMS_DIR, id);
  fs.mkdirSync(streamOutputDir, { recursive: true });

  const defaultKid = '00112233445566778899aabbccddeeff';
  const defaultKey = 'ffeeddccbbaa99887766554433221100';

  const kidHex = customKid && customKid.trim().length === 32 ? customKid.trim() : defaultKid;
  const keyHex = customKey && customKey.trim().length === 32 ? customKey.trim() : defaultKey;
  const keys = computeKeyMetadata(kidHex, keyHex);

  const packagerBin = await ensurePackagerBinary();

  const streamFormat: 'dash' | 'hls' | 'both' = options?.streamFormat || 'dash';
  const requestedAudio: 'aac' | 'aac_hq' | 'mp3' | 'passthrough' | 'none' = options?.audioCodec || 'aac';
  const clearLead = options?.clearLeadSeconds !== undefined ? options.clearLeadSeconds : 0;
  const noDrm = Boolean(options?.noDrm);

  // Probe media codec with ffprobe if available
  let videoCodec = 'h264';
  let hasAudio = true; // Default to trying audio unless probed otherwise or requested 'none'
  const ffprobeAvailable = isCommandAvailable('ffprobe');

  if (ffprobeAvailable) {
    try {
      const probeOutput = execSync(
        `ffprobe -v error -show_entries stream=codec_type,codec_name,channels,sample_rate -of json "${inputFilePath}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const probeData = JSON.parse(probeOutput);
      const streams = probeData.streams || [];
      const vStream = streams.find((s: any) => s.codec_type === 'video');
      const aStream = streams.find((s: any) => s.codec_type === 'audio');
      if (vStream && vStream.codec_name) {
        videoCodec = vStream.codec_name.toLowerCase();
      }
      hasAudio = Boolean(aStream);
    } catch (probeErr: any) {
      console.log('[Media] ffprobe inspection skipped, proceeding with default codec config.');
    }
  } else {
    console.log('[Media] ffprobe not detected in PATH; using direct container stream detection.');
  }

  let effectiveHasAudio = hasAudio && requestedAudio !== 'none';
  let audioFfmpegArgs = '-c:a aac -b:a 128k -ar 44100 -ac 2';
  if (requestedAudio === 'none') {
    audioFfmpegArgs = '-an';
    effectiveHasAudio = false;
  } else if (requestedAudio === 'aac_hq') {
    audioFfmpegArgs = '-c:a aac -b:a 192k -ar 48000 -ac 2';
  } else if (requestedAudio === 'mp3') {
    audioFfmpegArgs = '-c:a libmp3lame -b:a 128k -ar 44100 -ac 2';
  } else if (requestedAudio === 'passthrough') {
    audioFfmpegArgs = '-c:a copy';
  }

  // Transcode and normalize any input format (MP4, MKV, MOV, WebM, TS, etc.) into fragmented MP4 if ffmpeg is available
  const normalizedFile = path.join(UPLOADS_DIR, `norm_${id}.mp4`);
  let mediaSourcePath = inputFilePath;
  const ffmpegAvailable = isCommandAvailable('ffmpeg');

  if (ffmpegAvailable) {
    try {
      if (effectiveHasAudio) {
        execSync(
          `ffmpeg -y -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -g 48 -keyint_min 48 -sc_threshold 0 ${audioFfmpegArgs} -movflags +faststart "${normalizedFile}"`,
          { stdio: ['pipe', 'pipe', 'pipe'] }
        );
      } else {
        execSync(
          `ffmpeg -y -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -g 48 -keyint_min 48 -sc_threshold 0 -an -movflags +faststart "${normalizedFile}"`,
          { stdio: ['pipe', 'pipe', 'pipe'] }
        );
      }

      if (fs.existsSync(normalizedFile) && fs.statSync(normalizedFile).size > 1000) {
        mediaSourcePath = normalizedFile;
        videoCodec = 'h264';
      }
    } catch (normErr: any) {
      console.warn('Media normalization fallback to raw file:', normErr.message);
    }
  } else {
    console.log('[Media] ffmpeg not in PATH; passing raw input file directly to Shaka Packager.');
  }

  const mpdOutput = path.join(streamOutputDir, 'stream.mpd');
  const hlsOutput = path.join(streamOutputDir, 'master.m3u8');
  const videoInit = path.join(streamOutputDir, 'video_init.mp4');
  const videoSegment = path.join(streamOutputDir, 'video_$Number$.m4s');
  const audioInit = path.join(streamOutputDir, 'audio_init.mp4');
  const audioSegment = path.join(streamOutputDir, 'audio_$Number$.m4s');

  const basePackagerArgs: string[] = [];

  if (!noDrm) {
    basePackagerArgs.push(
      '--enable_raw_key_encryption',
      `--keys=label=:key_id=${keys.kidHex}:key=${keys.keyHex}`,
      '--protection_scheme=cenc',
      `--clear_lead=${clearLead}`
    );
  }

  if (streamFormat === 'dash' || streamFormat === 'both') {
    basePackagerArgs.push('--generate_static_live_mpd', `--mpd_output=${mpdOutput}`);
  }
  if (streamFormat === 'hls' || streamFormat === 'both') {
    basePackagerArgs.push(`--hls_master_playlist_output=${hlsOutput}`);
  }

  let videoStreamArg = `in=${mediaSourcePath},stream=video,init_segment=${videoInit},segment_template=${videoSegment}`;
  if (streamFormat === 'hls' || streamFormat === 'both') {
    videoStreamArg += ',playlist_name=video.m3u8';
  }

  let audioStreamArg = `in=${mediaSourcePath},stream=audio,init_segment=${audioInit},segment_template=${audioSegment}`;
  if (streamFormat === 'hls' || streamFormat === 'both') {
    audioStreamArg += ',playlist_name=audio.m3u8,hls_name=ENGLISH,hls_group_id=audio';
  }

  if (effectiveHasAudio) {
    try {
      const fullArgs = [...basePackagerArgs, videoStreamArg, audioStreamArg];
      await execFileAsync(packagerBin, fullArgs);
    } catch (dualPackErr: any) {
      console.warn('Dual video+audio packaging encountered issue. Falling back to video-only:', dualPackErr.message);
      const videoOnlyArgs = [...basePackagerArgs, videoStreamArg];
      await execFileAsync(packagerBin, videoOnlyArgs);
      effectiveHasAudio = false;
    }
  } else {
    const videoOnlyArgs = [...basePackagerArgs, videoStreamArg];
    await execFileAsync(packagerBin, videoOnlyArgs);
  }

  // Clean up normalized temporary file
  if (fs.existsSync(normalizedFile)) {
    try {
      fs.unlinkSync(normalizedFile);
    } catch (e) {
      // Ignore temp cleanup error
    }
  }

  const generatedFiles = fs.readdirSync(streamOutputDir);
  const streamItem: StreamItem = {
    id,
    originalName: originalFilename,
    customName: streamDisplayName,
    videoCodec,
    hasAudio: effectiveHasAudio,
    createdAt: new Date().toISOString(),
    fileSizeBytes: fs.statSync(inputFilePath).size,
    mpdUrl: streamFormat === 'hls' ? '' : `/streams/${id}/stream.mpd`,
    hlsUrl: streamFormat === 'dash' ? '' : `/streams/${id}/master.m3u8`,
    licenseUrl: `/api/clearkey-license`,
    status: 'ready',
    keys,
    files: generatedFiles,
  };

  const streams = loadDatabase();
  streams.unshift(streamItem);
  saveDatabase(streams);

  return streamItem;
}
