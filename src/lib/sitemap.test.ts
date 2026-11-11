import { describe, expect, it } from 'vitest';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('writes absolute, escaped locations', () => {
    expect(buildSitemap([{ path: '/a&b' }])).toContain(
      '<loc>https://shetu.iamnahid.com/a&amp;b</loc>',
    );
  });

  it('formats lastmod as a date', () => {
    expect(
      buildSitemap([{ path: '/', lastmod: '2026-11-05T09:00:00Z' }]),
    ).toContain('<lastmod>2026-11-05</lastmod>');
  });

  it('sorts entries by path', () => {
    const xml = buildSitemap([{ path: '/b' }, { path: '/a' }]);
    expect(xml.indexOf('/a<')).toBeLessThan(xml.indexOf('/b<'));
  });
});
