/**
 * QR Code Generator for DevCard Sharing
 *
 * Generates QR codes for DevCard profiles using the qrcode library.
 * Supports various sizes and formats for different sharing contexts.
 */

import QRCode from 'qrcode';

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
  margin?: number;
}

/**
 * QR code generation result
 */
export interface QRCodeResult {
  qr_code: string; // Base64 data URL
  url: string; // Original URL encoded in QR
}

/**
 * Validate QR code size parameter
 */
function validateSize(size: number): number {
  const MIN_SIZE = 200;
  const MAX_SIZE = 1000;
  const DEFAULT_SIZE = 400;

  if (size < MIN_SIZE || size > MAX_SIZE) {
    console.warn(`QR code size ${size} out of range [${MIN_SIZE}, ${MAX_SIZE}], using default ${DEFAULT_SIZE}`);
    return DEFAULT_SIZE;
  }

  return size;
}

/**
 * Generate QR code for a DevCard profile
 *
 * @param username - DevCard username (URL slug)
 * @param options - QR code generation options
 * @returns Promise resolving to QR code data URL and original URL
 *
 * @example
 * ```ts
 * const result = await generateDevCardQR('danproctor', { size: 400 });
 * // result.qr_code: "data:image/png;base64,..."
 * // result.url: "https://devius.io/danproctor"
 * ```
 */
export async function generateDevCardQR(
  username: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required and must be a string');
  }

  // Construct DevCard URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io';
  const url = `${baseUrl}/${username}`;

  // Validate and normalize size
  const size = validateSize(options.size || 400);

  // Configure QR code options
  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'image/png',
    width: size,
    margin: options.margin ?? 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  try {
    // Generate QR code as base64 data URL
    const qrCode = await QRCode.toDataURL(url, qrOptions);

    return {
      qr_code: qrCode,
      url: url,
    };
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code with custom branding colors
 *
 * @param username - DevCard username
 * @param size - QR code size in pixels
 * @returns Promise resolving to branded QR code
 */
export async function generateBrandedQR(
  username: string,
  size: number = 400
): Promise<QRCodeResult> {
  return generateDevCardQR(username, {
    size,
    errorCorrectionLevel: 'H', // High error correction for branding
    color: {
      dark: '#00FF94', // Devius brand green
      light: '#0A0A0A', // Dark background
    },
  });
}

/**
 * Generate QR code as Buffer (for server-side image processing)
 *
 * @param username - DevCard username
 * @param options - QR code generation options
 * @returns Promise resolving to PNG buffer
 */
export async function generateQRBuffer(
  username: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required and must be a string');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io';
  const url = `${baseUrl}/${username}`;
  const size = validateSize(options.size || 400);

  const qrOptions: QRCode.QRCodeToBufferOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'png',
    width: size,
    margin: options.margin ?? 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  try {
    return await QRCode.toBuffer(url, qrOptions);
  } catch (error) {
    console.error('Failed to generate QR code buffer:', error);
    throw new Error(`QR code buffer generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple QR codes for different sizes (e.g., for responsive images)
 *
 * @param username - DevCard username
 * @param sizes - Array of sizes to generate
 * @returns Promise resolving to array of QR codes with sizes
 */
export async function generateMultipleSizes(
  username: string,
  sizes: number[] = [200, 400, 800]
): Promise<Array<QRCodeResult & { size: number }>> {
  const results = await Promise.all(
    sizes.map(async (size) => {
      const result = await generateDevCardQR(username, { size });
      return { ...result, size };
    })
  );

  return results;
}

/**
 * Validate if a string is a valid DevCard URL
 *
 * @param url - URL to validate
 * @returns True if URL matches DevCard format
 */
export function isValidDevCardURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io';
    const baseUrlObj = new URL(baseUrl);

    return (
      urlObj.origin === baseUrlObj.origin &&
      urlObj.pathname.split('/').filter(Boolean).length === 1
    );
  } catch {
    return false;
  }
}
