/**
 * OndaCoreana i18n Utilities
 *
 * Provides locale-aware content handling for multi-market support.
 * Supports: es (Latin American Spanish), pt (Brazilian Portuguese)
 */

export type SupportedLocale = 'es' | 'pt';

export const DEFAULT_LOCALE: SupportedLocale = 'es';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['es', 'pt'];

// Locale metadata
export const localeConfig: Record<SupportedLocale, {
  name: string;
  nativeName: string;
  hreflang: string;
  ogLocale: string;
  dateLocale: string;
  regions: string[];
}> = {
  es: {
    name: 'Spanish (Latin America)',
    nativeName: 'Espanol',
    hreflang: 'es-419',
    ogLocale: 'es_419',
    dateLocale: 'es-419',
    regions: ['MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO'],
  },
  pt: {
    name: 'Portuguese (Brazil)',
    nativeName: 'Portugues',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    dateLocale: 'pt-BR',
    regions: ['BR'],
  },
};

/**
 * Get locale config by locale code
 */
export function getLocaleConfig(locale: string) {
  return localeConfig[locale as SupportedLocale] || localeConfig.es;
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Translate a key using the translations object
 */
export function t(
  translations: Record<SupportedLocale, string>,
  locale: string
): string {
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  return translations[validLocale] || translations[DEFAULT_LOCALE];
}

/**
 * Common UI translations
 */
export const ui = {
  // Navigation
  'nav.home': { es: 'Inicio', pt: 'Inicio' },
  'nav.dramas': { es: 'K-Dramas', pt: 'K-Dramas' },
  'nav.kpop': { es: 'K-Pop', pt: 'K-Pop' },
  'nav.news': { es: 'Noticias', pt: 'Noticias' },
  'nav.guides': { es: 'Guias', pt: 'Guias' },
  'nav.search': { es: 'Buscar', pt: 'Pesquisar' },

  // Common actions
  'action.readMore': { es: 'Leer mas', pt: 'Leia mais' },
  'action.seeAll': { es: 'Ver todos', pt: 'Ver todos' },
  'action.subscribe': { es: 'Suscribirse', pt: 'Inscrever-se' },
  'action.share': { es: 'Compartir', pt: 'Compartilhar' },

  // Content labels
  'label.author': { es: 'Por', pt: 'Por' },
  'label.updated': { es: 'Actualizado', pt: 'Atualizado' },
  'label.tags': { es: 'Etiquetas', pt: 'Tags' },
  'label.readingTime': { es: 'min de lectura', pt: 'min de leitura' },

  // Newsletter
  'newsletter.title': { es: 'Unete a nuestra newsletter', pt: 'Junte-se a nossa newsletter' },
  'newsletter.subtitle': {
    es: 'Recibe las ultimas noticias de K-Pop y K-Drama directamente en tu correo.',
    pt: 'Receba as ultimas noticias de K-Pop e K-Drama diretamente no seu email.',
  },
  'newsletter.placeholder': { es: 'Tu email', pt: 'Seu email' },
  'newsletter.button': { es: 'Suscribirme', pt: 'Inscrever-me' },

  // Affiliate
  'affiliate.disclosure': {
    es: '* Enlaces de afiliado. Podemos recibir una comision sin costo adicional para ti.',
    pt: '* Links de afiliado. Podemos receber uma comissao sem custo adicional para voce.',
  },
  'affiliate.kpopGoods': { es: 'Compra merchandise oficial', pt: 'Compre merchandise oficial' },
  'affiliate.streaming': { es: 'Donde ver', pt: 'Onde assistir' },
  'affiliate.esim': { es: 'Conectividad en Corea', pt: 'Conectividade na Coreia' },

  // Footer
  'footer.privacy': { es: 'Politica de Privacidad', pt: 'Politica de Privacidade' },
  'footer.terms': { es: 'Terminos de Uso', pt: 'Termos de Uso' },
  'footer.copyright': {
    es: 'Todos los derechos reservados.',
    pt: 'Todos os direitos reservados.',
  },

  // Errors
  'error.notFound': { es: 'Pagina no encontrada', pt: 'Pagina nao encontrada' },
  'error.generic': { es: 'Algo salio mal', pt: 'Algo deu errado' },
} as const;

export type UIKey = keyof typeof ui;

/**
 * Get a UI translation by key
 */
export function getUIText(key: UIKey, locale: string): string {
  const translations = ui[key];
  return t(translations, locale);
}

/**
 * Format a date according to locale
 */
export function formatDate(date: Date, locale: string): string {
  const config = getLocaleConfig(locale);
  return date.toLocaleDateString(config.dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a relative date (e.g., "3 days ago")
 */
export function formatRelativeDate(date: Date, locale: string): string {
  const config = getLocaleConfig(locale);
  const rtf = new Intl.RelativeTimeFormat(config.dateLocale, { numeric: 'auto' });

  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    return rtf.format(diffInHours, 'hour');
  }
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  if (Math.abs(diffInDays) < 365) {
    return rtf.format(Math.round(diffInDays / 30), 'month');
  }
  return rtf.format(Math.round(diffInDays / 365), 'year');
}

/**
 * Get localized path
 */
export function getLocalizedPath(path: string, locale: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (locale === DEFAULT_LOCALE) {
    return cleanPath;
  }

  return `/${locale}${cleanPath}`;
}

/**
 * Extract locale from path
 */
export function getLocaleFromPath(path: string): SupportedLocale {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return DEFAULT_LOCALE;
}

/**
 * Remove locale prefix from path
 */
export function removeLocaleFromPath(path: string): string {
  const locale = getLocaleFromPath(path);
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return path.replace(new RegExp(`^/${locale}`), '') || '/';
}
