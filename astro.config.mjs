// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  console.warn(
    '[terra-web] SITE_URL is not set. Canonical, Open Graph, sitemap, and robots URLs will use http://localhost:4321. Set SITE_URL before a production build.',
  );
}
const site = siteUrl ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
