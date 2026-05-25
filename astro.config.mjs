import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://keithsk9care.co.uk',
  integrations: [tailwind(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
