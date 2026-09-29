export interface DevicePreset {
  id: string;
  name: string;
  category: 'Desktop' | 'Mobile' | 'Smart TV' | 'Media Player';
  userAgent: string;
}

export const POPULAR_DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'default',
    name: 'Default Browser (Automatic)',
    category: 'Desktop',
    userAgent: '',
  },
  {
    id: 'chrome-win',
    name: 'Google Chrome (Windows 11)',
    category: 'Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
  {
    id: 'chrome-mac',
    name: 'Google Chrome (macOS)',
    category: 'Desktop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
  {
    id: 'safari-mac',
    name: 'Apple Safari (macOS)',
    category: 'Desktop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  },
  {
    id: 'firefox-win',
    name: 'Mozilla Firefox (Windows)',
    category: 'Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  },
  {
    id: 'android-chrome',
    name: 'Android Chrome (Pixel 8 Pro)',
    category: 'Mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36',
  },
  {
    id: 'ios-safari',
    name: 'iPhone / iOS Safari (iPhone 15)',
    category: 'Mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  },
  {
    id: 'android-tv',
    name: 'Sony Bravia Android TV / Google TV',
    category: 'Smart TV',
    userAgent: 'Mozilla/5.0 (Linux; Android 12; BRAVIA 4K VH2 Build/STT.210617.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Large Screen Safari/537.36',
  },
  {
    id: 'firetv-silk',
    name: 'Amazon Fire TV (Silk Browser)',
    category: 'Smart TV',
    userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM Build/NS6294) AppleWebKit/537.36 (KHTML, like Gecko) Silk/119.3.2 like Chrome/119.0.6045.193 Safari/537.36',
  },
  {
    id: 'samsung-tizen',
    name: 'Samsung Smart TV (Tizen 7.0)',
    category: 'Smart TV',
    userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) 94.0.4606.31/7.0 TV Safari/537.36',
  },
  {
    id: 'lg-webos',
    name: 'LG Smart TV (webOS 22)',
    category: 'Smart TV',
    userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.128 Safari/537.36 WebAppManager',
  },
  {
    id: 'kodi-adaptive',
    name: 'Kodi (InputStream.Adaptive)',
    category: 'Media Player',
    userAgent: 'Kodi/20.5 (Linux; Android 11.0; Shield Android TV Build/RQ1A.210105.003) Android/11.0.0 Sys_CPU/aarch64 App_Bitness/64 Version/20.5-Git:20240304-Nexus',
  },
  {
    id: 'tivimate',
    name: 'TiviMate IPTV Player',
    category: 'Media Player',
    userAgent: 'TiviMate/4.7.0 (Android TV)',
  },
  {
    id: 'vlc',
    name: 'VLC Media Player',
    category: 'Media Player',
    userAgent: 'VLC/3.0.20 LibVLC/3.0.20',
  },
  {
    id: 'exoplayer',
    name: 'ExoPlayer (Android Native)',
    category: 'Media Player',
    userAgent: 'ExoPlayerLib/2.19.1 (Linux; Android 13)',
  },
  {
    id: 'roku',
    name: 'Roku Streaming Stick / Player',
    category: 'Media Player',
    userAgent: 'Roku/DVP-9.10 (519.10E04111A)',
  },
];

export interface HeaderSuggestion {
  key: string;
  description: string;
  commonValues: string[];
}

export const COMMON_HEADER_SUGGESTIONS: HeaderSuggestion[] = [
  {
    key: 'Referer',
    description: 'Specifies the address of the webpage from which the stream was requested',
    commonValues: [
      'https://stream-provider.com',
      'https://live.ottplatform.com/',
      'https://tv.example.com/',
    ],
  },
  {
    key: 'Origin',
    description: 'Indicates the origin (scheme, hostname, port) of the request for CORS verification',
    commonValues: [
      'https://stream-provider.com',
      'https://live.ottplatform.com',
      'https://tv.example.com',
    ],
  },
  {
    key: 'Authorization',
    description: 'Carries credentials for authenticating the client with the streaming server',
    commonValues: [
      'Bearer ',
      'Basic ',
      'Token ',
    ],
  },
  {
    key: 'Cookie',
    description: 'Contains stored HTTP cookies (session tokens, Akamai/Cloudflare verification)',
    commonValues: [
      'session_id=',
      '_cfuvid=',
      'token=',
      'CloudFront-Key-Pair-Id=',
    ],
  },
  {
    key: 'X-Forwarded-For',
    description: 'Identifies the originating IP address of a client connecting through a proxy',
    commonValues: [
      '103.99.249.139',
      '103.145.132.1',
      '127.0.0.1',
    ],
  },
  {
    key: 'X-Real-IP',
    description: 'Alternative IP header often inspected by geo-restricted content servers',
    commonValues: [
      '103.99.249.139',
      '103.145.132.1',
    ],
  },
  {
    key: 'Accept',
    description: 'Informs the server about the types of media formats the client understands',
    commonValues: [
      '*/*',
      'application/vnd.apple.mpegurl, */*',
      'application/dash+xml,video/mp4;q=0.9,*/*;q=0.8',
    ],
  },
  {
    key: 'Accept-Language',
    description: 'Preferred natural languages for audio and subtitle matching',
    commonValues: [
      'en-US,en;q=0.9',
      'bn-BD,bn;q=0.9,en;q=0.8',
      'en-GB,en;q=0.9',
    ],
  },
  {
    key: 'Sec-Fetch-Mode',
    description: 'Indicates the mode of the request (cors, no-cors, navigate)',
    commonValues: ['cors', 'no-cors', 'navigate'],
  },
  {
    key: 'Sec-Fetch-Site',
    description: 'Indicates the relationship between the origin of request and origin of resource',
    commonValues: ['cross-site', 'same-origin', 'same-site'],
  },
  {
    key: 'Sec-Fetch-Dest',
    description: 'Indicates the request destination (video, audio, empty)',
    commonValues: ['empty', 'video', 'audio'],
  },
  {
    key: 'X-Requested-With',
    description: 'Used by mobile applications and AJAX requests to identify caller client',
    commonValues: [
      'XMLHttpRequest',
      'com.android.browser',
      'com.google.android.youtube',
    ],
  },
  {
    key: 'Cache-Control',
    description: 'Directives for caching mechanisms in requests and responses',
    commonValues: ['no-cache', 'max-age=0', 'no-store'],
  },
  {
    key: 'Pragma',
    description: 'Legacy HTTP/1.0 header often used alongside Cache-Control: no-cache',
    commonValues: ['no-cache'],
  },
  {
    key: 'Range',
    description: 'Requests only part of an entity (standard for video chunk streaming)',
    commonValues: ['bytes=0-', 'bytes=0-1048575'],
  },
];
