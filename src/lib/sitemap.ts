import { execFileSync } from 'node:child_process';
import { absoluteUrl } from './seo';

export interface SitemapEntry {
  path: string;
  lastmod?: string;
}

const escapeXml = (text: string) =>
  text.replace(
    /[<>&'"]/g,
    (c) =>
      `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`,
  );

export function buildSitemap(entries: SitemapEntry[]): string {
  const urls = [...entries]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, lastmod }) => {
      const date = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${escapeXml(absoluteUrl(path))}</loc>${date}</url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;
}

/** Source file that renders a registered page path. */
export function pageSourceFile(path: string): string {
  if (path === '/') return 'src/pages/index.astro';
  if (path.startsWith('/download/')) return 'src/pages/download/[os].astro';
  return `src/pages${path}.astro`;
}

/**
 * Last commit date of a file, so lastmod changes only when the page does.
 * shortcut: a shallow CI clone dates every file at HEAD; fetch full history to sharpen.
 */
export function gitLastModified(file: string): string | undefined {
  try {
    const date = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', file],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();
    return date || undefined;
  } catch {
    return undefined;
  }
}
