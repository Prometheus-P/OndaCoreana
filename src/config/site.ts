/**
 * Site Configuration
 *
 * Centralized configuration for navigation, footer, and social links.
 * All components should import from this file to ensure consistency.
 */

/**
 * Navigation link type
 */
export interface NavLink {
  href: string;
  label: string;
}

/**
 * Social link type
 */
export interface SocialLink {
  href: string;
  label: string;
  platform: 'twitter' | 'instagram' | 'youtube' | 'facebook';
}

/**
 * Primary navigation links (header + footer)
 */
export const primaryNav: NavLink[] = [
  { href: '/dramas', label: 'K-Dramas' },
  { href: '/kpop', label: 'K-Pop' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/guias', label: 'Guías' },
];

/**
 * Footer legal links
 */
export const footerLinks: NavLink[] = [
  { href: '/privacidad', label: 'Política de Privacidad' },
  { href: '/terminos', label: 'Términos de Uso' },
];

/**
 * Social media links
 */
export const socialLinks: SocialLink[] = [
  { href: 'https://twitter.com/hallyulatino', label: 'Twitter', platform: 'twitter' },
  { href: 'https://instagram.com/hallyulatino', label: 'Instagram', platform: 'instagram' },
];

/**
 * Site metadata
 */
export const siteConfig = {
  name: 'OndaCoreana',
  description: 'Tu fuente de información sobre K-Dramas, K-Pop y cultura coreana en español.',
  url: 'https://ondacoreana.com',
  defaultLocale: 'es',
};
