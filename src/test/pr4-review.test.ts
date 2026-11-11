// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanNotes,
  hasNotes,
  latestRelease,
  loadReleases,
  notesExcerpt,
} from '../lib/changelog';
import { getReleases } from '../lib/github';
import { buildLlmsTxt } from '../lib/llms';
import { loadOgFonts, resetOgFontsForTest } from '../lib/og';
import type { Release } from '../lib/releases';

const read = (path: string) => readFileSync(path, 'utf8');
const raw = (tag: string, published: string, extra = {}) => ({
  tag_name: tag,
  name: tag,
  published_at: published,
  html_url: `https://github.com/x/${tag}`,
  body: '',
  assets: [],
  ...extra,
});
const json = (value: unknown) =>
  ({ ok: true, status: 200, json: async () => value }) as Response;

afterEach(() => {
  vi.restoreAllMocks();
  resetOgFontsForTest();
});

describe('release fetching', () => {
  it('follows pages past 100 releases', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      raw(`v1.${i}`, `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}Z`),
    );
    const fetchImpl = vi.fn(async (url: string) =>
      json(
        url.includes('page=2') ? [raw('v0.9', '2025-01-01T00:00:00Z')] : page1,
      ),
    );
    const { releases } = await getReleases({
      fallback: [],
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiBase: 'https://pages.test',
    });
    expect(releases).toHaveLength(101);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('orders releases by publication date, newest first', async () => {
    const fetchImpl = async () =>
      json([
        raw('v2', '2026-01-01T00:00:00Z'),
        raw('v3', '2026-03-01T00:00:00Z'),
      ]);
    const { releases } = await getReleases({
      fallback: [],
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiBase: 'https://order.test',
    });
    expect(releases.map((r) => r.tag_name)).toEqual(['v3', 'v2']);
  });

  it('warns in the build log when it falls back to the snapshot', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await loadReleases(async () => {
      throw new Error('down');
    });
    expect(warn).toHaveBeenCalled();
  });

  it('takes the newest stable release as latest', () => {
    const list = [
      { ...raw('v3-beta', '2026-03-01T00:00:00Z'), prerelease: true },
      { ...raw('v2', '2026-02-01T00:00:00Z'), prerelease: false },
    ] as Release[];
    expect(latestRelease(list).tag_name).toBe('v2');
  });
});

describe('release notes', () => {
  it('keeps notes after a code sample that mentions ## Install', () => {
    const body =
      '## Highlights\n```\n## Install\n```\nkept line\n## Install\nboilerplate';
    expect(cleanNotes(body)).toContain('kept line');
    expect(cleanNotes(body)).not.toContain('boilerplate');
  });

  it('treats notes that render to nothing as empty', () => {
    expect(hasNotes('<div></div><span></span>')).toBe(false);
  });

  it('shows decoded characters in excerpts', () => {
    expect(notesExcerpt('* Fix A & B when 1 < 2')).toBe('Fix A & B when 1 < 2');
  });
});

describe('build safety', () => {
  it('only downloads fonts from the Fontshare CDN', async () => {
    const urls: string[] = [];
    const fetchImpl = (async (url: string) => {
      urls.push(url);
      return {
        ok: true,
        text: async () => "src: url('https://169.254.169.254/latest.ttf')",
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response;
    }) as unknown as typeof fetch;
    const fonts = await loadOgFonts(fetchImpl);
    expect(urls.some((u) => u.includes('169.254'))).toBe(false);
    expect(fonts[0]?.name).toBe('Inter');
  });

  it('defines the public origin once', () => {
    const config = read('astro.config.mjs');
    expect(config).toContain('site: SITE_URL');
    expect(config).not.toContain("'https://shetu.iamnahid.com'");
  });
});

describe('pages', () => {
  it('gives the 404 page an existing share image', () => {
    expect(read('src/pages/404.astro')).toContain('image="/og/index.png"');
  });

  it('does not clip the download menu in page headers or the closing section', () => {
    for (const file of [
      'src/components/ui/PageHeader.astro',
      'src/components/marketing/ClosingCta.astro',
    ]) {
      const section = read(file).match(/<section[^>]*>/)?.[0] ?? '';
      expect(section, file).not.toContain('overflow-hidden');
    }
  });
});

describe('llms.txt', () => {
  const txt = buildLlmsTxt({
    pages: [{ path: '/download', title: 'Download', description: 'Get it.' }],
    docs: [{ path: '/docs/server', title: 'Server', description: 'Host it.' }],
  });

  it('does not call the sync server optional (sign-in requires one)', () => {
    expect(txt).not.toMatch(/optional[^.]*server/i);
  });

  it('starts with the project name and a summary', () => {
    expect(txt.startsWith('# Shetu\n\n> ')).toBe(true);
  });

  it('links pages and docs with absolute URLs and descriptions', () => {
    expect(txt).toContain(
      '- [Download](https://shetu.iamnahid.com/download): Get it.',
    );
    expect(txt).toContain(
      '- [Server](https://shetu.iamnahid.com/docs/server): Host it.',
    );
  });
});

describe('one release source per build', () => {
  it('builds download data and app metadata from the live release list', () => {
    for (const file of [
      'src/pages/index.astro',
      'src/pages/download.astro',
      'src/pages/termius-alternative.astro',
      'src/pages/download/[os].astro',
    ]) {
      const source = read(file);
      expect(source, file).not.toContain('data/releases.json');
      expect(source, file).toContain('latestRelease(await loadReleases())');
    }
  });
});

describe('download menu placement', () => {
  it('opens aligned to the button so it never runs off the left edge', () => {
    const panel = read('src/components/download/DownloadPanel.tsx');
    const menu =
      panel.match(
        /data-testid="hero-build-menu"[\s\S]*?className="([^"]*)"/,
      )?.[1] ?? '';
    expect(menu).toContain('left-0');
    expect(menu).not.toContain('-translate-x-1/2');
  });
});
