// @ts-nocheck
/**
 * Wallet Pass Generator for DevCard
 *
 * Generates Apple Wallet (.pkpass) and Google Pay passes for DevCard profiles.
 * Allows users to save their DevCard to their mobile wallet for easy sharing.
 */

import { PKPass } from 'passkit-generator';
import path from 'path';
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

  // Validate Apple Wallet configuration
  if (!config.appleCertificatePath || !config.appleKeyPath) {
    throw new Error(
      'Apple Wallet pass generation requires APPLE_CERTIFICATE_PATH and APPLE_KEY_PATH environment variables'
    );
  }

  try {
    // Generate QR code for the pass
    const qrBuffer = await generateQRBuffer(devCardData.username, { size: 400 });

    // Create pass instance
    const pass = new PKPass(
      {
        'pass.json': {
          formatVersion: 1,
          passTypeIdentifier: config.applePassTypeIdentifier!,
          serialNumber: `devcard-${devCardData.username}-${Date.now()}`,
          teamIdentifier: config.appleTeamIdentifier || '',
          organizationName: 'StackPass',
          description: `${devCardData.display_name}'s DevCard`,

          // Visual appearance
          logoText: 'StackPass',
          foregroundColor: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(10, 10, 10)',
          labelColor: 'rgb(0, 255, 148)',

          // Pass structure (Generic pass type)
          generic: {
            headerFields: [
              {
                key: 'header',
                label: 'STACKPASS',
                value: devCardData.display_name,
              },
            ],
            primaryFields: [
              {
                key: 'name',
                label: 'Developer',
                value: devCardData.display_name,
              },
            ],
            secondaryFields: [
              {
                key: 'username',
                label: 'Username',
                value: `@${devCardData.github_username || devCardData.username}`,
              },
              ...(devCardData.member_number
                ? [
                    {
                      key: 'member',
                      label: 'Founder',
                      value: `#${String(devCardData.member_number).padStart(3, '0')}`,
                    },
                  ]
                : []),
              ...(devCardData.location
                ? [
                    {
                      key: 'location',
                      label: 'Location',
                      value: devCardData.location,
                    },
                  ]
                : []),
            ],
            auxiliaryFields: [
              {
                key: 'bio',
                label: 'Bio',
                value: devCardData.custom_bio || 'Developer profile on StackPass',
              },
            ],
            backFields: [
              {
                key: 'profile',
                label: 'Profile URL',
                value: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${devCardData.username}`,
              },
              ...(devCardData.social_links?.twitter
                ? [
                    {
                      key: 'twitter',
                      label: 'Twitter',
                      value: devCardData.social_links.twitter,
                    },
                  ]
                : []),
              ...(devCardData.social_links?.linkedin
                ? [
                    {
                      key: 'linkedin',
                      label: 'LinkedIn',
                      value: devCardData.social_links.linkedin,
                    },
                  ]
                : []),
              ...(devCardData.social_links?.website
                ? [
                    {
                      key: 'website',
                      label: 'Website',
                      value: devCardData.social_links.website,
                    },
                  ]
                : []),
            ],
          },

          // Barcode/QR code
          barcodes: [
            {
              message: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackpass.dev'}/${devCardData.username}`,
              format: 'PKBarcodeFormatQR',
              messageEncoding: 'iso-8859-1',
            },
          ],

          // Relevance (optional - can add location-based relevance later)
          relevantDate: new Date().toISOString(),
        },
      },
      {
        signerCert: config.appleCertificatePath,
        signerKey: config.appleKeyPath,
        ...(config.appleWWDRCAPath && { wwdr: config.appleWWDRCAPath }),
      }
    );

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
  return !!(config.appleCertificatePath && config.appleKeyPath);
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
