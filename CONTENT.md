# Content edits — quick guide

Most everyday changes only need editing one of the JSON files in `src/data/`. After editing, run `npm run build` to sanity-check, then commit + push — Cloudflare Pages will rebuild and deploy.

## Common edits

### Change phone, email, address, opening hours
→ `src/data/site.json`. One source of truth — updates everywhere (nav, footer, schema, contact CTA).

### Update prices
→ `src/data/services.json`. Each service has a `fromPrice` and `tiers` array. Pricing shows on the homepage teaser, the `/pricing/` page, the relevant service page, and in the JSON-LD Offer schema.

### Add or edit an area page
→ `src/data/areas.json`. Adding a new entry creates a new area page automatically at `/areas/<slug>/`.

### Add or edit FAQs
→ `src/data/faqs.json`. Each FAQ has a `tags` array (`home`, `puppy`, `nervous`, `pricing`, etc.). Tags control which pages an FAQ appears on.

### Replace a homepage photo
→ Drop the new .jpg/.webp into `public/assets/photos/` matching the existing filename, or change the filename in the relevant component.

### Edit page copy
→ The homepage is in `src/pages/index.astro`. Service pages, area pages, etc. live under `src/pages/`.

## Brand colours

- Teal `#1899B5` (wordmark) — Tailwind: `teal-500`, `teal-600`, `teal-700`
- Coral `#F26522` (paw print) — Tailwind: `coral-500`, `coral-600`
- WhatsApp green `#25D366` — Tailwind: `whatsapp`

## Schema (SEO)

`Layout.astro` injects a sitewide `LocalBusiness` + `AnimalCareService` JSON-LD block sourced from `site.json` + `services.json`. Pages can inject extra schema via `<script slot="head" type="application/ld+json">`.
