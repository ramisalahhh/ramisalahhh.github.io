import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects/.
// Files starting with "_" (like _template.md) are skipped.
const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/projects' }),
  schema: ({ image }) => {
    const common = {
      title: z.string({ error: 'title is required' }).min(1, 'title is required'),
      summary: z
        .string({ error: 'summary is required (one line shown on the card)' })
        .min(1, 'summary is required (one line shown on the card)'),
      date: z.coerce.date({ error: 'date must be a date like 2026-11-10' }),
      repo: z.url({ error: 'repo must be a full URL, e.g. https://github.com/ramisalahhh/my-repo' }),
    };

    const devops = z
      .object({
        ...common,
        type: z.literal('devops'),
        featured: z.boolean({ error: 'featured must be true or false' }).default(false),
        tools: z
          .array(z.string().min(1), { error: 'tools must be a list, e.g. [Docker, GitHub Actions]' })
          .min(1, 'devops projects need at least one entry in tools'),
        live: z.url({ error: 'live must be a full URL or left empty' }).nullish(),
        diagram: image().nullish(),
      })
      .strict();

    const lab = z
      .object({
        ...common,
        type: z.literal('lab'),
        // Optional first line on the Lab card: the problem the app solves.
        // The summary is the second line: what was built.
        problem: z.string().nullish(),
      })
      .strict();

    return z.discriminatedUnion('type', [devops, lab], {
      error: 'type must be "devops" or "lab"',
    });
  },
});

export const collections = { projects };
