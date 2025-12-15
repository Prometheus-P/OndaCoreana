import { defineCollection, z } from 'astro:content';

// Schema base para todos los artículos
const baseArticleSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  author: z.string().default('OndaCoreana'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** Affiliate hint for auto-rendering AffiliateBox: kpop_goods, esim, travel_insurance, streaming, korean_learning */
  affiliate_hint: z.enum(['kpop_goods', 'esim', 'travel_insurance', 'streaming', 'korean_learning']).optional(),
  /** Disable ads on this specific article */
  noAds: z.boolean().default(false),
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

// Colección: Features (contenido editorial enfocado en LatAm)
const features = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(3).max(80),
    descriptionEs: z.string().max(180),
    category: z.enum(['music', 'series', 'event', 'gastronomy', 'culture']).default('culture'),
    countries: z.array(z.string()).min(1, 'Incluye al menos un país de LatAm'),
    latamHook: z.array(z.string()).min(1, 'Añade al menos un gancho para LatAm'),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    publishDate: z.coerce.date(),
    author: z.string().default('OndaCoreana'),
    tags: z.array(z.string()).default([]),
    blocks: z
      .array(
        z.object({
          heading: z.string().optional(),
          body: z.string(),
        })
      )
      .default([]),
    seoMeta: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        canonical: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  dramas,
  kpop,
  noticias,
  guias,
  features,
};
