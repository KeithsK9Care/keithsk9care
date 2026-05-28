import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keithsk9care.co.uk',
  integrations: [
    tailwind(),
    sitemap({
      // Only the homepage is fully launch-ready; placeholders are noindex
      // and shouldn't appear in the sitemap until they're built out.
      filter: (page) => page === 'https://keithsk9care.co.uk/',
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
