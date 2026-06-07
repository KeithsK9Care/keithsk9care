/**
 * Length-aware SEO <title> builder.
 *
 * Appends the richest differentiator tail that still keeps the HTML-encoded title
 * within the SERP budget (≤63 chars, an "&" encodes to "&amp;" = 5 chars, per the
 * RVTC SOP §3.7 QA trap), so titles land in the ~50–63 sweet spot and never blow
 * past the 65 hard cap. Falls back to the brand suffix only if nothing fits
 * (e.g. a long name like "Nail Trim, Ear Clean & Tidy").
 */
const BRAND = " | Keith's K9 Care";

const encodedLength = (value: string): number => value.replace(/&/g, "&amp;").length;

export function seoTitle(base: string, tails: string[] = []): string {
  for (const tail of [...tails, ""]) {
    const candidate = `${base}${tail}${BRAND}`;
    if (encodedLength(candidate) <= 63) return candidate;
  }
  return `${base}${BRAND}`;
}
