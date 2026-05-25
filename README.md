# Keith's K9 Care — Astro site

Static site for [keithsk9care.co.uk](https://keithsk9care.co.uk). Built with Astro 5 + Tailwind CSS, deployed to Cloudflare Pages.

## Run locally

You'll need [Node.js 20+](https://nodejs.org/).

```bash
cd keithsk9care-astro
npm install            # one-time, ~30 sec
npm run dev            # http://localhost:4321
```

Edit any file and the browser auto-refreshes. To preview the production build:

```bash
npm run build          # static HTML into /dist
npm run preview        # serves /dist on :4322
```

## Edit content

See **[CONTENT.md](./CONTENT.md)**. Most edits are JSON files in `src/data/`; no need to touch component code for routine updates.

## Project layout

```
src/
├── data/                    JSON content (site.json, services, areas, faqs)
├── components/              Nav, Footer, WhatsApp, Sticky CTA, Home* sections
├── layouts/Layout.astro     head meta + LocalBusiness JSON-LD + body shell
├── pages/                   one .astro per URL
├── content/blog/*.md        blog posts (after research)
└── styles/global.css
public/assets/               photos, logos, favicons
```

## Deploy

Push to `main` on GitHub → Cloudflare Pages auto-deploys.

```bash
git add -A
git commit -m "Update content"
git push
```

Production URL: https://keithsk9care.co.uk

## Stack

- [Astro](https://astro.build/) — static site generator
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — generates `/sitemap-index.xml`
