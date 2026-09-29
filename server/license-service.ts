import { Request, Response } from 'express';
import { getAllStreams } from './db';
import {
  recordDrmLog,
  detectClientCategory,
  generateCurlSnippet,
  DrmRequestLog,
} from './drm-logger';

/**
 * Handles W3C ClearKey DRM License requests and logs all transaction details
 * for the live DRM Inspector.
 */
export function handleClearKeyLicenseRequest(streamId: string | null, req: Request, res: Response) {
  const startTime = Date.now();
  const streams = getAllStreams();

  // Extract client IP and headers safely
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded)
      ? forwarded[0]
      : req.socket.remoteAddress || '127.0.0.1'
  ).replace('::ffff:', '');

  const userAgent = req.headers['user-agent'] || 'Unknown Player';

  // Normalize headers
  const sanitizedHeaders: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === 'string') {
      sanitizedHeaders[key] = val;
    } else if (Array.isArray(val)) {
      sanitizedHeaders[key] = val.join(', ');
    }
  }

  // Parse request body if available (JSON or raw Buffer)
  let bodyJson: any = req.body;
  if (Buffer.isBuffer(req.body)) {
    try {
      bodyJson = JSON.parse(req.body.toString('utf-8'));
    } catch {
      bodyJson = req.body.toString('utf-8');
    }
  } else if (typeof req.body === 'string') {
    try {
      bodyJson = JSON.parse(req.body);
    } catch {
      bodyJson = req.body;
    }
  }

  const queryParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (typeof v === 'string') queryParams[k] = v;
  }

  // Helper to record log and send response
  const sendLoggedResponse = (
    status: number,
    responsePayload: any,
    matchedStreamId: string | null = null,
    matchedStreamName: string | null = null,
    extractedKids: string[] = []
  ) => {
    const durationMs = Date.now() - startTime;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const fullUrl = `${req.protocol}://${req.get('host') || 'localhost:3000'}${req.originalUrl}`;
    const curlCommand = generateCurlSnippet(req.method, fullUrl, sanitizedHeaders, bodyJson);

    const logEntry: DrmRequestLog = {
      id: `drm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      method: req.method,
      url: req.originalUrl,
      clientIp,
      userAgent,
      clientCategory: detectClientCategory(userAgent, sanitizedHeaders),
      headers: sanitizedHeaders,
      query: queryParams,
      body: bodyJson,
      extractedKids,
      matchedStreamId,
      matchedStreamName,
      status,
      durationMs,
      responseBody: responsePayload,
      curlCommand,
    };

    recordDrmLog(logEntry);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(status).json(responsePayload);
  };

  // 1. If explicit stream ID provided in route (/api/clearkey-license/:id)
  if (streamId) {
    const targetStream = streams.find((s) => s.id === streamId);
    if (!targetStream) {
      return sendLoggedResponse(
        404,
        { error: `Stream '${streamId}' not found`, status: 404 },
        streamId,
        null,
        []
      );
    }

    if (!targetStream.keys || !targetStream.keys.keyBase64Url) {
      return sendLoggedResponse(
        400,
        {
          error: `Stream '${streamId}' is an unencrypted (Clear) stream with no DRM keys`,
          status: 400,
        },
        streamId,
        targetStream.customName || targetStream.originalName,
        []
      );
    }

    const payload = {
      keys: [
        {
          kty: 'oct',
          k: targetStream.keys.keyBase64Url,
          kid: targetStream.keys.kidBase64Url,
        },
      ],
      type: 'temporary',
    };

    return sendLoggedResponse(
      200,
      payload,
      targetStream.id,
      targetStream.customName || targetStream.originalName,
      [targetStream.keys.kidBase64Url, targetStream.keys.kidHex]
    );
  }

  // 2. Handle Standard W3C ClearKey POST request from ExoPlayer / Shaka Player / EME
  // Payload: { "kids": ["base64url_kid_1", ...], "type": "temporary" }
  if (bodyJson && Array.isArray(bodyJson.kids) && bodyJson.kids.length > 0) {
    const requestedKids: string[] = bodyJson.kids;
    const matchedKeys: Array<{ kty: string; k: string; kid: string }> = [];
    let matchedStream: any = null;

    for (const reqKid of requestedKids) {
      const cleanKid = reqKid.trim();
      const stream = streams.find(
        (s) =>
          s.keys &&
          (s.keys.kidBase64Url === cleanKid ||
            s.keys.kidBase64 === cleanKid ||
            s.keys.kidHex.toLowerCase() === cleanKid.toLowerCase() ||
            s.keys.kidUuid.toLowerCase() === cleanKid.toLowerCase())
      );

      if (stream && stream.keys) {
        matchedStream = stream;
        matchedKeys.push({
          kty: 'oct',
          k: stream.keys.keyBase64Url,
          kid: stream.keys.kidBase64Url,
        });
      }
    }

    if (matchedKeys.length > 0) {
      const payload = {
        keys: matchedKeys,
        type: 'temporary',
      };
      return sendLoggedResponse(
        200,
        payload,
        matchedStream ? matchedStream.id : null,
        matchedStream ? (matchedStream.customName || matchedStream.originalName) : null,
        requestedKids
      );
    }

    // Key not found
    return sendLoggedResponse(
      404,
      {
        error: 'No matching DRM key found for the requested Key ID(s)',
        requestedKids,
        status: 404,
      },
      null,
      null,
      requestedKids
    );
  }

  // 3. Check query parameters (?kid=... or ?streamId=...)
  if (req.query) {
    if (req.query.streamId && typeof req.query.streamId === 'string') {
      const found = streams.find((s) => s.id === req.query.streamId);
      if (found && found.keys) {
        const payload = {
          keys: [
            {
              kty: 'oct',
              k: found.keys.keyBase64Url,
              kid: found.keys.kidBase64Url,
            },
          ],
          type: 'temporary',
        };
        return sendLoggedResponse(
          200,
          payload,
          found.id,
          found.customName || found.originalName,
          [found.keys.kidBase64Url]
        );
      }
    }

    if (req.query.kid && typeof req.query.kid === 'string') {
      const qKid = req.query.kid.trim().toLowerCase();
      const found = streams.find(
        (s) =>
          s.keys &&
          (s.keys.kidHex.toLowerCase() === qKid ||
            s.keys.kidBase64Url === req.query.kid ||
            s.keys.kidBase64 === req.query.kid)
      );
      if (found && found.keys) {
        const payload = {
          keys: [
            {
              kty: 'oct',
              k: found.keys.keyBase64Url,
              kid: found.keys.kidBase64Url,
            },
          ],
          type: 'temporary',
        };
        return sendLoggedResponse(
          200,
          payload,
          found.id,
          found.customName || found.originalName,
          [req.query.kid as string]
        );
      }
    }
  }

  // 4. GET info without parameters (browser check)
  if (req.method === 'GET') {
    const payload = {
      service: 'DRM Labs W3C ClearKey DRM License Service',
      status: 'active',
      description:
        'This endpoint dynamically serves W3C ClearKey DRM decryption keys to players like ExoPlayer, Shaka Player, and Video.js.',
      usage: {
        exoPlayerStandard: {
          method: 'POST',
          url: '/api/clearkey-license',
          bodyExample: {
            kids: ['EjRWeJCrze8SNFZ4kKvN7w'],
            type: 'temporary',
          },
          note: 'ExoPlayer automatically sends the KID extracted from MPD manifest in POST body, and receives only the exact matching key.',
        },
        streamSpecificUrl: {
          method: 'GET / POST',
          url: '/api/clearkey-license/:streamId',
        },
        queryParamUrl: {
          method: 'GET',
          url: '/api/clearkey-license?kid=<hex_or_base64url>',
        },
      },
      availableStreamsCount: streams.length,
    };
    return sendLoggedResponse(200, payload, null, null, []);
  }

  // Fallback 400
  return sendLoggedResponse(
    400,
    {
      error: 'Invalid ClearKey DRM license request. Missing stream ID or "kids" payload.',
      status: 400,
    },
    null,
    null,
    []
  );
}
