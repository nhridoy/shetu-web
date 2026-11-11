import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { loadOgFonts, renderOgPng } from '../../lib/og';
import { PAGES } from '../../lib/seo';

/** Cut at a word boundary so subtitles stay one or two lines. */
function short(text: string, max = 110): string {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
}

async function ogEntries(): Promise<
  { path: string; title: string; description: string }[]
> {
  const docs = await getCollection('docs');
  return [
    ...Object.entries(PAGES).map(([path, meta]) => ({ path, ...meta })),
    ...docs.map((entry) => ({
      path: `/docs/${entry.id}`,
      title: entry.data.title,
      description: entry.data.description,
    })),
  ];
}

export const getStaticPaths = (async () =>
  (await ogEntries()).map(({ path, title, description }) => ({
    params: { path: path === '/' ? 'index' : path.slice(1) },
    // The logo already says Terra, so drop the brand part of the page title.
    props: {
      title: title.replace(/^Terra · | · Terra( Docs)?$/g, ''),
      subtitle: short(description),
    },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng(
    props as { title: string; subtitle: string },
    await loadOgFonts(),
  );
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
