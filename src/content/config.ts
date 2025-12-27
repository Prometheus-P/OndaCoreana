import { defineCollection, z } from 'astro:content';

// FAQ item schema for AEO optimization
const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

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
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** Affiliate hint for auto-rendering AffiliateBox: kpop_goods, esim, travel_insurance, streaming, korean_learning */
  affiliate_hint: z.enum(['kpop_goods', 'esim', 'travel_insurance', 'streaming', 'korean_learning']).optional(),
  /** Disable ads on this specific article */
  noAds: z.boolean().default(false),
  /** FAQ section for AEO (Answer Engine Optimization) - improves AI search engine citations */
  faq: z.array(faqItemSchema).optional(),
});

// Streaming platform enum for type safety
const streamingPlatformEnum = z.enum([
  'netflix',
  'viki',
  'disney-plus',
  'amazon-prime',
  'apple-tv',
  'kocowa',
  'wavve',
  'tving',
]);

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
    whereToWatch: z.array(streamingPlatformEnum).default([]), // Streaming platforms
    /** Airing status: airing (currently airing), completed, upcoming */
    airingStatus: z.enum(['airing', 'completed', 'upcoming']).default('completed'),
    /** Day of the week when new episodes air */
    airingDay: z
      .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
      .optional(),
    /** Editor's pick flag for Top 10 recommendations */
    isEditorPick: z.boolean().default(false),
    /** Order in editor's picks list (lower = higher priority) */
    editorPickOrder: z.number().optional(),
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
    /** Recent activity status: comeback, tour, hiatus, active */
    recentActivity: z.enum(['comeback', 'tour', 'hiatus', 'active']).default('active'),
    /** Date of last comeback (for tracking recent comebacks) */
    lastComebackDate: z.coerce.date().optional(),
    /** Editor's pick flag for Top 10 recommendations */
    isEditorPick: z.boolean().default(false),
    /** Order in editor's picks list (lower = higher priority) */
    editorPickOrder: z.number().optional(),
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
    // MDX content is handled automatically by Astro - no blocks field needed
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
