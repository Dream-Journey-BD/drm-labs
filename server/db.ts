import fs from 'fs';
import path from 'path';
import { StreamItem } from '../src/types';

export const DB_FILE = path.join(process.cwd(), 'db', 'database.json');
export const STREAMS_DIR = path.join(process.cwd(), 'public', 'streams');
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure base directories exist
for (const dir of [path.dirname(DB_FILE), STREAMS_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Loads all stream records from database.json
 */
export function loadDatabase(): StreamItem[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read database file:', err);
  }
  return [];
}

/**
 * Writes stream records to database.json
 */
export function saveDatabase(streams: StreamItem[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(streams, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

/**
 * Retrieves all stream records
 */
export function getAllStreams(): StreamItem[] {
  return loadDatabase();
}

/**
 * Retrieves a single stream by ID
 */
export function getStreamById(id: string): StreamItem | undefined {
  const streams = loadDatabase();
  return streams.find((s) => s.id === id);
}

/**
 * Deletes a stream record and its output folder
 */
export function deleteStream(id: string): boolean {
  const streams = loadDatabase();
  const index = streams.findIndex((s) => s.id === id);
  if (index === -1) {
    return false;
  }

  const stream = streams[index];
  streams.splice(index, 1);
  saveDatabase(streams);

  // Remove files from public/streams/{id}
  const streamDir = path.join(STREAMS_DIR, stream.id);
  if (fs.existsSync(streamDir)) {
    try {
      fs.rmSync(streamDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Could not completely remove stream folder:', e);
    }
  }

  return true;
}
