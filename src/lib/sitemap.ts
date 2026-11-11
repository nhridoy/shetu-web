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
