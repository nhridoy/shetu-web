import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_EXT = /\.(astro|mdx|tsx|ts)$/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SOURCE_EXT.test(entry.name) && !entry.name.includes('.test.')
      ? [path]
      : [];
  });
}

const files = sourceFiles('src').map((path) => ({
  path,
  text: readFileSync(path, 'utf8'),
}));

// Claims the product does not back (see the 2026-11-11 redesign spec).
const BANNED = [
  /termius-compatible/i,
  /termius compatibility/i,
  /\bsrp\b/i,
  /xsalsa20/i,
  /mosh support/i,
  /gitlab/i,
  /microsoft login/i,
  /master password/i,
  /works without a server/i,
  /zero-knowledge/i,
  /\b2fa\b/i,
  /two-factor/i,
  // Public keys are visible to the server; only private keys stay encrypted.
  /passwords, keys (and|or) commands/i,
  // Removal only flags vaults; an owner or admin completes the rotation.
  /rotat(e|es|ed) when (a member|someone)/i,
  /removing a (team )?member rotates/i,
];

describe('copy guard', () => {
  it('hides reveal blocks only when JS runs', () => {
    expect(readFileSync('src/styles/global.css', 'utf8')).toContain(
      'html.js .reveal',
    );
  });

  it('has no en or em dashes', () => {
    const hits = files.filter((f) => /[–—]/.test(f.text)).map((f) => f.path);
    expect(hits).toEqual([]);
  });

  it('uses only the Shetu name in every tracked file', () => {
    // Split so this file does not match its own pattern.
    const oldName = new RegExp(['ter', 'ra'].join(''), 'i');
    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .split('\n')
      .filter((path) => path && !/\.(png|ico|jpe?g|webp|woff2?)$/.test(path))
      // shortcut: mirrors GitHub releases published under the old name; drop this
      // exception once they are replaced by Shetu releases and the snapshot is refreshed.
      .filter((path) => path !== 'src/data/releases.json');
    const hits = tracked.filter((path) =>
      oldName.test(`${path}\n${readFileSync(path, 'utf8')}`),
    );
    expect(hits).toEqual([]);
  });

  it('makes no banned claims', () => {
    const hits = files.flatMap((f) =>
      BANNED.filter((re) => re.test(f.text)).map((re) => `${f.path}: ${re}`),
    );
    expect(hits).toEqual([]);
  });
});
