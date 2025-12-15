/**
 * Content Types Configuration
 *
 * Centralized configuration for content type labels, styles, and metadata.
 * All components should import from this file to ensure consistency.
 */

/**
 * Available content types in the site
 */
export type ContentType = 'all' | 'dramas' | 'kpop' | 'noticias' | 'guias' | 'features';

/**
 * Content type display labels (Spanish)
 */
export const contentTypeLabels: Record<ContentType, string> = {
  all: 'Todos',
  dramas: 'K-Drama',
  kpop: 'K-Pop',
  noticias: 'Noticia',
  guias: 'Guía',
  features: 'Especial',
};

/**
 * Content type badge/chip styles using M3 design tokens
 */
export const contentTypeStyles: Record<ContentType, { bg: string; color: string }> = {
  dramas: {
    bg: 'var(--md-color-primary-container)',
    color: 'var(--md-color-on-primary-container)',
  },
  kpop: {
    bg: 'var(--md-color-tertiary-container)',
    color: 'var(--md-color-on-tertiary-container)',
  },
  noticias: {
    bg: 'var(--md-color-secondary-container)',
    color: 'var(--md-color-on-secondary-container)',
  },
  guias: {
    bg: 'color-mix(in srgb, var(--md-color-tertiary) 15%, var(--md-color-surface-variant))',
    color: 'var(--md-color-on-surface)',
  },
  features: {
    bg: 'var(--md-color-primary-container)',
    color: 'var(--md-color-on-primary-container)',
  },
  all: {
    bg: 'var(--md-color-surface-variant)',
    color: 'var(--md-color-on-surface-variant)',
  },
};

/**
 * Full content type configuration (labels + styles combined)
 */
export interface ContentTypeConfig {
  label: string;
  bg: string;
  color: string;
}

export const contentTypeConfig: Record<ContentType, ContentTypeConfig> = {
  dramas: { label: contentTypeLabels.dramas, ...contentTypeStyles.dramas },
  kpop: { label: contentTypeLabels.kpop, ...contentTypeStyles.kpop },
  noticias: { label: contentTypeLabels.noticias, ...contentTypeStyles.noticias },
  guias: { label: contentTypeLabels.guias, ...contentTypeStyles.guias },
  features: { label: contentTypeLabels.features, ...contentTypeStyles.features },
  all: { label: contentTypeLabels.all, ...contentTypeStyles.all },
};

/**
 * Get content type config with fallback to 'all'
 */
export function getContentTypeConfig(type: string): ContentTypeConfig {
  return contentTypeConfig[type as ContentType] || contentTypeConfig.all;
}

/**
 * Get content type label with fallback
 */
export function getContentTypeLabel(type: string): string {
  return contentTypeLabels[type as ContentType] || type;
}

/**
 * Get content type styles with fallback
 */
export function getContentTypeStyles(type: string): { bg: string; color: string } {
  return contentTypeStyles[type as ContentType] || contentTypeStyles.all;
}

/**
 * Feature category types (for features collection category field)
 */
export type FeatureCategory = 'music' | 'series' | 'event' | 'gastronomy' | 'culture';

/**
 * Feature category configuration (labels + styles)
 */
export const featureCategoryConfig: Record<FeatureCategory, { label: string; bg: string; text: string }> = {
  music: { label: 'Música', bg: 'var(--oc-accent-soft)', text: 'var(--oc-text)' },
  series: { label: 'Series', bg: 'var(--oc-primary-soft)', text: 'var(--oc-text)' },
  event: { label: 'Evento', bg: 'color-mix(in srgb, var(--oc-accent) 12%, var(--oc-surface))', text: 'var(--oc-text)' },
  gastronomy: { label: 'Gastronomía', bg: 'color-mix(in srgb, var(--oc-primary) 10%, var(--oc-surface))', text: 'var(--oc-text)' },
  culture: { label: 'Cultura', bg: 'var(--oc-accent-soft)', text: 'var(--oc-text)' },
};

/**
 * Get feature category config with fallback
 */
export function getFeatureCategoryConfig(category: string): { label: string; bg: string; text: string } {
  return featureCategoryConfig[category as FeatureCategory] || { label: category, bg: 'var(--oc-surface)', text: 'var(--oc-text)' };
}

/**
 * News category types (for noticias collection)
 */
export type NewsCategory = 'drama' | 'kpop' | 'cine' | 'cultura' | 'general';

/**
 * News categories list
 */
export const newsCategories: NewsCategory[] = ['drama', 'kpop', 'cine', 'cultura', 'general'];
