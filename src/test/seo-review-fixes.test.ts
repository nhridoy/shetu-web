// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { notesExcerpt } from '../lib/changelog';
import { getReleases } from '../lib/github';
import { loadOgFonts, resetOgFontsForTest } from '../lib/og';
import { jsonLdScript } from '../lib/seo';

const read = (path: string) => readFileSync(path, 'utf8');
const v15 = read('src/lib/fixtures/release-v0.0.15.md');

function recordingFetch() {
  const signals: (AbortSignal | null | undefined)[] = [];
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    signals.push(init?.signal);
    throw new Error('offline');
  }) as unknown as typeof fetch;
  return { signals, fetchImpl };
}

describe('SEO branch review fixes', () => {
  it('gives the GitHub request a timeout so a hang cannot stall the build', async () => {
    const { signals, fetchImpl } = recordingFetch();
    await getReleases({ fallback: [], fetchImpl, apiBase: 'https://x.test' });
    expect(signals.length).toBe(1);
    expect(signals[0]).toBeInstanceOf(AbortSignal);
  });

  it('gives Fontshare requests a timeout', async () => {
    resetOgFontsForTest();
    const { signals, fetchImpl } = recordingFetch();
    await loadOgFonts(fetchImpl);
    resetOgFontsForTest();
    expect(signals.length).toBeGreaterThan(0);
    for (const signal of signals) expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('escapes < in JSON-LD so data cannot close the script tag', () => {
    const out = jsonLdScript({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: '</script><script>alert(1)</script>',
    });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });

  it('says exactly what is encrypted', () => {
    expect(read('src/pages/termius-alternative.astro')).toContain(
      'host addresses, usernames, passwords and private keys',
    );
    expect(read('src/pages/self-hosted.astro')).not.toContain(
      'your hosts, keys and team vaults sync',
    );
  });

  it('lists releases with plain-text excerpts, not hidden links', () => {
    const excerpt = notesExcerpt(v15);
    expect(excerpt).toContain('stop groups inside deleted groups');
    expect(excerpt).not.toContain('<');
    expect(excerpt).not.toContain('Full Changelog');
    expect(excerpt.length).toBeLessThanOrEqual(181);
    expect(read('src/pages/changelog.astro')).not.toContain('set:html');
  });

  it('wraps long URLs in release notes on small screens', () => {
    expect(read('src/styles/global.css')).toMatch(
      /\.docs-prose a \{[^}]*overflow-wrap: anywhere/,
    );
    expect(read('src/pages/changelog.astro')).toContain(
      '[overflow-wrap:anywhere]',
    );
  });

  it('answers common questions on the Termius alternative page', () => {
    expect(read('src/pages/termius-alternative.astro')).toContain(
      '<FaqSection',
    );
  });
});
