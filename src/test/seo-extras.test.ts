// @vitest-environment node
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import snapshot from '../data/releases.json';
import { buildRss } from '../lib/feed';
import { buildManifest, renderIcon } from '../lib/icons';
import type { Release } from '../lib/releases';
import { techArticleJsonLd } from '../lib/seo';
import { gitLastModified, pageSourceFile } from '../lib/sitemap';

const read = (path: string) => readFileSync(path, 'utf8');
const releases = snapshot.releases as Release[];

describe('home-screen icons', () => {
  it.each([180, 192, 512])(
    'renders a %ipx square PNG from the logo',
    async (size) => {
      const meta = await sharp(await renderIcon(size)).metadata();
      expect([meta.format, meta.width, meta.height]).toEqual([
        'png',
        size,
        size,
      ]);
    },
  );

  it('describes the site in a web app manifest', () => {
    const manifest = buildManifest();
    expect(manifest.name).toBe('Terra');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons.map((i) => i.sizes)).toEqual(['192x192', '512x512']);
  });

  it('links the icons and manifest from every page', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toContain('rel="apple-touch-icon"');
    expect(layout).toContain('rel="manifest"');
  });
});

describe('truthful sitemap dates', () => {
  it('maps pages to their source files', () => {
    expect(pageSourceFile('/')).toBe('src/pages/index.astro');
    expect(pageSourceFile('/download/linux')).toBe(
      'src/pages/download/[os].astro',
    );
    expect(pageSourceFile('/security')).toBe('src/pages/security.astro');
  });

  it('dates a file by its last commit, not the build', () => {
    const date = gitLastModified('astro.config.mjs');
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(gitLastModified('does/not/exist.astro')).toBeUndefined();
  });
});

describe('changelog feed', () => {
  const xml = buildRss(releases);

  it('lists every release with a link, date and guid', () => {
    expect((xml.match(/<item>/g) ?? []).length).toBe(releases.length);
    expect(xml).toContain(
      '<link>https://terra.iamnahid.com/changelog/v0-0-15</link>',
    );
    expect(xml).toMatch(
      /<pubDate>\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/,
    );
  });

  it('escapes release text', () => {
    const odd = buildRss([{ ...releases[0], tag_name: 'v1 <&>' }]);
    expect(odd).toContain('v1 &lt;&amp;&gt;');
  });

  it('is advertised on every page', () => {
    expect(read('src/layouts/BaseLayout.astro')).toContain(
      'type="application/rss+xml"',
    );
  });
});

describe('release structured data', () => {
  it('carries the publish date', () => {
    const data = techArticleJsonLd({
      title: 't',
      description: 'd',
      path: '/changelog/v0-0-15',
      published: '2026-11-05T09:00:00Z',
    }) as unknown as Record<string, unknown>;
    expect(data.datePublished).toBe('2026-11-05T09:00:00Z');
  });

  it('is used on release pages', () => {
    expect(read('src/pages/changelog/[version].astro')).toContain(
      'techArticleJsonLd',
    );
  });
});

describe('HTTPS and redirects', () => {
  it('tells browsers to stay on HTTPS', () => {
    expect(read('public/_headers')).toMatch(
      /\/\*\n\s+Strict-Transport-Security: max-age=31536000/,
    );
  });

  it.each([
    '/changelog/ /changelog 301',
    '/changelog/:version/ /changelog/:version 301',
    '/download/:os/ /download/:os 301',
    '/termius-alternative/ /termius-alternative 301',
    '/self-hosted/ /self-hosted 301',
  ])('has %s', (rule) => {
    expect(read('public/_redirects')).toContain(rule);
  });
});

describe('internal links', () => {
  it('points the desktop guide at each OS install page', () => {
    const doc = read('src/content/docs/desktop.mdx');
    for (const os of ['windows', 'macos', 'linux']) {
      expect(doc).toContain(`/download/${os}`);
    }
  });

  it('points the server guide at the self-hosted overview', () => {
    expect(read('src/content/docs/server.mdx')).toContain('/self-hosted');
  });
});
