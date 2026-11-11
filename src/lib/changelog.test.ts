import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import snapshot from '../data/releases.json';
import {
  cleanNotes,
  hasNotes,
  loadReleases,
  releasePageMeta,
  renderNotes,
  versionSlug,
} from './changelog';
import { mapAssets, type Release } from './releases';

const v15 = readFileSync('src/lib/fixtures/release-v0.0.15.md', 'utf8');
const v5 =
  '**Full Changelog**: https://github.com/nhridoy/terra-client/compare/v0.0.4...v0.0.5';

describe('release notes', () => {
  it('strips the install section', () => {
    const notes = cleanNotes(v15);
    expect(notes).toContain('stop groups inside deleted groups');
    expect(notes).not.toContain('curl -fsSL');
    expect(notes).not.toContain('## Install');
    expect(notes).not.toContain("## What's Changed");
  });

  it('detects releases with no real notes', () => {
    expect(hasNotes(v5)).toBe(false);
    expect(hasNotes(v15)).toBe(true);
    expect(hasNotes('')).toBe(false);
  });

  it('removes scripts, raw HTML handlers and javascript links', () => {
    const html = renderNotes(
      'hi <script>alert(1)</script> <img src=x onerror=alert(1)> [x](javascript:alert(1))',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('javascript:');
  });

  it('autolinks bare URLs', () => {
    expect(renderNotes(v15)).toContain(
      '<a href="https://github.com/nhridoy/terra-client/pull/11" rel="nofollow noopener"',
    );
  });

  it('slugs versions', () => {
    expect(versionSlug('v0.0.15')).toBe('v0-0-15');
  });
});

describe('loadReleases', () => {
  it('falls back to the committed snapshot when GitHub fails', async () => {
    const releases = await loadReleases(async () => {
      throw new Error('rate limited');
    });
    expect(releases.length).toBeGreaterThan(0);
    expect(releases).toEqual(snapshot.releases);
  });
});

describe('release pages', () => {
  const v15Release = snapshot.releases.find(
    (r) => r.tag_name === 'v0.0.15',
  ) as Release;
  const v5Release = snapshot.releases.find(
    (r) => r.tag_name === 'v0.0.5',
  ) as Release;

  it('marks releases without notes as noindex', () => {
    expect(releasePageMeta(v5Release).noindex).toBe(true);
    expect(releasePageMeta(v15Release).noindex).toBe(false);
  });

  it('keeps release titles and descriptions within limits', () => {
    const { title, description } = releasePageMeta(v15Release);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(110);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('handles releases with no assets', () => {
    expect(mapAssets({ ...v15Release, assets: [] })).toEqual([]);
  });
});
