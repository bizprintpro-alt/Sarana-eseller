/**
 * eseller.mn — Vercel Blob Upload Test
 * Usage: npx tsx scripts/test-upload.ts
 */

import 'dotenv/config';
import { put, del } from '@vercel/blob';

async function main() {
  console.log('\n🧪 Vercel Blob upload тест...\n');

  // Create a tiny 1x1 red PNG (68 bytes)
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAH+QL/hc2rNAAAAABJRU5ErkJggg==',
    'base64'
  );

  const filename = `test/upload-test-${Date.now()}.png`;

  try {
    // 1. Upload
    console.log('📤 Upload хийж байна...');
    const blob = await put(filename, pngBytes, { access: 'public' });
    console.log(`✅ Upload: ${blob.url}`);
    console.log(`   Size: ${pngBytes.length} bytes`);

    // 2. Verify fetch
    console.log('\n🔍 URL шалгаж байна...');
    const res = await fetch(blob.url);
    console.log(`✅ Fetch: ${res.status} ${res.statusText} (${res.headers.get('content-length') || '?'} bytes)`);

    // 3. Cleanup
    console.log('\n🗑️ Устгаж байна...');
    await del(blob.url);
    console.log('✅ Delete: cleaned up');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Vercel Blob ажиллаж байна — production бэлэн!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Алдаа:', (error as Error).message);
    console.log('\n💡 BLOB_READ_WRITE_TOKEN .env.local-д байгаа эсэхийг шалгана уу');
    process.exit(1);
  }
}

main();
