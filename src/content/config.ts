import { defineCollection, z } from 'astro:content';

// Schema base para todos los artículos
const baseArticleSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  author: z.string().default('OndaCorea'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

// Colección: K-Dramas
const dramas = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    dramaTitle: z.string(), // Título original del drama
    dramaYear: z.number().optional(),
    network: z.string().optional(), // tvN, JTBC, Netflix, etc.
    episodes: z.number().optional(),
    genre: z.array(z.string()).default([]),
    cast: z.array(z.string()).default([]),
    whereToWatch: z.array(z.string()).default([]), // Netflix, Viki, etc.
  }),
});

// Colección: K-Pop
const kpop = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    artistName: z.string(), // Nombre del artista/grupo
    artistType: z.enum(['solista', 'grupo', 'banda']).default('grupo'),
    agency: z.string().optional(), // HYBE, SM, JYP, etc.
    debutYear: z.number().optional(),
    members: z.array(z.string()).optional(),
  }),
});

// Colección: Noticias
const noticias = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    category: z.enum(['drama', 'kpop', 'cine', 'cultura', 'general']),
    breaking: z.boolean().default(false),
    source: z.string().optional(),
  }),
});

// Colección: Guías
const guias = defineCollection({
  type: 'content',
  schema: baseArticleSchema.extend({
    category: z.enum(['streaming', 'viaje', 'idioma', 'cultura', 'general']),
    difficulty: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
    readingTime: z.number().optional(), // en minutos
  }),
});

export const collections = {
  dramas,
  kpop,
  noticias,
  guias,
};
