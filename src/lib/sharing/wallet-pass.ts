// @ts-nocheck
/**
 * Wallet Pass Generator for DevCard
 *
 * Generates Apple Wallet (.pkpass) and Google Pay passes for DevCard profiles.
 * Allows users to save their DevCard to their mobile wallet for easy sharing.
 */

import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import { generateQRBuffer } from './qr-generator';

/**
 * Platform types for wallet passes
 */
export type WalletPlatform = 'apple' | 'google';

/**
 * DevCard data for wallet pass generation
 * Minimal subset of fields needed for wallet pass
 */
export interface WalletPassDevCardData {
  username: string;
  display_name: string | null;
  custom_bio?: string;
  location?: string;
  avatar_url?: string;
  github_username?: string;
  member_number?: number;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

/**
 * Apple Wallet pass generation result
 */
export interface ApplePassResult {
  pass: Buffer;
  mimeType: 'application/vnd.apple.pkpass';
}

/**
 * Google Pay pass generation result
 */
export interface GooglePassResult {
  jwt: string;
  save_url: string;
}

/**
 * Configuration for wallet pass generation
 * These should be set via environment variables
 */
interface PassConfig {
  // Apple Wallet
  appleTeamIdentifier?: string;
  applePassTypeIdentifier?: string;
  appleCertificatePath?: string;
  appleKeyPath?: string;
  appleWWDRCAPath?: string;
  appleCertificateBase64?: string;
  appleKeyBase64?: string;
  appleWWDRCABase64?: string;

  // Google Pay
  googleIssuerId?: string;
  googleServiceAccountKey?: string;
}

/**
 * Get pass configuration from environment variables
 */
function getPassConfig(): PassConfig {
  return {
    // Apple Wallet (requires Apple Developer account)
    appleTeamIdentifier: process.env.APPLE_TEAM_IDENTIFIER,
    applePassTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.dev.stackpass.card',
    appleCertificatePath: process.env.APPLE_CERTIFICATE_PATH,
    appleKeyPath: process.env.APPLE_KEY_PATH,
    appleWWDRCAPath: process.env.APPLE_WWDRCA_PATH,
    appleCertificateBase64: process.env.APPLE_CERTIFICATE_BASE64,
    appleKeyBase64: process.env.APPLE_KEY_BASE64,
    appleWWDRCABase64: process.env.APPLE_WWDRCA_BASE64,

    // Google Pay (requires Google Cloud project)
    googleIssuerId: process.env.GOOGLE_WALLET_ISSUER_ID,
    googleServiceAccountKey: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY,
  };
}

/**
 * Generate Apple Wallet pass for DevCard
 *
 * @param devCardData - DevCard profile data
 * @returns Promise resolving to .pkpass file buffer
 *
 * @example
 * ```ts
 * const pass = await generateAppleWalletPass({
 *   username: 'danproctor',
 *   display_name: 'Dan Proctor',
 *   custom_bio: 'Full-stack developer',
 *   github_username: 'danproctor'
 * });
 * ```
 */
export async function generateAppleWalletPass(
  devCardData: WalletPassDevCardData
): Promise<ApplePassResult> {
  const config = getPassConfig();

  // Validate Apple Wallet configuration - support both file paths and Base64
  const hasPaths = config.appleCertificatePath && config.appleKeyPath;
  const hasBase64 = config.appleCertificateBase64 && config.appleKeyBase64;

  if (!hasPaths && !hasBase64) {
    throw new Error(
      'Apple Wallet pass generation requires either certificate paths or Base64 encoded certificates'
    );
  }

  if (!config.appleTeamIdentifier) {
    throw new Error('APPLE_TEAM_IDENTIFIER is required');
  }

  // Load certificates as buffers
  let certBuffer: Buffer;
  let keyBuffer: Buffer;
  let wwdrBuffer: Buffer;

  if (hasBase64) {
    // Decode Base64 certificates (Vercel) - trim whitespace first
    certBuffer = Buffer.from(config.appleCertificateBase64!.trim().replace(/\s/g, ''), 'base64');
    keyBuffer = Buffer.from(config.appleKeyBase64!.trim().replace(/\s/g, ''), 'base64');
    wwdrBuffer = config.appleWWDRCABase64
      ? Buffer.from(config.appleWWDRCABase64.trim().replace(/\s/g, ''), 'base64')
      : fs.readFileSync(config.appleWWDRCAPath!);

    console.log('📦 Decoded Base64 cert sizes:', {
      cert: certBuffer.length,
      key: keyBuffer.length,
      wwdr: wwdrBuffer.length,
    });
  } else {
    // Read from filesystem (local development)
    certBuffer = fs.readFileSync(config.appleCertificatePath!);
    keyBuffer = fs.readFileSync(config.appleKeyPath!);
    wwdrBuffer = fs.readFileSync(config.appleWWDRCAPath!);
  }

  try {
    console.log('🔐 Apple Wallet Config:', {
      teamId: config.appleTeamIdentifier,
      passTypeId: config.applePassTypeIdentifier,
      hasCertPath: !!config.appleCertificatePath,
      hasCertBase64: !!config.appleCertificateBase64,
    });

    // Generate QR code for the pass
    const qrBuffer = await generateQRBuffer(devCardData.username, { size: 400 });

    // Build complete pass.json structure
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: config.applePassTypeIdentifier!,
      serialNumber: `stackpass-${devCardData.username}-${Date.now()}`,
      teamIdentifier: config.appleTeamIdentifier!,
      organizationName: 'StackPass',
      description: `${devCardData.display_name}'s StackPass`,
      logoText: 'StackPass',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(10, 10, 10)',
      labelColor: 'rgb(0, 255, 148)',
      generic: {
        headerFields: [] as any[],
        primaryFields: [] as any[],
        secondaryFields: [] as any[],
        auxiliaryFields: [] as any[],
        backFields: [] as any[],
      },
      barcodes: [
        {
          message: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${devCardData.username}`,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1',
        },
      ],
    };

    // Create pass instance with pass.json buffer
    const pass = new PKPass(
      {
        'pass.json': Buffer.from(JSON.stringify(passJson)),
      },
      {
        signerCert: certBuffer,
        signerKey: keyBuffer,
        wwdr: wwdrBuffer,
      }
    );

    // Header fields
    pass.headerFields.push({
      key: 'header',
      label: 'STACKPASS',
      value: devCardData.display_name || '',
    });

    // Primary fields
    pass.primaryFields.push({
      key: 'name',
      label: 'Developer',
      value: devCardData.display_name || '',
    });

    // Secondary fields
    pass.secondaryFields.push(
      {
        key: 'username',
        label: 'Username',
        value: `@${devCardData.github_username || devCardData.username}`,
      }
    );

    if (devCardData.member_number) {
      pass.secondaryFields.push({
        key: 'member',
        label: 'Founder',
        value: `#${String(devCardData.member_number).padStart(3, '0')}`,
      });
    }

    if (devCardData.location) {
      pass.secondaryFields.push({
        key: 'location',
        label: 'Location',
        value: devCardData.location,
      });
    }

    // Auxiliary fields
    pass.auxiliaryFields.push({
      key: 'bio',
      label: 'Bio',
      value: devCardData.custom_bio || 'Developer profile on StackPass',
    });

    // Back fields
    pass.backFields.push({
      key: 'profile',
      label: 'Profile URL',
      value: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${devCardData.username}`,
    });

    if (devCardData.social_links?.twitter) {
      pass.backFields.push({
        key: 'twitter',
        label: 'Twitter',
        value: devCardData.social_links.twitter,
      });
    }

    if (devCardData.social_links?.linkedin) {
      pass.backFields.push({
        key: 'linkedin',
        label: 'LinkedIn',
        value: devCardData.social_links.linkedin,
      });
    }

    if (devCardData.social_links?.website) {
      pass.backFields.push({
        key: 'website',
        label: 'Website',
        value: devCardData.social_links.website,
      });
    }

    // Barcode already set in passJson above


    // Add images (logo, icon, strip, thumbnail)
    // Note: These files should be placed in a public/wallet-assets directory
    // and referenced via environment variables or constants
    const assetsPath = process.env.WALLET_ASSETS_PATH || path.join(process.cwd(), 'public', 'wallet-assets');

    // Add logo (required)
    try {
      const logoPath = path.join(assetsPath, 'logo.png');
      pass.addBuffer('logo.png', await import('fs').then((fs) => fs.promises.readFile(logoPath)));
    } catch (error) {
      console.warn('Logo not found, pass may not display correctly');
    }

    // Add icon (required)
    try {
      const iconPath = path.join(assetsPath, 'icon.png');
      pass.addBuffer('icon.png', await import('fs').then((fs) => fs.promises.readFile(iconPath)));
    } catch (error) {
      console.warn('Icon not found, pass may not display correctly');
    }

    // Generate the pass
    const passBuffer = pass.getAsBuffer();

    return {
      pass: passBuffer,
      mimeType: 'application/vnd.apple.pkpass',
    };
  } catch (error) {
    console.error('Failed to generate Apple Wallet pass:', error);
    throw new Error(
      `Apple Wallet pass generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate Google Pay pass for DevCard
 *
 * @param devCardData - DevCard profile data
 * @returns Promise resolving to JWT token and save URL
 *
 * @example
 * ```ts
 * const result = await generateGooglePayPass({
 *   username: 'danproctor',
 *   display_name: 'Dan Proctor'
 * });
 * // result.save_url: "https://pay.google.com/gp/v/save/..."
 * ```
 */
export async function generateGooglePayPass(
  devCardData: WalletPassDevCardData
): Promise<GooglePassResult> {
  const config = getPassConfig();

  // Validate Google Pay configuration
  if (!config.googleIssuerId || !config.googleServiceAccountKey) {
    throw new Error(
      'Google Pay pass generation requires GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_SERVICE_ACCOUNT_KEY environment variables'
    );
  }

  try {
    // Import Google Auth library dynamically
    const { GoogleAuth } = await import('google-auth-library');

    // Create service account credentials
    const credentials = JSON.parse(config.googleServiceAccountKey);
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    // Generate unique object ID
    const objectId = `${config.googleIssuerId}.devcard-${devCardData.username}-${Date.now()}`;

    // Create Generic Pass object
    const genericObject = {
      id: objectId,
      classId: `${config.googleIssuerId}.devcard-generic`,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: '#0A0A0A',
      logo: {
        sourceUri: {
          uri: 'https://devius.io/logo.png',
        },
      },
      cardTitle: {
        defaultValue: {
          language: 'en-US',
          value: 'StackPass DevCard',
        },
      },
      header: {
        defaultValue: {
          language: 'en-US',
          value: devCardData.display_name,
        },
      },
      subheader: {
        defaultValue: {
          language: 'en-US',
          value: `@${devCardData.github_username || devCardData.username}`,
        },
      },
      barcode: {
        type: 'QR_CODE',
        value: `https://devius.io/${devCardData.username}`,
      },
      heroImage: {
        sourceUri: {
          uri: devCardData.avatar_url || 'https://devius.io/default-avatar.png',
        },
      },
    };

    // Create JWT claims
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://devius.io'],
      typ: 'savetowallet',
      payload: {
        genericObjects: [genericObject],
      },
    };

    // Sign JWT
    const client = await auth.getClient();
    const token = await client.request({
      url: 'https://walletobjects.googleapis.com/walletobjects/v1/jwt',
      method: 'POST',
      data: claims,
    });

    const jwt = (token.data as { jwt?: string }).jwt;
    if (!jwt) {
      throw new Error('Failed to generate JWT token');
    }

    // Generate save URL
    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;

    return {
      jwt,
      save_url: saveUrl,
    };
  } catch (error) {
    console.error('Failed to generate Google Pay pass:', error);
    throw new Error(
      `Google Pay pass generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate wallet pass based on platform
 *
 * @param platform - 'apple' or 'google'
 * @param devCardData - DevCard profile data
 * @returns Promise resolving to platform-specific pass result
 */
export async function generateWalletPass(
  platform: WalletPlatform,
  devCardData: WalletPassDevCardData
): Promise<ApplePassResult | GooglePassResult> {
  if (platform === 'apple') {
    return generateAppleWalletPass(devCardData);
  } else if (platform === 'google') {
    return generateGooglePayPass(devCardData);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Check if Apple Wallet pass generation is configured
 */
export function isAppleWalletConfigured(): boolean {
  const config = getPassConfig();
  const hasPaths = !!(config.appleCertificatePath && config.appleKeyPath);
  const hasBase64 = !!(config.appleCertificateBase64 && config.appleKeyBase64);
  return hasPaths || hasBase64;
}

/**
 * Check if Google Pay pass generation is configured
 */
export function isGooglePayConfigured(): boolean {
  const config = getPassConfig();
  return !!(config.googleIssuerId && config.googleServiceAccountKey);
}

/**
 * Get available wallet platforms based on configuration
 */
export function getAvailablePlatforms(): WalletPlatform[] {
  const platforms: WalletPlatform[] = [];

  if (isAppleWalletConfigured()) {
    platforms.push('apple');
  }

  if (isGooglePayConfigured()) {
    platforms.push('google');
  }

  return platforms;
}
