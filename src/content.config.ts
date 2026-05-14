import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    author: z.string(),
    categories: z.array(z.string()),
    excerpt: z.string().optional().default(''),
    image: z.string().optional().default(''),
  }),
});

export const collections = { posts };
