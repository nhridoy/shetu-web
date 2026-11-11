import { describe, expect, it } from 'vitest';
import type { Release } from './releases';
import {
  breadcrumbJsonLd,
  ogImagePath,
  PAGES,
  siteJsonLd,
  softwareJsonLd,
} from './seo';
import { REPOS } from './site';

const release = { tag_name: 'v0.0.15' } as Release;

describe('page metadata', () => {
  it('keeps every title within 30 to 60 characters', () => {
    for (const { title } of Object.values(PAGES)) {
      expect(title.length, title).toBeGreaterThanOrEqual(30);
      expect(title.length, title).toBeLessThanOrEqual(60);
    }
  });

  it('keeps every description within 110 to 160 characters', () => {
    for (const { description } of Object.values(PAGES)) {
      expect(description.length, description).toBeGreaterThanOrEqual(110);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  it('maps page paths to share images', () => {
    expect(ogImagePath('/')).toBe('/og/index.png');
    expect(ogImagePath('/download/linux')).toBe('/og/download/linux.png');
  });
});

describe('structured data', () => {
  it('numbers breadcrumbs from 1 with absolute URLs', () => {
    const crumbs = breadcrumbJsonLd([
      { name: 'Docs', path: '/docs' },
      { name: 'Security', path: '/docs/security' },
    ]) as unknown as { itemListElement: { position: number; item: string }[] };
    expect(crumbs.itemListElement.map((c) => c.position)).toEqual([1, 2, 3]);
    for (const c of crumbs.itemListElement) {
      expect(c.item.startsWith('https://terra.iamnahid.com/')).toBe(true);
    }
  });

  it('describes the app as free without a rating', () => {
    const app = softwareJsonLd(release, 'linux') as unknown as Record<
      string,
      unknown
    >;
    expect((app.offers as { price: string }).price).toBe('0');
    expect(app.operatingSystem).toBe('Linux');
    expect(app.softwareVersion).toBe('v0.0.15');
    expect(app).not.toHaveProperty('aggregateRating');
  });

  it('links the organization to its repositories', () => {
    const org = siteJsonLd().find(
      (node) => (node as { '@type': string })['@type'] === 'Organization',
    ) as unknown as { sameAs: string[] };
    expect(org.sameAs).toEqual(Object.values(REPOS));
  });
});
