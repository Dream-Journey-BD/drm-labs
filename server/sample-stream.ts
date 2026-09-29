import fs from 'fs';
import path from 'path';
import https from 'https';
import { loadDatabase, saveDatabase, STREAMS_DIR } from './db';
import { processAndEncryptVideo } from './packager';

/**
 * Downloads a reliable test video if needed
 */
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        if (response.headers.location) {
          downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Bootstraps an initial ClearKey DASH+HLS stream on first run if DB is empty
 */
export async function ensureDefaultSampleStream(): Promise<void> {
  const streams = loadDatabase();
  if (streams.length > 0) {
    const first = streams[0];
    const streamDir = path.join(STREAMS_DIR, first.id);
    if (fs.existsSync(streamDir)) {
      return;
    }
  }

  const sampleTemp = path.join(process.cwd(), 'uploads', 'sample-audio-video-test.mp4');
  try {
    const sampleUrl = 'https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4';
    await downloadFile(sampleUrl, sampleTemp);

    if (fs.existsSync(sampleTemp) && fs.statSync(sampleTemp).size > 1000) {
      await processAndEncryptVideo(
        sampleTemp,
        'sample-audio-video-test.mp4',
        '00112233445566778899aabbccddeeff',
        'ffeeddccbbaa99887766554433221100',
        'Sample DRM Stream (With Audio)',
        { streamFormat: 'both', audioCodec: 'aac', clearLeadSeconds: 0 }
      );
    }
  } catch (err) {
    console.warn('Could not bootstrap default sample stream:', err);
  } finally {
    if (fs.existsSync(sampleTemp)) {
      try {
        fs.unlinkSync(sampleTemp);
      } catch (e) {}
    }
  }
}
