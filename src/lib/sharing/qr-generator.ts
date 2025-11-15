/**
 * QR Code Generator for DevCard Sharing
 *
 * Generates QR codes for DevCard profiles using the qrcode library.
 * Supports various sizes and formats for different sharing contexts.
 * Includes Vercel KV caching with 7-day TTL.
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev';
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
      dark: '#00FF94', // StackPass brand green
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev';
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev';
    const baseUrlObj = new URL(baseUrl);

    return (
      urlObj.origin === baseUrlObj.origin &&
      urlObj.pathname.split('/').filter(Boolean).length === 1
    );
  } catch {
    return false;
  }
}

/**
 * QR Code Caching with Vercel KV
 *
 * Cache QR codes to reduce generation overhead and improve performance.
 * Uses 7-day TTL as specified in requirements.
 */

// Cache key prefix
const QR_CACHE_PREFIX = 'qr:';

// Cache TTL: 7 days (in seconds)
const QR_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Get KV client instance
 */
async function getKVClient() {
  if (!isKVAvailable()) {
    return null;
  }

  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch (error) {
    console.error('Failed to load @vercel/kv:', error);
    return null;
  }
}

/**
 * Generate cache key for QR code
 *
 * @param username - DevCard username
 * @param size - QR code size
 * @returns Cache key string
 */
function generateQRCacheKey(username: string, size: number): string {
  return `${QR_CACHE_PREFIX}${username}:${size}`;
}

/**
 * Cache QR code result
 *
 * @param username - DevCard username
 * @param size - QR code size
 * @param result - QR code generation result
 * @returns True if cached successfully
 */
export async function cacheQRCode(
  username: string,
  size: number,
  result: QRCodeResult
): Promise<boolean> {
  try {
    const kv = await getKVClient();
    if (!kv) {
      console.warn('Vercel KV not available, skipping QR code caching');
      return false;
    }

    const key = generateQRCacheKey(username, size);
    await kv.setex(key, QR_CACHE_TTL, JSON.stringify(result));
    return true;
  } catch (error) {
    console.error('Failed to cache QR code:', error);
    return false;
  }
}

/**
 * Get cached QR code
 *
 * @param username - DevCard username
 * @param size - QR code size
 * @returns Cached QR code result or null if not found
 */
export async function getCachedQRCode(
  username: string,
  size: number
): Promise<QRCodeResult | null> {
  try {
    const kv = await getKVClient();
    if (!kv) {
      return null;
    }

    const key = generateQRCacheKey(username, size);
    const cached = await kv.get(key);

    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : (cached as QRCodeResult);
    }

    return null;
  } catch (error) {
    console.error('Failed to get cached QR code:', error);
    return null;
  }
}

/**
 * Generate QR code with caching
 *
 * This is the main function to use for QR code generation in API endpoints.
 * It checks the cache first and generates a new QR code only if needed.
 *
 * @param username - DevCard username
 * @param options - QR code generation options
 * @returns Promise resolving to QR code data URL and original URL
 *
 * @example
 * ```ts
 * const result = await generateQRWithCache('danproctor', { size: 400 });
 * // Returns cached result if available, otherwise generates new QR code
 * ```
 */
export async function generateQRWithCache(
  username: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  const size = validateSize(options.size || 400);

  // Try to get from cache first
  const cached = await getCachedQRCode(username, size);
  if (cached) {
    return cached;
  }

  // Generate new QR code
  const result = await generateDevCardQR(username, options);

  // Cache the result (fire and forget)
  cacheQRCode(username, size, result).catch((error) => {
    console.error('Failed to cache QR code (non-blocking):', error);
  });

  return result;
}

/**
 * Invalidate cached QR code for a username
 *
 * @param username - DevCard username
 * @returns True if invalidated successfully
 */
export async function invalidateQRCache(username: string): Promise<boolean> {
  try {
    const kv = await getKVClient();
    if (!kv) {
      return false;
    }

    // Invalidate common sizes
    const commonSizes = [200, 400, 800, 1000];
    const keys = commonSizes.map((size) => generateQRCacheKey(username, size));

    await Promise.all(keys.map((key) => kv.del(key)));
    return true;
  } catch (error) {
    console.error('Failed to invalidate QR cache:', error);
    return false;
  }
}
