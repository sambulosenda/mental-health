/**
 * Image Optimization Script for Sleep Story Thumbnails
 *
 * Downloads images from CDN, resizes and compresses them for mobile.
 * Output: ~50-100KB per image instead of ~7MB
 *
 * Usage:
 *   npx ts-node scripts/optimize-images.ts
 *
 * Then upload the optimized images to your CDN:
 *   for f in optimized-images/*.webp; do
 *     npx wrangler r2 object put softmind-audio/sleep-stories/thumbnails/$(basename $f) --file "$f"
 *   done
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';

const CDN_BASE = 'https://pub-cd0bdc36c3ae4d86ac2b9bdaa9b15b48.r2.dev';
const OUTPUT_DIR = path.join(__dirname, '../optimized-images');

const STORY_IDS = [
  'sleep-forest-path',
  'sleep-cloud-float',
  'sleep-rainy-window',
  'sleep-body-release',
  'sleep-ocean-shore',
  'sleep-starlit-voyage',
  'sleep-cabin-fireplace',
  'sleep-train-journey',
  'sleep-mountain-meadow',
  'sleep-bamboo-garden',
  'sleep-autumn-forest',
  'sleep-quiet-lake',
  'sleep-magical-garden',
  'sleep-moon-palace',
  'sleep-underwater-kingdom',
  'sleep-dragons-treasure',
  'sleep-library-nook',
  'sleep-grandmas-quilt',
  'sleep-snowy-afternoon',
  'sleep-treehouse-hideaway',
  'sleep-river-boat',
  'sleep-countryside-drive',
  'sleep-hot-air-balloon',
  'sleep-night-sailing',
  'sleep-breath-journey',
  'sleep-mind-quieting',
  'sleep-counting-down',
  'sleep-tension-melt',
  'sleep-moonlight-path',
  'sleep-aurora-dreams',
  'sleep-stargazing',
  'sleep-cosmic-drift',
];

// Target dimensions for mobile thumbnails (2-column grid)
const TARGET_WIDTH = 400;
const QUALITY = 80;

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function optimizeImage(storyId: string): Promise<void> {
  const inputUrl = `${CDN_BASE}/sleep-stories/images/${storyId}.png`;
  const outputPath = path.join(OUTPUT_DIR, `${storyId}.webp`);

  console.log(`Processing: ${storyId}`);

  try {
    // Download original
    const imageBuffer = await downloadImage(inputUrl);
    const originalSize = imageBuffer.length;

    // Resize and convert to WebP
    const optimized = await sharp(imageBuffer)
      .resize(TARGET_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Save optimized image
    fs.writeFileSync(outputPath, optimized);

    const newSize = optimized.length;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(
      `  ✓ ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024).toFixed(0)}KB (${reduction}% smaller)`
    );
  } catch (error) {
    console.error(`  ✗ Failed: ${error}`);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\nOptimizing ${STORY_IDS.length} images...\n`);
  console.log(`Target: ${TARGET_WIDTH}px width, WebP @ ${QUALITY}% quality\n`);

  for (const storyId of STORY_IDS) {
    await optimizeImage(storyId);
  }

  console.log('\n✓ Done! Optimized images saved to: optimized-images/');
  console.log('\nUpload to CDN with:');
  console.log(
    '  for f in optimized-images/*.webp; do npx wrangler r2 object put softmind-audio/sleep-stories/thumbnails/$(basename $f) --file "$f"; done'
  );
}

main().catch(console.error);
