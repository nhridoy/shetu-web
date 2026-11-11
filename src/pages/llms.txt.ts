import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms';
import { PAGES } from '../lib/seo';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const body = buildLlmsTxt({
    pages: Object.entries(PAGES).map(([path, meta]) => ({ path, ...meta })),
    docs: docs
      .sort((a, b) => a.data.order - b.data.order)
      .map((entry) => ({
        path: `/docs/${entry.id}`,
        title: entry.data.title,
        description: entry.data.description,
      })),
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
