import type { Response } from 'express';

export interface DrmRequestLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  method: string;
  url: string;
  clientIp: string;
  userAgent: string;
  clientCategory: 'Android ExoPlayer' | 'Shaka Player' | 'Web Browser' | 'API Tool / cURL' | 'Other';
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
  extractedKids: string[];
  matchedStreamId: string | null;
  matchedStreamName: string | null;
  status: number;
  durationMs: number;
  responseBody: any;
  curlCommand: string;
}

// In-memory circular buffer (keeps last 100 requests)
const MAX_LOGS = 100;
const logs: DrmRequestLog[] = [];

// Real-time SSE subscriber connections
const sseClients: Set<Response> = new Set();

export function addSseClient(res: Response): void {
  sseClients.add(res);
}

export function removeSseClient(res: Response): void {
  sseClients.delete(res);
}

export function broadcastDrmLog(log: DrmRequestLog): void {
  const payload = `data: ${JSON.stringify(log)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

export function recordDrmLog(log: DrmRequestLog): DrmRequestLog {
  logs.unshift(log);
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
  broadcastDrmLog(log);
  return log;
}

export function getAllDrmLogs(limit = 50): DrmRequestLog[] {
  return logs.slice(0, Math.min(limit, logs.length));
}

export function getDrmLogById(id: string): DrmRequestLog | undefined {
  return logs.find((l) => l.id === id);
}

export function clearAllDrmLogs(): void {
  logs.length = 0;
}

export function detectClientCategory(
  userAgent: string,
  headers: Record<string, string>
): DrmRequestLog['clientCategory'] {
  const ua = (userAgent || '').toLowerCase();

  if (ua.includes('exoplayer') || ua.includes('media3') || ua.includes('dalvik')) {
    return 'Android ExoPlayer';
  }
  if (ua.includes('shaka') || headers['origin']?.includes('shaka')) {
    return 'Shaka Player';
  }
  if (ua.includes('curl') || ua.includes('postman') || ua.includes('insomnia') || ua.includes('httpie') || ua.includes('apilab')) {
    return 'API Tool / cURL';
  }
  if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) {
    return 'Web Browser';
  }
  return 'Other';
}

export function generateCurlSnippet(
  method: string,
  fullUrl: string,
  headers: Record<string, string>,
  body: any
): string {
  let cmd = `curl -X ${method} "${fullUrl}"`;

  // Filter out hop-by-hop headers
  const skipHeaders = new Set(['host', 'content-length', 'connection', 'accept-encoding']);

  for (const [key, val] of Object.entries(headers)) {
    if (!skipHeaders.has(key.toLowerCase()) && typeof val === 'string') {
      cmd += ` \\\n  -H "${key}: ${val.replace(/"/g, '\\"')}"`;
    }
  }

  if (body && method !== 'GET' && method !== 'HEAD') {
    const bodyStr = typeof body === 'object' ? JSON.stringify(body) : String(body);
    cmd += ` \\\n  -d '${bodyStr.replace(/'/g, "'\\''")}'`;
  }

  return cmd;
}
