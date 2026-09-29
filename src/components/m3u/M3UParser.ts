export interface M3UChannel {
  id: string;
  name: string;
  url: string;
  group?: string;
  logo?: string;
  tvgId?: string;
  drm?: {
    type?: string;
    kidHex?: string;
    keyHex?: string;
    licenseUrl?: string;
    rawProp?: string;
  };
  headers?: Record<string, string>;
  status?: 'online' | 'error' | 'timeout' | 'checking' | 'idle';
  latencyMs?: number;
  httpCode?: number;
}

/**
 * Parses raw M3U / M3U8 playlist strings including Kodi properties and headers
 */
export function parseM3UContent(content: string): M3UChannel[] {
  const lines = content.split(/\r?\n/);
  const channels: M3UChannel[] = [];

  let currentChannel: Partial<M3UChannel> = {};
  let currentHeaders: Record<string, string> = {};
  let currentDrm: Partial<M3UChannel['drm']> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Channel';

      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const tvgIdMatch = line.match(/tvg-id="([^"]+)"/i);

      currentChannel = {
        name,
        group: groupMatch ? groupMatch[1] : 'General',
        logo: logoMatch ? logoMatch[1] : undefined,
        tvgId: tvgIdMatch ? tvgIdMatch[1] : undefined,
        status: 'idle',
      };
    } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=')) {
      const keyStr = line.replace('#KODIPROP:inputstream.adaptive.license_key=', '').trim();
      currentDrm.licenseUrl = keyStr;
      currentDrm.rawProp = line;

      // Check if KID:KEY pair format
      if (keyStr.includes(':') && !keyStr.startsWith('http')) {
        const parts = keyStr.split(':');
        if (parts.length >= 2) {
          currentDrm.kidHex = parts[0].trim();
          currentDrm.keyHex = parts[1].trim();
          currentDrm.type = 'clearkey';
        }
      }
    } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_type=')) {
      const drmType = line.replace('#KODIPROP:inputstream.adaptive.license_type=', '').trim();
      currentDrm.type = drmType;
    } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
      currentHeaders['User-Agent'] = line.replace('#EXTVLCOPT:http-user-agent=', '').trim();
    } else if (line.startsWith('#EXTVLCOPT:http-referrer=') || line.startsWith('#EXTVLCOPT:http-referer=')) {
      currentHeaders['Referer'] = line.replace(/#EXTVLCOPT:http-referr?er=/, '').trim();
    } else if (line.startsWith('#EXTHTTP:')) {
      try {
        const jsonStr = line.replace('#EXTHTTP:', '').trim();
        const parsed = JSON.parse(jsonStr);
        currentHeaders = { ...currentHeaders, ...parsed };
      } catch (e) {}
    } else if (!line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('/'))) {
      if (currentChannel.name) {
        channels.push({
          id: `m3u-${channels.length + 1}-${Math.random().toString(36).substr(2, 6)}`,
          name: currentChannel.name,
          url: line,
          group: currentChannel.group || 'General',
          logo: currentChannel.logo,
          tvgId: currentChannel.tvgId,
          drm: Object.keys(currentDrm).length > 0 ? (currentDrm as any) : undefined,
          headers: Object.keys(currentHeaders).length > 0 ? currentHeaders : undefined,
          status: 'idle',
        });
      }
      currentChannel = {};
      currentHeaders = {};
      currentDrm = {};
    }
  }

  return channels;
}

/**
 * Generates clean formatted M3U playlist file content
 */
export function generateCleanM3U(channels: M3UChannel[]): string {
  let output = '#EXTM3U\n';
  for (const ch of channels) {
    const group = ch.group ? ` group-title="${ch.group}"` : '';
    const logo = ch.logo ? ` tvg-logo="${ch.logo}"` : '';
    const tvgId = ch.tvgId ? ` tvg-id="${ch.tvgId}"` : '';

    output += `#EXTINF:-1${tvgId}${logo}${group},${ch.name}\n`;

    if (ch.drm?.type) {
      output += `#KODIPROP:inputstream.adaptive.license_type=${ch.drm.type}\n`;
    }
    if (ch.drm?.kidHex && ch.drm?.keyHex) {
      output += `#KODIPROP:inputstream.adaptive.license_key=${ch.drm.kidHex}:${ch.drm.keyHex}\n`;
    } else if (ch.drm?.licenseUrl) {
      output += `#KODIPROP:inputstream.adaptive.license_key=${ch.drm.licenseUrl}\n`;
    }

    if (ch.headers?.['User-Agent']) {
      output += `#EXTVLCOPT:http-user-agent=${ch.headers['User-Agent']}\n`;
    }
    if (ch.headers?.['Referer']) {
      output += `#EXTVLCOPT:http-referrer=${ch.headers['Referer']}\n`;
    }

    output += `${ch.url}\n`;
  }
  return output;
}
