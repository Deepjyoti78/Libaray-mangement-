import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generates an unguessable public booking reference.
 * Format: JF-2026-[5 uppercase alphanumeric characters, avoiding ambiguous 0/O, 1/I]
 */
export function generateBookingRef() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  const year = new Date().getFullYear();
  return `JF-${year}-${randomPart}`;
}

/**
 * Generates cryptographically secure random token
 */
export function generateSecureToken() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Creates SHA-256 hash of a token for safe database storage
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a QR code data URL from an opaque payload.
 * The payload contains ONLY the unguessable check-in token or reference, NO PII.
 */
export async function generateQrCode(payload) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#352319', // Espresso color matching design language!
      light: '#F8F5EE', // Warm surface background!
    },
    width: 280,
  });
}
