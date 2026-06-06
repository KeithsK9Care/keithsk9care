// generate-photo-variants.mjs
//
// Runs automatically before `astro build` (see package.json "build"). Scans
// /public/assets/photos/ and, for every "original" image, ensures the optimised,
// responsive variants exist:
//   <base>.webp / <base>.avif          full-size companions, capped at 2000px longest edge
//   <base>-{400,800,1200,1600}.jpg     responsive JPEG ladder
//   <base>-{400,800,1200,1600}.webp    responsive WebP ladder
//   <base>-{400,800,1200,1600}.avif    responsive AVIF ladder
//
// Every chain is .rotate()'d so EXIF orientation from phone photos is baked in
// (no sideways images), and full-size companions are resize-capped so a 4000px
// camera upload never ships at full resolution. A width is only emitted when the
// original is at least that wide, so a -1600 variant is never a mislabelled
// upscale. Idempotent — existing files are skipped, so it is cheap on every build.
// This is the engine behind the Sveltia image widget: Keith uploads a photo
// through the CMS, Cloudflare Pages rebuilds, this script generates the variants,
// and Picture.astro serves them responsively.

import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = join(process.cwd(), 'public', 'assets', 'photos');
const SIZES = [400, 800, 1200, 1600];                 // responsive widths to emit
const FULL_CAP = 2000;                                // cap full-size companion's longest edge
const VARIANT_SUFFIX_RE = /-(?:400|800|1200|1600)$/;  // skip files that already are variants
const SUPPORTED_INPUT = new Set(['.jpg', '.jpeg', '.png']);

async function main() {
  let entries;
  try {
    entries = await readdir(PHOTOS_DIR);
  } catch {
    console.warn(`[photos] ${PHOTOS_DIR} not found — nothing to do.`);
    return;
  }

  const originals = [];
  for (const name of entries) {
    const { name: base, ext } = parse(name);
    if (!SUPPORTED_INPUT.has(ext.toLowerCase())) continue;  // ignore .webp/.avif + others
    if (VARIANT_SUFFIX_RE.test(base)) continue;             // ignore -400/-800/... files
    originals.push({ name, base });
  }

  let generated = 0;
  let skipped = 0;
  const make = async (outPath, build) => {
    if (existsSync(outPath)) { skipped++; return; }
    try { await build(); generated++; console.log(`[photos] generated ${parse(outPath).base}`); }
    catch (err) { console.warn(`[photos] FAILED ${parse(outPath).base}: ${err.message}`); }
  };

  for (const { name, base } of originals) {
    const inputPath = join(PHOTOS_DIR, name);
    // .rotate() (no args) bakes in EXIF orientation; read post-rotation width so we
    // never emit a width larger than the source (which would be a mislabelled upscale).
    const meta = await sharp(inputPath).rotate().metadata().catch(() => ({}));
    const originalWidth = meta.width || Infinity;

    // Full-size companions — EXIF-rotated and capped at FULL_CAP so huge uploads don't ship raw.
    await make(join(PHOTOS_DIR, `${base}.webp`), () =>
      sharp(inputPath).rotate().resize({ width: FULL_CAP, height: FULL_CAP, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(PHOTOS_DIR, `${base}.webp`)));
    await make(join(PHOTOS_DIR, `${base}.avif`), () =>
      sharp(inputPath).rotate().resize({ width: FULL_CAP, height: FULL_CAP, fit: 'inside', withoutEnlargement: true }).avif({ quality: 55 }).toFile(join(PHOTOS_DIR, `${base}.avif`)));

    // Responsive ladder — only widths the original can actually supply.
    for (const w of SIZES) {
      if (w > originalWidth) continue;
      await make(join(PHOTOS_DIR, `${base}-${w}.jpg`), () =>
        sharp(inputPath).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 78, progressive: true }).toFile(join(PHOTOS_DIR, `${base}-${w}.jpg`)));
      await make(join(PHOTOS_DIR, `${base}-${w}.webp`), () =>
        sharp(inputPath).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toFile(join(PHOTOS_DIR, `${base}-${w}.webp`)));
      await make(join(PHOTOS_DIR, `${base}-${w}.avif`), () =>
        sharp(inputPath).rotate().resize({ width: w, withoutEnlargement: true }).avif({ quality: 50 }).toFile(join(PHOTOS_DIR, `${base}-${w}.avif`)));
    }
  }

  console.log(`[photos] done. ${originals.length} originals, ${generated} variants generated, ${skipped} already present.`);
}

main().catch((err) => {
  console.error('[photos] fatal:', err);
  process.exit(1);
});
