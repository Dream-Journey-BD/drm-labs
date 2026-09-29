import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SVG_BANNER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#050811" />
      <stop offset="100%" stop-color="#020408" />
    </linearGradient>

    <!-- Accent Glow Gradients -->
    <radialGradient id="indigoGlow" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="cyanGlow" cx="80%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="emeraldGlow" cx="50%" cy="85%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>

    <!-- Brand Gradients -->
    <linearGradient id="brandTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#e0e7ff" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Grid Pattern -->
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.4" />
    </pattern>

    <!-- Drop Shadow Filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
    </filter>
    <filter id="iconGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="640" fill="url(#bgGrad)" />
  <rect width="1280" height="640" fill="url(#indigoGlow)" />
  <rect width="1280" height="640" fill="url(#cyanGlow)" />
  <rect width="1280" height="640" fill="url(#emeraldGlow)" />
  <rect width="1280" height="640" fill="url(#gridPattern)" />

  <!-- Outer Ambient Border -->
  <rect x="24" y="24" width="1232" height="592" rx="24" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.8" />
  <rect x="24" y="24" width="1232" height="592" rx="24" fill="none" stroke="url(#shieldGrad)" stroke-width="1" stroke-opacity="0.2" />

  <!-- Center Content Area -->
  <g transform="translate(640, 240)">
    <!-- Central Icon Glow -->
    <circle cx="0" cy="-60" r="70" fill="#6366f1" opacity="0.15" filter="url(#iconGlow)" />

    <!-- Icon Container -->
    <rect x="-56" y="-116" width="112" height="112" rx="28" fill="#0f172a" stroke="#334155" stroke-width="2" filter="url(#shadow)" />
    <rect x="-56" y="-116" width="112" height="112" rx="28" fill="none" stroke="url(#shieldGrad)" stroke-width="1.5" stroke-opacity="0.5" />

    <!-- Shield & Key Vector inside Icon -->
    <!-- Shield Outline -->
    <path d="M0 -96 L26 -86 V-64 C26 -46 14 -32 0 -26 C-14 -32 -26 -46 -26 -64 V-86 Z" fill="#1e1b4b" stroke="url(#shieldGrad)" stroke-width="2.5" stroke-linejoin="round" />
    <!-- Play & Key Symbols -->
    <polygon points="-6,-67 -6,-51 9,-59" fill="#38bdf8" />
    <circle cx="-1" cy="-59" r="1.5" fill="#ffffff" />

    <!-- Main Title -->
    <text x="0" y="50" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="url(#brandTextGrad)" text-anchor="middle" letter-spacing="1">
      DRM LABS
    </text>

    <!-- Subtitle -->
    <text x="0" y="90" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">
      Universal ClearKey DRM Packaging, Multi-Format Player &amp; Live DRM Inspector
    </text>

    <!-- Tech Badges Container -->
    <g transform="translate(0, 145)">
      <!-- Badge 1: W3C ClearKey -->
      <g transform="translate(-360, 0)">
        <rect x="0" y="0" width="160" height="38" rx="10" fill="#0f172a" stroke="#312e81" stroke-width="1.2" />
        <circle cx="20" cy="19" r="5" fill="#6366f1" />
        <text x="32" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#c7d2fe">W3C ClearKey</text>
      </g>

      <!-- Badge 2: MPEG-DASH & HLS -->
      <g transform="translate(-180, 0)">
        <rect x="0" y="0" width="165" height="38" rx="10" fill="#0f172a" stroke="#065f46" stroke-width="1.2" />
        <circle cx="20" cy="19" r="5" fill="#10b981" />
        <text x="32" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a7f3d0">DASH &amp; Apple HLS</text>
      </g>

      <!-- Badge 3: Media3 ExoPlayer -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="175" height="38" rx="10" fill="#0f172a" stroke="#854d0e" stroke-width="1.2" />
        <circle cx="20" cy="19" r="5" fill="#f59e0b" />
        <text x="32" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#fde68a">Media3 ExoPlayer</text>
      </g>

      <!-- Badge 4: IPTV & M3U8 -->
      <g transform="translate(190, 0)">
        <rect x="0" y="0" width="170" height="38" rx="10" fill="#0f172a" stroke="#0e7490" stroke-width="1.2" />
        <circle cx="20" cy="19" r="5" fill="#06b6d4" />
        <text x="32" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#bae6fd">IPTV M3U Analyzer</text>
      </g>
    </g>
  </g>

  <!-- Corner Status Indicator -->
  <g transform="translate(1120, 52)">
    <circle cx="0" cy="0" r="4" fill="#22c55e" />
    <text x="10" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#86efac">v1.0.0 Ready</text>
  </g>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write public/social-preview.svg
  fs.writeFileSync(path.join(publicDir, 'social-preview.svg'), SVG_BANNER, 'utf8');
  console.log('Created public/social-preview.svg');

  // 2. Generate PNG 1280x640 (GitHub Social Preview Standard)
  await sharp(Buffer.from(SVG_BANNER))
    .resize(1280, 640)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'social-preview.png'));
  console.log('Created public/social-preview.png (1280x640)');

  // 3. Generate banner.png as duplicate for convenience
  await sharp(Buffer.from(SVG_BANNER))
    .resize(1280, 640)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'banner.png'));
  console.log('Created public/banner.png (1280x640)');

  // 4. Generate App Icon 512x512 from logo.svg
  const logoSvgPath = path.join(publicDir, 'logo.svg');
  if (fs.existsSync(logoSvgPath)) {
    const logoSvg = fs.readFileSync(logoSvgPath);
    await sharp(logoSvg)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('Created public/icon-512.png (512x512)');

    await sharp(logoSvg)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('Created public/icon-192.png (192x192)');

    await sharp(logoSvg)
      .resize(64, 64)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('Created public/favicon.png (64x64)');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
