import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import snapshot from '../data/releases.json';
import { getReleases } from './github';
import { formatReleaseDate, type Release } from './releases';
import type { PageMeta } from './seo';

const fallback = snapshot.releases as Release[];
let buildReleases: Promise<Release[]> | null = null;

/** All releases, newest first; the committed snapshot when GitHub is unreachable. */
export function loadReleases(fetchImpl?: typeof fetch): Promise<Release[]> {
  const load = () =>
    getReleases({
      fallback,
      fetchImpl,
      token: process.env.GITHUB_TOKEN,
    }).then((result) => result.releases);
  if (fetchImpl) return load();
  buildReleases ??= load();
  return buildReleases;
}

/**
 * Drops what every GitHub release body repeats: the "## Install" section and
 * the "## What's Changed" heading (pages supply their own heading).
 */
export function cleanNotes(body: string): string {
  const kept: string[] = [];
  let skipping = false;
  for (const line of body.split('\n')) {
    if (/^## /.test(line)) skipping = /^## Install\b/.test(line);
    if (!skipping && !/^## What's Changed\s*$/.test(line)) kept.push(line);
  }
  return kept.join('\n').trim();
}

/** False when only the "What's Changed" heading or "Full Changelog" link is left. */
export function hasNotes(body: string): boolean {
  return cleanNotes(body)
    .split('\n')
    .some(
      (line) =>
        line.trim() !== '' &&
        !/^## What's Changed\s*$/.test(line) &&
        !/^\*\*Full Changelog\*\*:/.test(line),
    );
}

/** Release notes are untrusted: render GitHub-flavoured Markdown, then sanitize. */
export function renderNotes(body: string): string {
  const html = marked.parse(cleanNotes(body), { gfm: true, async: false });
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'ul',
      'ol',
      'li',
      'a',
      'code',
      'pre',
      'strong',
      'em',
      'h2',
      'h3',
      'h4',
      'blockquote',
      'br',
      'hr',
    ],
    allowedAttributes: { a: ['href', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow noopener' }),
    },
  });
}

export function versionSlug(tag: string): string {
  return tag.replaceAll('.', '-');
}

export function releasePageMeta(
  release: Release,
): PageMeta & { noindex: boolean } {
  const tag = release.tag_name;
  return {
    title: `Terra ${tag} release notes and downloads`,
    description: `What changed in Terra ${tag}, released ${formatReleaseDate(release.published_at)}: release notes and downloads for macOS, Windows and Linux, x64 and ARM64.`,
    noindex: !hasNotes(release.body),
  };
}

/** Plain-text summary for the changelog index: no links to tab into, no "Full Changelog" line. */
export function notesExcerpt(body: string, max = 180): string {
  const notes = cleanNotes(body)
    .split('\n')
    .filter((line) => !/^\*\*Full Changelog\*\*:/.test(line))
    .join('\n');
  const text = sanitizeHtml(marked.parse(notes, { gfm: true, async: false }), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
}
