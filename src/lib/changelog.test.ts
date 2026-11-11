import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import snapshot from '../data/releases.json';
import {
  cleanNotes,
  hasNotes,
  loadReleases,
  renderNotes,
  versionSlug,
} from './changelog';

const v15 = readFileSync('src/lib/fixtures/release-v0.0.15.md', 'utf8');
const v5 =
  '**Full Changelog**: https://github.com/nhridoy/terra-client/compare/v0.0.4...v0.0.5';

describe('release notes', () => {
  it('strips the install section', () => {
    const notes = cleanNotes(v15);
    expect(notes).toContain('stop groups inside deleted groups');
    expect(notes).not.toContain('curl -fsSL');
    expect(notes).not.toContain('## Install');
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
      '<a href="https://github.com/nhridoy/terra-client/pull/11"',
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
