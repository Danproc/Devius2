/**
 * Script to invalidate all QR code caches
 * Run with: npx tsx scripts/invalidate-qr-cache.ts
 */

import { db } from '../src/db';
import { devcards } from '../src/db/schema/devcard';

async function invalidateAllQRCaches() {
  try {
    console.log('🔄 Starting QR code cache invalidation...\n');

    // Check if Vercel KV is available
    const kvAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    
    if (!kvAvailable) {
      console.log('⚠️  Vercel KV not configured - QR codes are not cached');
      console.log('   QR codes will regenerate with new domain on next request\n');
      return;
    }

    const { kv } = await import('@vercel/kv');

    // Get all devcards
    const allDevcards = await db.select({ url_slug: devcards.url_slug }).from(devcards);
    
    console.log(`📊 Found ${allDevcards.length} StackPass profiles\n`);

    // Common QR code sizes
    const commonSizes = [200, 400, 800, 1000];
    
    let deletedCount = 0;
    
    for (const devcard of allDevcards) {
      const keys = commonSizes.map(size => `qr:${devcard.url_slug}:${size}`);
      
      for (const key of keys) {
        try {
          await kv.del(key);
          deletedCount++;
        } catch (error) {
          // Key might not exist, that's okay
        }
      }
      
      process.stdout.write(`\r✓ Processed ${allDevcards.indexOf(devcard) + 1}/${allDevcards.length}`);
    }
    
    console.log(`\n\n✅ Successfully invalidated ${deletedCount} cached QR codes`);
    console.log('🎯 QR codes will regenerate with stackpass.dev domain on next request\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

invalidateAllQRCaches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
