/**
 * Stream Service module facade
 * Consolidates database, packaging, key utilities, and sample bootstrap
 */
export { computeKeyMetadata, generateRandomHex } from './key-utils';
export {
  loadDatabase,
  saveDatabase,
  getAllStreams,
  getStreamById,
  deleteStream,
  DB_FILE,
  STREAMS_DIR,
  UPLOADS_DIR,
} from './db';
export {
  processAndEncryptVideo,
  ensurePackagerBinary,
  formatAndShortenStreamName,
  sanitizeStreamName,
  type PackagingOptions,
} from './packager';
export { ensureDefaultSampleStream } from './sample-stream';
