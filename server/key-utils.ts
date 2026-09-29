import { KeyMetadata } from '../src/types';

/**
 * Computes standard DRM Key metadata (Hex, UUID, Base64, Base64Url, System IDs)
 * for ClearKey encryption and playback.
 */
export function computeKeyMetadata(kidHex: string, keyHex: string): KeyMetadata {
  const cleanKid = kidHex.replace(/[^0-9a-fA-F]/g, '').toLowerCase().padStart(32, '0').slice(0, 32);
  const cleanKey = keyHex.replace(/[^0-9a-fA-F]/g, '').toLowerCase().padStart(32, '0').slice(0, 32);

  const kidBuf = Buffer.from(cleanKid, 'hex');
  const keyBuf = Buffer.from(cleanKey, 'hex');

  const kidUuid = cleanKid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

  return {
    kidHex: cleanKid,
    keyHex: cleanKey,
    kidUuid,
    kidBase64: kidBuf.toString('base64'),
    keyBase64: keyBuf.toString('base64'),
    kidBase64Url: kidBuf.toString('base64url'),
    keyBase64Url: keyBuf.toString('base64url'),
    clearkeyDrmUuid: 'e2719d58-a985-b3c9-781a-b030af78d30e',
    w3cSystemId: '1077efec-c0b2-4d02-ace3-3c1e52e2fb4b',
    widevineUuid: 'edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
    playreadyUuid: '9a04f079-9840-4286-ab92-e65be0885f95',
    clearkeyLicensePath: '/api/clearkey-license',
  };
}

/**
 * Generates a standard random 32-character hexadecimal string
 */
export function generateRandomHex(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
