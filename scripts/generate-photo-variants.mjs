// generate-photo-variants.mjs
//
// Runs automatically before `astro build`. Scans /public/assets/photos/ and,
// for every "original" image (no -800 / -1200 suffix), ensures the optimised
// variants exist:
//   <base>.webp          (full-size WebP next to the original JPG/PNG)
//   <base>-800.jpg       (responsive JPG)
//   <base>-800.webp      (responsive WebP)
//
// Idempotent — files that already exist are skipped, so the script is cheap to
// run on every build. This is the engine behind the Sveltia image widget: Keith
// uploads a phone photo through the CMS, hits save, Cloudflare Pages rebuilds,
// this script generates the variants, and Picture.astro picks them up.

import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = join(process.cwd(), 'public', 'assets', 'photos');
const SIZES = [800];                       // responsive widths to emit
const VARIANT_SUFFIX_RE = /-(?:800|1200|1600)$/;  // skip files that already are variants
const SUPPORTED_INPUT = new Set(['.jpg', '.jpeg', '.png']);

async function main() {
  let entries;
  try {
    entries = await readdir(PHOTOS_DIR);
  } catch (err) {
    console.warn(`[photos] ${PHOTOS_DIR} not found — nothing to do.`);
    return;
  }

  const originals = [];
  for (const name of entries) {
    const { name: base, ext } = parse(name);
    if (!SUPPORTED_INPUT.has(ext.toLowerCase())) continue;  // ignore .webp + others
    if (VARIANT_SUFFIX_RE.test(base)) continue;             // ignore -800 / -1200 files
    originals.push({ name, base, ext: ext.toLowerCase() });
  }

  let generated = 0;
  let skipped = 0;

  for (const { name, base, ext } of originals) {
    const inputPath = join(PHOTOS_DIR, name);

    // Full-size WebP companion (lets us serve WebP on the page even for the unsuffixed version)
    const fullWebpPath = join(PHOTOS_DIR, `${base}.webp`);
    if (!existsSync(fullWebpPath)) {
      try {
        await sharp(inputPath).webp({ quality: 80 }).toFile(fullWebpPath);
        console.log(`[photos] generated ${base}.webp`);
        generated++;
      } catch (err) {
        console.warn(`[photos] FAILED ${base}.webp: ${err.message}`);
      }
    } else { skipped++; }

    // Sized responsive variants
    for (const w of SIZES) {
      const jpgPath  = join(PHOTOS_DIR, `${base}-${w}.jpg`);
      const webpPath = join(PHOTOS_DIR, `${base}-${w}.webp`);
      if (!existsSync(jpgPath)) {
        try {
          await sharp(inputPath).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 78, progressive: true }).toFile(jpgPath);
          console.log(`[photos] generated ${base}-${w}.jpg`);
          generated++;
        } catch (err) {
          console.warn(`[photos] FAILED ${base}-${w}.jpg: ${err.message}`);
        }
      } else { skipped++; }
      if (!existsSync(webpPath)) {
        try {
          await sharp(inputPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toFile(webpPath);
          console.log(`[photos] generated ${base}-${w}.webp`);
          generated++;
        } catch (err) {
          console.warn(`[photos] FAILED ${base}-${w}.webp: ${err.message}`);
        }
      } else { skipped++; }
    }
  }

  console.log(`[photos] done. ${originals.length} originals, ${generated} variants generated, ${skipped} already present.`);
}

main().catch((err) => {
  console.error('[photos] fatal:', err);
  process.exit(1);
});
