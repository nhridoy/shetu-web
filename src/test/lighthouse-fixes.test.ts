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
    expect(css).toMatch(
      /--font-sans:\s*"Satoshi",\s*"Satoshi Fallback",\s*"Satoshi Fallback Roboto"/,
    );
    // Android has no Arial: a Roboto-tuned family catches it.
    expect(css).toMatch(
      /font-family: "Satoshi Fallback Roboto";[^}]*font-weight: 100 500;[^}]*size-adjust: 98\.73%/,
    );
    expect(css).toMatch(
      /font-family: "Satoshi Fallback Roboto";[^}]*font-weight: 600 900;[^}]*size-adjust: 103\.53%/,
    );
    // Headings are bold; a regular-weight match still re-wraps them on swap.
    expect(css).toMatch(
      /font-family: "Satoshi Fallback";[^}]*font-weight: 600 900;[^}]*size-adjust: 97\.41%/,
    );
  });

  it('never fades text below readable contrast', () => {
    const offenders = source.filter((f) => /text-muted\/\d+/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it('hydrates islands when idle so they do not block the first load', () => {
    const offenders = source.filter((f) => read(f).includes('client:load'));
    expect(offenders).toEqual([]);
    // Every island still hydrates, just later.
    for (const file of [
      'src/components/marketing/Hero.astro',
      'src/pages/download/[os].astro',
      'src/pages/termius-alternative.astro',
      'src/pages/download.astro',
    ]) {
      // Interactive above the fold: idle, but never later than 1s.
      expect(read(file), file).toMatch(
        /<DownloadPanel\s+client:idle=\{\{ timeout: 1000 \}\}/,
      );
    }
    expect(read('src/components/marketing/Hero.astro')).toContain(
      '<ReleaseTag client:idle',
    );
  });
});

describe('hero download button', () => {
  it('reserves room for the longest OS label so hydration does not shift layout', () => {
    const panel = read('src/components/download/DownloadPanel.tsx');
    const button =
      panel.match(/data-testid="hero-download"\s+className="([^"]*)"/)?.[1] ??
      '';
    // "Download for Windows" measures 200px at this size; keep a little room.
    expect(button).toContain('min-w-[13rem]');
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
    expect(data.image).toBe('https://shetu.iamnahid.com/og/docs/server.png');
    expect(data.author).toMatchObject({
      '@type': 'Organization',
      name: 'Shetu',
    });
    expect(data.dateModified).toBe('2026-11-11T00:00:00.000Z');
  });
});

describe('scrollbar', () => {
  // Live, HTML streams in; the scrollbar appears mid-load and every centred
  // block jumps sideways (desktop CLS 0.109). Reserve its space up front.
  it('reserves the scrollbar gutter so centred content never jumps', () => {
    // Ignore comments, and allow no other value anywhere that could override it.
    const css = read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/html \{[^}]*scrollbar-gutter: stable;/);
    expect(css.match(/scrollbar-gutter:\s*[^;]+/g)).toEqual([
      'scrollbar-gutter: stable',
    ]);
  });
});
