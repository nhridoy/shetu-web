import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { hasNotes, loadReleases, versionSlug } from '../lib/changelog';
import { PAGES } from '../lib/seo';
import { buildSitemap, gitLastModified, pageSourceFile } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const releases = await loadReleases();
  const xml = buildSitemap([
    ...Object.keys(PAGES).map((path) => ({
      path,
      lastmod: gitLastModified(pageSourceFile(path)),
    })),
    ...docs.map((entry) => ({
      path: `/docs/${entry.id}`,
      lastmod: entry.data.updated,
    })),
    // Releases without notes are noindex, so they stay out of the sitemap.
    ...releases
      .filter((release) => hasNotes(release.body))
      .map((release) => ({
        path: `/changelog/${versionSlug(release.tag_name)}`,
        lastmod: release.published_at,
      })),
  ]);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
