import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const uploadsDir = path.join(rootDir, 'uploads');
const distDir = path.join(rootDir, 'dist');

console.log('Cleaning temporary build and upload files...');

if (fs.existsSync(uploadsDir)) {
  const uploadFiles = fs.readdirSync(uploadsDir);
  for (const file of uploadFiles) {
    fs.rmSync(path.join(uploadsDir, file), { recursive: true, force: true });
  }
}

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

console.log('[OK] Clean complete.');
