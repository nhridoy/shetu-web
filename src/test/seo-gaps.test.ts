// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import snapshot from '../data/releases.json';
import { releasePageMeta, renderNotes } from '../lib/changelog';
import type { Release } from '../lib/releases';
import { breadcrumbJsonLd, PAGES } from '../lib/seo';

const read = (path: string) => readFileSync(path, 'utf8');

describe('permanent redirects for old URLs', () => {
  const rules = read('public/_redirects');

  it.each([
    '/download/ /download 301',
    '/docs/ /docs 301',
    '/docs/:slug/ /docs/:slug 301',
    '/security/ /security 301',
    '/community/ /community 301',
    '/sitemap-index.xml /sitemap.xml 301',
  ])('has %s', (rule) => {
    expect(rules).toContain(rule);
  });
});

describe('titles of 50 to 60 characters', () => {
  it('for every registered page', () => {
    for (const { title } of Object.values(PAGES)) {
      expect(title.length, title).toBeGreaterThanOrEqual(50);
      expect(title.length, title).toBeLessThanOrEqual(60);
    }
  });

  it('for every docs page', () => {
    for (const file of readdirSync('src/content/docs')) {
      const seoTitle = read(`src/content/docs/${file}`).match(
        /^seoTitle: "?([^"\n]+)"?$/m,
      )?.[1];
      expect(seoTitle, file).toBeDefined();
      expect(seoTitle?.length, file).toBeGreaterThanOrEqual(50);
      expect(seoTitle?.length, file).toBeLessThanOrEqual(60);
    }
  });

  it('for every release page', () => {
    for (const release of snapshot.releases as Release[]) {
      const { title } = releasePageMeta(release);
      expect(title.length, title).toBeGreaterThanOrEqual(50);
      expect(title.length, title).toBeLessThanOrEqual(60);
    }
  });
});

describe('page structure', () => {
  it('starts every breadcrumb trail at Home', () => {
    const crumbs = breadcrumbJsonLd([
      { name: 'Self-hosted', path: '/self-hosted' },
    ]) as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement).toHaveLength(2);
    expect(crumbs.itemListElement[0]).toMatchObject({
      name: 'Home',
      item: 'https://terra.iamnahid.com/',
    });
  });

  it('nests release-note headings under the page heading', () => {
    const html = renderNotes('## Highlights\n\nText\n\n### Fixes\n\nMore');
    expect(html).toContain('<h3>Highlights</h3>');
    expect(html).toContain('<h4>Fixes</h4>');
    expect(html).not.toContain('<h2');
  });

  it('gives each changelog link a unique name', () => {
    expect(read('src/pages/changelog.astro')).toMatch(
      /Notes and downloads\s*<span class="sr-only">/,
    );
  });

  it('loads the Fontshare stylesheet without blocking rendering', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    // The <noscript> fallback may block; it only applies without JavaScript.
    const scripted = layout.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    expect(scripted).not.toMatch(
      /rel="stylesheet"\s+href="https:\/\/api\.fontshare/,
    );
    expect(layout).toContain('rel="preload"');
    expect(layout).toContain('<noscript>');
  });
});
