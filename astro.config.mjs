import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keithsk9care.co.uk',
  integrations: [
    tailwind(),
    sitemap({
      // Exclude the non-indexable routes from the sitemap: the booking flow (/book, /thanks)
      // and the CMS (/admin — a static public file; belt-and-braces). Everything else is
      // indexable and in the map: home, about, the /services/ + /areas/ hubs and all their
      // detail pages, pricing, faq, reviews, groom-stories, privacy, terms. (404 is excluded
      // automatically.) Keep this in sync with each page's `noindex` prop.
      filter: (page) => {
        const noindex = [
          'https://keithsk9care.co.uk/book/',
          'https://keithsk9care.co.uk/thanks/',
          'https://keithsk9care.co.uk/admin/',
        ];
        return !noindex.includes(page);
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
