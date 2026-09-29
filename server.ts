import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  getAllStreams,
  getStreamById,
  deleteStream,
  processAndEncryptVideo,
  ensureDefaultSampleStream,
  UPLOADS_DIR,
} from './server/stream-service';
import { handleClearKeyLicenseRequest } from './server/license-service';
import {
  getAllDrmLogs,
  clearAllDrmLogs,
  getDrmLogById,
  addSseClient,
  removeSseClient,
} from './server/drm-logger';
import { handleStreamProxy, handleCheckChannel, handleFetchPlaylistFromUrl } from './server/m3u-service';

async function startServer() {
  const app = express();
  const PORT = 3000;

  const upload = multer({
    dest: UPLOADS_DIR,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  });

  // CORS Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Parse JSON bodies, except multipart uploads
  app.use((req, res, next) => {
    if (req.is('multipart/*')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, next);
  });

  const rawLicenseParser = express.raw({ type: '*/*', limit: '2mb' });

  // 1. Network Info (LAN IP for testing on Android devices)
  app.get('/api/network-info', (req, res) => {
    const interfaces = os.networkInterfaces();
    let primaryIp = '';

    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (netList) {
        for (const net of netList) {
          if (net.family === 'IPv4' && !net.internal) {
            if (
              net.address.startsWith('192.168.') ||
              net.address.startsWith('10.') ||
              net.address.startsWith('172.')
            ) {
              primaryIp = net.address;
              break;
            } else if (!primaryIp) {
              primaryIp = net.address;
            }
          }
        }
      }
      if (primaryIp && (primaryIp.startsWith('192.168.') || primaryIp.startsWith('10.'))) {
        break;
      }
    }

    res.json({
      ip: primaryIp || '127.0.0.1',
      port: PORT,
    });
  });

  // 2. Streams APIs
  app.get('/api/streams', (req, res) => {
    const streams = getAllStreams();
    res.json(
      streams.map((s) => ({
        ...s,
        licenseUrl: s.licenseUrl || `/api/clearkey-license/${s.id}`,
      }))
    );
  });

  app.get('/api/streams/:id', (req, res) => {
    const stream = getStreamById(req.params.id);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    res.json({
      ...stream,
      licenseUrl: stream.licenseUrl || `/api/clearkey-license/${stream.id}`,
    });
  });

  // 3. ClearKey License Handlers
  app.all('/api/clearkey-license/:id', rawLicenseParser, (req, res) => {
    handleClearKeyLicenseRequest(req.params.id, req, res);
  });

  app.all('/api/clearkey-license', rawLicenseParser, (req, res) => {
    handleClearKeyLicenseRequest(null, req, res);
  });

  // 3b. DRM Request Inspector & Replay API
  app.get('/api/drm/logs', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    res.json({ logs: getAllDrmLogs(limit) });
  });

  app.delete('/api/drm/logs', (req, res) => {
    clearAllDrmLogs();
    res.json({ success: true, message: 'All DRM request logs cleared' });
  });

  // Real-time Server-Sent Events (SSE) Stream
  app.get('/api/drm/logs/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    res.write(': connected\n\n');
    addSseClient(res);

    req.on('close', () => {
      removeSseClient(res);
    });
  });

  app.get('/api/drm/logs/:id', (req, res) => {
    const log = getDrmLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'DRM log not found' });
    }
    res.json({ log });
  });

  // 4. Universal Stream Proxy & M3U Channel Health Check & Remote Playlist Fetch
  app.all('/api/stream-proxy', handleStreamProxy);
  app.post('/api/m3u/check-channel', handleCheckChannel);
  app.all('/api/m3u/fetch-playlist', handleFetchPlaylistFromUrl);

  // 5. Upload & Encrypt Video (Supports MP4, MKV, WebM, MOV, TS, etc.)
  app.post('/api/streams/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const { kid, key, streamName, streamFormat, audioCodec, clearLeadSeconds, noDrm } = req.body;

    try {
      const streamItem = await processAndEncryptVideo(inputPath, originalName, kid, key, streamName, {
        streamFormat: streamFormat as any,
        audioCodec: audioCodec as any,
        clearLeadSeconds: clearLeadSeconds ? parseInt(clearLeadSeconds, 10) : 0,
        noDrm: noDrm === 'true' || noDrm === true,
      });

      if (fs.existsSync(inputPath)) {
        try {
          fs.unlinkSync(inputPath);
        } catch (e) {}
      }

      res.status(201).json({
        success: true,
        stream: streamItem,
      });
    } catch (err: any) {
      if (fs.existsSync(inputPath)) {
        try {
          fs.unlinkSync(inputPath);
        } catch (e) {}
      }
      res.status(500).json({
        error: 'Failed to package video stream',
        details: err?.message || String(err),
      });
    }
  });

  // 6. Delete Stream
  app.delete('/api/streams/:id', (req, res) => {
    const success = deleteStream(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    res.json({ success: true, message: 'Stream deleted successfully' });
  });

  // Serve static assets from public/
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Bootstrap initial sample stream
  ensureDefaultSampleStream().catch((e) => console.warn('Sample stream bootstrap warning:', e));

  // Vite middleware in dev or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DRM Labs server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
