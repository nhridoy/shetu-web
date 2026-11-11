// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { SITE_URL } from './src/lib/seo.ts';

export default defineConfig({
  // Public origin for canonical, Open Graph and robots URLs (sitemap: src/pages/sitemap.xml.ts).
  site: SITE_URL,
  output: 'static',
  // URLs without trailing slash (/download), matching every internal link.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
