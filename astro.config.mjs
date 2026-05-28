import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keithsk9care.co.uk',
  integrations: [
    tailwind(),
    sitemap({
      // Exclude pages that are still noindex'd placeholders (/pricing, /book, /areas).
      // All other pages — home, about, faq, services index + 6 detail pages — are indexable.
      filter: (page) => {
        const noindex = [
          'https://keithsk9care.co.uk/pricing/',
          'https://keithsk9care.co.uk/book/',
          'https://keithsk9care.co.uk/areas/',
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
