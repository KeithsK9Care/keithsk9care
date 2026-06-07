import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolve the social-share (og:image) for a per-entry detail page at BUILD time.
 *
 * Prefers the pre-generated branded 1200×630 card. If that card doesn't exist
 *, e.g. a service or area added via the CMS that no one has generated a card
 * for yet, it falls back to the entry's own hero photo, then to the default
 * branded card. The result: a newly CMS-created entry never emits a broken /
 * 404 social-share image; it just gets a sensible branded fallback instead.
 *
 * Runs in Node during `astro build` (static generation), so `fs` is available.
 */
export function ogImageFor(
  kind: 'services' | 'areas',
  slug: string,
  fallbackPhoto?: string,
): string {
  const card = `/assets/og/${kind}/${slug}.jpg`;
  try {
    if (fs.existsSync(path.resolve('public' + card))) return card;
  } catch {
    // ignore filesystem errors and fall through to the fallback
  }
  return fallbackPhoto || '/assets/og/default.jpg';
}
