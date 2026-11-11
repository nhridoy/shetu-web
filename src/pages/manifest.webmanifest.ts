import type { APIRoute } from 'astro';
import { buildManifest } from '../lib/icons';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildManifest(), null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
