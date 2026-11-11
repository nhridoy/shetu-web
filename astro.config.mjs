// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Public origin for canonical, Open Graph, sitemap and robots URLs.
  site: 'https://terra.iamnahid.com',
  output: 'static',
  // URLs without trailing slash (/download), matching every internal link.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
