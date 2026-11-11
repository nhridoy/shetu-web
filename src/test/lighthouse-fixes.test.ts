// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
const source = files('src').filter(
  (f) => /\.(astro|tsx?)$/.test(f) && !f.includes('.test.'),
);

describe('Lighthouse findings', () => {
  it('matches the fallback font to Satoshi so the swap does not shift layout', () => {
    const css = read('src/styles/global.css');
    expect(css).toMatch(
      /font-family: "Satoshi Fallback";[^}]*size-adjust: 99\.26%/,
    );
    expect(css).toMatch(/--font-sans:\s*"Satoshi",\s*"Satoshi Fallback"/);
    // Headings are bold; a regular-weight match still re-wraps them on swap.
    expect(css).toMatch(
      /font-family: "Satoshi Fallback";[^}]*font-weight: 600 900;[^}]*size-adjust: 97\.41%/,
    );
  });

  it('never fades text below readable contrast', () => {
    const offenders = source.filter((f) => read(f).includes('text-muted/70'));
    expect(offenders).toEqual([]);
  });

  it('hydrates islands when idle so they do not block the first load', () => {
    const offenders = source.filter((f) => read(f).includes('client:load'));
    expect(offenders).toEqual([]);
  });
});

describe('hero download button', () => {
  it('reserves room for the longest OS label so hydration does not shift layout', () => {
    const panel = read('src/components/download/DownloadPanel.tsx');
    const button =
      panel.match(/data-testid="hero-download"\s+className="([^"]*)"/)?.[1] ??
      '';
    expect(button).toMatch(/min-w-\[/);
  });
});

describe('Rich Results Test: Article', () => {
  it('has an image, an author and a full ISO dateModified', async () => {
    const { techArticleJsonLd } = await import('../lib/seo');
    const data = techArticleJsonLd({
      title: 't',
      description: 'd',
      path: '/docs/server',
      updated: '2026-11-11',
    }) as unknown as Record<string, unknown>;
    expect(data.image).toBe('https://terra.iamnahid.com/og/docs/server.png');
    expect(data.author).toMatchObject({
      '@type': 'Organization',
      name: 'Terra',
    });
    expect(data.dateModified).toBe('2026-11-11T00:00:00.000Z');
  });
});
