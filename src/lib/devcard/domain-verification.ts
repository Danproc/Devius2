/**
 * DNS Domain Verification
 *
 * Utilities for verifying custom domain ownership via DNS records
 */

import { db } from '@/db';
import { devcards } from '@/db/schema/devcard';
import { eq } from 'drizzle-orm';
import { Resolver } from 'dns/promises';

/**
 * Verify domain ownership by checking DNS TXT record
 *
 * Expected TXT record format:
 * Name: _devcard-verify.yourdomain.com
 * Value: devcard-site-verification=<devcard-id>
 */
export async function verifyDomainOwnership(
  devcardId: string,
  domain: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    // Normalize domain (remove protocol, trailing slash, etc.)
    const normalizedDomain = normalizeDomain(domain);

    if (!normalizedDomain) {
      return {
        verified: false,
        error: 'Invalid domain format',
      };
    }

    // Build the verification record name
    const verificationRecordName = `_devcard-verify.${normalizedDomain}`;
    const expectedValue = `devcard-site-verification=${devcardId}`;

    console.log('[DNS Verification] Checking TXT record:', {
      domain: normalizedDomain,
      recordName: verificationRecordName,
      expectedValue,
    });

    // Query DNS TXT records
    const txtRecords = await queryTxtRecords(verificationRecordName);

    console.log('[DNS Verification] Found TXT records:', txtRecords);

    // Check if any record matches the expected value
    const verified = txtRecords.some((record) =>
      record.trim().toLowerCase() === expectedValue.toLowerCase()
    );

    if (verified) {
      console.log('[DNS Verification] ✅ Domain verified successfully');

      // Update the database
      await db
        .update(devcards)
        .set({
          custom_domain_verified: true,
          updated_at: new Date(),
        })
        .where(eq(devcards.id, devcardId));

      return { verified: true };
    } else {
      console.log('[DNS Verification] ❌ Verification failed - TXT record not found or incorrect');
      return {
        verified: false,
        error: 'TXT record not found or incorrect. Please check your DNS configuration.',
      };
    }
  } catch (error: any) {
    console.error('[DNS Verification] Error:', error);

    // Handle common DNS errors
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        verified: false,
        error: 'DNS record not found. It may take up to 24 hours for DNS changes to propagate.',
      };
    }

    if (error.code === 'ETIMEOUT') {
      return {
        verified: false,
        error: 'DNS query timed out. Please try again later.',
      };
    }

    return {
      verified: false,
      error: error.message || 'Failed to verify domain ownership',
    };
  }
}

/**
 * Query DNS TXT records for a given domain
 */
async function queryTxtRecords(domain: string): Promise<string[]> {
  const resolver = new Resolver();

  try {
    const records = await resolver.resolveTxt(domain);

    // Flatten the 2D array returned by resolveTxt
    // Each TXT record is an array of strings (for records split across multiple strings)
    return records.map((record) => record.join(''));
  } catch (error: any) {
    // Re-throw with more context
    throw error;
  }
}

/**
 * Normalize a domain name
 * - Remove protocol (http://, https://)
 * - Remove trailing slashes
 * - Remove www. prefix (optional)
 * - Convert to lowercase
 */
export function normalizeDomain(domain: string): string | null {
  if (!domain) return null;

  try {
    // Remove protocol
    let normalized = domain.replace(/^https?:\/\//, '');

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');

    // Remove path if any
    normalized = normalized.split('/')[0];

    // Remove port if any
    normalized = normalized.split(':')[0];

    // Convert to lowercase
    normalized = normalized.toLowerCase();

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

    if (!domainRegex.test(normalized)) {
      return null;
    }

    return normalized;
  } catch (error) {
    console.error('[Domain Normalization] Error:', error);
    return null;
  }
}

/**
 * Check if a domain is available (not already in use by another DevCard)
 */
export async function isDomainAvailable(domain: string, excludeDevcardId?: string): Promise<boolean> {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return false;
  }

  try {
    const existingCards = await db
      .select({ id: devcards.id })
      .from(devcards)
      .where(eq(devcards.custom_domain, normalizedDomain));

    // If excluding a specific devcard (for updates), filter it out
    const conflictingCards = excludeDevcardId
      ? existingCards.filter((card) => card.id !== excludeDevcardId)
      : existingCards;

    return conflictingCards.length === 0;
  } catch (error) {
    console.error('[Domain Availability Check] Error:', error);
    return false;
  }
}

/**
 * Update custom domain for a DevCard
 */
export async function updateCustomDomain(
  devcardId: string,
  domain: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (domain) {
      // Normalize the domain
      const normalizedDomain = normalizeDomain(domain);

      if (!normalizedDomain) {
        return {
          success: false,
          error: 'Invalid domain format',
        };
      }

      // Check if domain is available
      const available = await isDomainAvailable(normalizedDomain, devcardId);

      if (!available) {
        return {
          success: false,
          error: 'This domain is already in use by another DevCard',
        };
      }

      // Update the database
      await db
        .update(devcards)
        .set({
          custom_domain: normalizedDomain,
          custom_domain_verified: false, // Reset verification status
          updated_at: new Date(),
        })
        .where(eq(devcards.id, devcardId));
    } else {
      // Remove custom domain
      await db
        .update(devcards)
        .set({
          custom_domain: null,
          custom_domain_verified: false,
          updated_at: new Date(),
        })
        .where(eq(devcards.id, devcardId));
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Update Custom Domain] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update custom domain',
    };
  }
}

/**
 * Get DevCard by custom domain
 */
export async function getDevCardByCustomDomain(domain: string) {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return null;
  }

  try {
    const [devcard] = await db
      .select()
      .from(devcards)
      .where(eq(devcards.custom_domain, normalizedDomain))
      .limit(1);

    return devcard || null;
  } catch (error) {
    console.error('[Get DevCard by Custom Domain] Error:', error);
    return null;
  }
}
