/**
 * Cross-platform Shaka Packager downloader for Node.js
 * Works on Windows, macOS, and Linux without bash or curl.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binDir = path.join(rootDir, 'bin');

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

const binaryName = isWin ? 'packager.exe' : 'packager';
const targetPath = path.join(binDir, binaryName);

function getDownloadUrl() {
  const version = 'v3.4.0';
  const base = `https://github.com/shaka-project/shaka-packager/releases/download/${version}`;
  if (isWin) {
    return `${base}/packager-win-x64.exe`;
  } else if (isMac) {
    return `${base}/packager-osx-x64`;
  } else {
    return `${base}/packager-linux-x64`;
  }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects (GitHub releases redirect to AWS S3)
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        if (!response.headers.location) {
          return reject(new Error(`Redirect status ${response.statusCode} without location header`));
        }
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Download failed with HTTP status: ${response.statusCode}`));
      }

      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          if (!isWin) {
            fs.chmodSync(destPath, 0o755);
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

export async function ensurePackager() {
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.size > 1000000) { // Valid binary is ~30MB-50MB
      return targetPath;
    }
  }

  console.log(`Downloading Shaka Packager for ${process.platform} (${targetPath})...`);
  const url = getDownloadUrl();
  console.log(`Source URL: ${url}`);
  
  await downloadFile(url, targetPath);
  console.log(`[OK] Shaka Packager downloaded successfully to: ${targetPath}`);
  return targetPath;
}

// If run directly: `node scripts/download-packager.js`
if (process.argv[1] === __filename) {
  ensurePackager()
    .then((p) => {
      console.log(`Ready: ${p}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Download error:', err.message);
      process.exit(1);
    });
}
