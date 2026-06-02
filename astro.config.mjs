import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keithsk9care.co.uk',
  integrations: [
    tailwind(),
    sitemap({
      // Exclude the noindex routes from the sitemap: /book and /thanks (booking flow),
      // /areas (placeholder hub — flip to indexable once the area detail pages ship), and
      // /admin (CMS). Keep this list in sync with the `noindex` array below. All other
      // routes (home, about, faq, services index + 6 detail pages, pricing, reviews,
      // groom-stories, privacy, terms) are indexable.
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
