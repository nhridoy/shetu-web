import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { PAGES } from './seo';

/** Square PNG of the logo (public/favicon.svg) for home screens and manifests. */
export function renderIcon(size: number): Promise<Buffer> {
  const svg = readFileSync(join(process.cwd(), 'public/favicon.svg'));
  return sharp(svg, { density: 300 }).resize(size, size).png().toBuffer();
}

export function buildManifest() {
  return {
    name: 'Terra',
    short_name: 'Terra',
    description: PAGES['/'].description,
    start_url: '/',
    display: 'browser',
    background_color: '#07070A',
    theme_color: '#07070A',
    icons: [192, 512].map((size) => ({
      src: `/icons/${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    })),
  };
}
