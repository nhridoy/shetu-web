import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    /** Search-result title (50 to 60 characters); falls back to the page title. */
    seoTitle: z.string().optional(),
    description: z.string(),
    section: z.enum(['desktop', 'server']),
    order: z.number(),
    updated: z.string().optional(),
  }),
});

export const collections = { docs };
