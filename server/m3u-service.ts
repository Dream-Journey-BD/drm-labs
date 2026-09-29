import { Request, Response } from 'express';

/**
 * Proxies media streams and segments to bypass CORS and inject custom headers
 */
export async function handleStreamProxy(req: Request, res: Response) {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const forwardedHeaders: Record<string, string> = {
      'User-Agent':
        (req.headers['x-proxy-user-agent'] as string) ||
        (req.headers['user-agent'] as string) ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    if (req.headers['x-proxy-referer']) {
      forwardedHeaders['Referer'] = req.headers['x-proxy-referer'] as string;
    }
    if (req.headers['x-proxy-origin']) {
      forwardedHeaders['Origin'] = req.headers['x-proxy-origin'] as string;
    }
    if (req.headers['x-proxy-cookie']) {
      forwardedHeaders['Cookie'] = req.headers['x-proxy-cookie'] as string;
    }
    if (req.headers['x-proxy-authorization']) {
      forwardedHeaders['Authorization'] = req.headers['x-proxy-authorization'] as string;
    }

    for (const [key, value] of Object.entries(req.headers)) {
      if (key.startsWith('x-proxy-hdr-') && typeof value === 'string') {
        const actualHeader = key.replace('x-proxy-hdr-', '');
        forwardedHeaders[actualHeader] = value;
      }
    }

    if (req.headers['range']) {
      forwardedHeaders['Range'] = req.headers['range'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method === 'OPTIONS' ? 'GET' : req.method,
      headers: forwardedHeaders,
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = req.body;
    }

    const upstreamRes = await fetch(targetUrl, fetchOptions);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const contentType = upstreamRes.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);

    const acceptRanges = upstreamRes.headers.get('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    res.status(upstreamRes.status);
    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(502).json({ error: 'Stream proxy request failed', details: err?.message || String(err) });
  }
}

/**
 * Checks individual stream channel health and latency
 */
export async function handleCheckChannel(req: Request, res: Response) {
  const { url, headers: customHeaders, timeoutMs = 5000 } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing stream URL' });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(timeoutMs, 10000));

  const reqHeaders: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(customHeaders || {}),
  };

  try {
    let upstreamRes = await fetch(url, {
      method: 'HEAD',
      headers: reqHeaders,
      signal: controller.signal,
    }).catch(async () => {
      return await fetch(url, {
        method: 'GET',
        headers: { ...reqHeaders, Range: 'bytes=0-1024' },
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;
    const status = upstreamRes.status;
    const contentType = upstreamRes.headers.get('content-type') || '';

    if (status >= 200 && status < 400) {
      return res.json({
        status: 'online',
        httpCode: status,
        latencyMs,
        contentType,
      });
    } else {
      return res.json({
        status: 'error',
        httpCode: status,
        latencyMs,
        contentType,
        error: `HTTP ${status} ${upstreamRes.statusText || ''}`.trim(),
      });
    }
  } catch (err: any) {
    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;
    const isTimeout = err?.name === 'AbortError' || String(err?.message || '').includes('aborted');

    if (isTimeout) {
      return res.json({
        status: 'timeout',
        httpCode: 0,
        latencyMs,
        error: `Connection timed out after ${timeoutMs}ms`,
      });
    }

    return res.json({
      status: 'error',
      httpCode: 0,
      latencyMs,
      error: err?.message || 'Network request failed',
    });
  }
}

/**
 * Fetches remote M3U or M3U8 playlist content from a URL (e.g. GitHub raw, IPTV link, Pastebin)
 * to bypass browser CORS restrictions and support direct playlist loading.
 */
export async function handleFetchPlaylistFromUrl(req: Request, res: Response) {
  let targetUrl = (req.query.url as string) || (req.body && req.body.url);
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  targetUrl = targetUrl.trim();

  // Convert GitHub blob web view URLs to raw user content URLs automatically:
  // e.g. https://github.com/user/repo/blob/main/playlist.m3u -> https://raw.githubusercontent.com/user/repo/main/playlist.m3u
  if (targetUrl.includes('github.com/') && targetUrl.includes('/blob/')) {
    targetUrl = targetUrl
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('http://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: `Remote server responded with HTTP ${upstreamRes.status} ${upstreamRes.statusText || ''}`.trim(),
      });
    }

    const content = await upstreamRes.text();

    return res.json({
      success: true,
      url: targetUrl,
      content,
      size: content.length,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    const isTimeout = err?.name === 'AbortError' || String(err?.message || '').includes('aborted');
    return res.status(502).json({
      error: isTimeout ? 'Request timed out while fetching remote playlist URL' : (err?.message || 'Failed to fetch playlist'),
    });
  }
}
