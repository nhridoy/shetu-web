import { hasNotes, notesExcerpt, versionSlug } from './changelog';
import type { Release } from './releases';
import { absoluteUrl, PAGES } from './seo';

const escapeXml = (text: string) =>
  text.replace(
    /[<>&'"]/g,
    (c) =>
      `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`,
  );

/** RSS 2.0 feed of releases, newest first. */
export function buildRss(releases: Release[]): string {
  const items = releases.map((release) => {
    const url = absoluteUrl(`/changelog/${versionSlug(release.tag_name)}`);
    const summary = hasNotes(release.body)
      ? notesExcerpt(release.body, 400)
      : 'New builds for macOS, Windows and Linux.';
    return [
      '<item>',
      `<title>${escapeXml(`Terra ${release.tag_name}`)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(release.published_at).toUTCString()}</pubDate>`,
      `<description>${escapeXml(summary)}</description>`,
      '</item>',
    ].join('');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    '<title>Terra changelog</title>',
    `<link>${absoluteUrl('/changelog')}</link>`,
    `<atom:link href="${absoluteUrl('/changelog/rss.xml')}" rel="self" type="application/rss+xml"/>`,
    `<description>${escapeXml(PAGES['/changelog'].description)}</description>`,
    '<language>en</language>',
    ...items,
    '</channel></rss>',
    '',
  ].join('\n');
}
