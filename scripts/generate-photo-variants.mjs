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
// original is at least that wide, so a -1600 variant is never a mislabelled upscale.
//
// HEIC/HEIF (the iPhone default) is decoded up-front with heic-convert — which works
// regardless of whether the build image's libvips has libheif — and also gets a
// canonical <base>.jpg written, because .heic is not browser-displayable and
// Picture.astro falls back to <stub>.jpg. So a Keith CMS upload in any of
// jpg/jpeg/png/heic/heif is auto-optimised; nothing is silently dropped.
//
// Idempotent — existing files are skipped, so it is cheap on every build.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = join(process.cwd(), 'public', 'assets', 'photos');
const SIZES = [400, 800, 1200, 1600];                 // responsive widths to emit
const FULL_CAP = 2000;                                // cap full-size companion's longest edge
const VARIANT_SUFFIX_RE = /-(?:400|800|1200|1600)$/;  // skip files that already are variants
const RASTER_INPUT = new Set(['.jpg', '.jpeg', '.png']);
const HEIC_INPUT = new Set(['.heic', '.heif']);

// A sharp-usable source for an original: the path for normal rasters, or a decoded
// JPEG Buffer for HEIC/HEIF. heic-convert is a pure-JS/WASM decoder, so it does not
// depend on the platform's libvips having libheif.
async function loadSource(inputPath, ext) {
  if (HEIC_INPUT.has(ext)) {
    const { default: convert } = await import('heic-convert');
    return convert({ buffer: await readFile(inputPath), format: 'JPEG', quality: 0.92 });
  }
  return inputPath;
}

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
    const e = ext.toLowerCase();
    if (!RASTER_INPUT.has(e) && !HEIC_INPUT.has(e)) continue;  // ignore .webp/.avif + others
    if (VARIANT_SUFFIX_RE.test(base)) continue;                // ignore -400/-800/... files
    originals.push({ name, base, ext: e });
  }

  let generated = 0;
  let skipped = 0;
  const make = async (outPath, build) => {
    if (existsSync(outPath)) { skipped++; return; }
    try { await build(); generated++; console.log(`[photos] generated ${parse(outPath).base}`); }
    catch (err) { console.warn(`[photos] FAILED ${parse(outPath).base}: ${err.message}`); }
  };

  for (const { name, base, ext } of originals) {
    const inputPath = join(PHOTOS_DIR, name);
    let source;
    try {
      source = await loadSource(inputPath, ext);  // path, or decoded JPEG Buffer for HEIC
    } catch (err) {
      console.warn(`[photos] could not read ${name}: ${err.message}`);
      continue;
    }
    const isHeic = HEIC_INPUT.has(ext);

    // .rotate() bakes in EXIF orientation; read post-rotation width so we never emit
    // a width larger than the source (which would be a mislabelled upscale).
    const meta = await sharp(source).rotate().metadata().catch(() => ({}));
    const originalWidth = meta.width || Infinity;

    // HEIC/HEIF is not browser-displayable, so write a canonical <base>.jpg fallback.
    if (isHeic) {
      await make(join(PHOTOS_DIR, `${base}.jpg`), () =>
        sharp(source).rotate().resize({ width: FULL_CAP, height: FULL_CAP, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, progressive: true }).toFile(join(PHOTOS_DIR, `${base}.jpg`)));
    }

    // Full-size companions — EXIF-rotated and capped at FULL_CAP so huge uploads don't ship raw.
    await make(join(PHOTOS_DIR, `${base}.webp`), () =>
      sharp(source).rotate().resize({ width: FULL_CAP, height: FULL_CAP, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(PHOTOS_DIR, `${base}.webp`)));
    await make(join(PHOTOS_DIR, `${base}.avif`), () =>
      sharp(source).rotate().resize({ width: FULL_CAP, height: FULL_CAP, fit: 'inside', withoutEnlargement: true }).avif({ quality: 55 }).toFile(join(PHOTOS_DIR, `${base}.avif`)));

    // Responsive ladder — only widths the original can actually supply.
    for (const w of SIZES) {
      if (w > originalWidth) continue;
      await make(join(PHOTOS_DIR, `${base}-${w}.jpg`), () =>
        sharp(source).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 78, progressive: true }).toFile(join(PHOTOS_DIR, `${base}-${w}.jpg`)));
      await make(join(PHOTOS_DIR, `${base}-${w}.webp`), () =>
        sharp(source).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toFile(join(PHOTOS_DIR, `${base}-${w}.webp`)));
      await make(join(PHOTOS_DIR, `${base}-${w}.avif`), () =>
        sharp(source).rotate().resize({ width: w, withoutEnlargement: true }).avif({ quality: 50 }).toFile(join(PHOTOS_DIR, `${base}-${w}.avif`)));
    }
  }

  console.log(`[photos] done. ${originals.length} originals, ${generated} variants generated, ${skipped} already present.`);
}

main().catch((err) => {
  console.error('[photos] fatal:', err);
  process.exit(1);
});
