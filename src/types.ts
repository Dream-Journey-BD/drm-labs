export interface KeyMetadata {
  kidHex: string;
  keyHex: string;
  kidUuid: string;
  kidBase64: string;
  keyBase64: string;
  kidBase64Url: string;
  keyBase64Url: string;
  clearkeyDrmUuid: string;
  w3cSystemId: string;
  widevineUuid: string;
  playreadyUuid: string;
  clearkeyLicensePath: string;
}

export interface StreamItem {
  id: string;
  originalName: string;
  customName?: string;
  videoCodec?: string;
  hasAudio?: boolean;
  createdAt: string;
  fileSizeBytes: number;
  mpdUrl: string;
  hlsUrl?: string;
  streamFormat?: 'dash' | 'hls' | 'both';
  audioFormat?: string;
  clearLeadSeconds?: number;
  isDrmProtected?: boolean;
  licenseUrl: string;
  status: 'ready' | 'processing' | 'error';
  errorMessage?: string;
  keys: KeyMetadata;
  files: string[];
}

export interface UploadResponse {
  success: boolean;
  stream?: StreamItem;
  error?: string;
}

export interface NetworkInfo {
  ip: string;
  port: number;
}

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
