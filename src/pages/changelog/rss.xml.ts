import type { APIRoute } from 'astro';
import { loadReleases } from '../../lib/changelog';
import { buildRss } from '../../lib/feed';

export const GET: APIRoute = async () =>
  new Response(buildRss(await loadReleases()), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
