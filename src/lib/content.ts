/**
 * Content loader for the per-entry folder collections.
 *
 * Each folder under src/data/<collection>/ holds one JSON file per entry (managed
 * in the CMS as a folder collection). This module globs them into ready-to-use,
 * sorted arrays so pages and components import a single named list, exactly as
 * they did when the data lived in one big array file.
 *
 * Ordering:
 *   services / areas / faqs  , by an explicit `order` field (editable in the CMS)
 *   reviews / groom-stories  , newest first, by `date`
 */

type Entry = Record<string, any>;

const collect = (glob: Record<string, any>): Entry[] =>
  Object.values(glob).map((m: any) => (m && m.default !== undefined ? m.default : m));

const byOrder = (a: Entry, b: Entry) => (a.order ?? 999) - (b.order ?? 999);
const byDateDesc = (a: Entry, b: Entry) => String(b.date ?? '').localeCompare(String(a.date ?? ''));

export const services: Entry[] = collect(
  import.meta.glob('../data/services/*.json', { eager: true }),
).sort(byOrder);

export const areas: Entry[] = collect(
  import.meta.glob('../data/areas/*.json', { eager: true }),
).sort(byOrder);

export const faqs: Entry[] = collect(
  import.meta.glob('../data/faqs/*.json', { eager: true }),
).sort(byOrder);

export const reviews: Entry[] = collect(
  import.meta.glob('../data/reviews/*.json', { eager: true }),
).sort(byDateDesc);

export const stories: Entry[] = collect(
  import.meta.glob('../data/groom-stories/*.json', { eager: true }),
).sort(byDateDesc);
