/**
 * Streaming Platform Configuration
 * Metadata for streaming platforms used in drama filtering
 */

import type { StreamingPlatform } from '../utils/content-helpers';

export interface PlatformConfig {
  id: StreamingPlatform;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  /** Available in Latin America */
  availableLatam: boolean;
}

export const streamingPlatforms: PlatformConfig[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'Netflix',
    icon: '🔴',
    color: '#E50914',
    availableLatam: true,
  },
  {
    id: 'viki',
    name: 'Viki Rakuten',
    shortName: 'Viki',
    icon: '💜',
    color: '#1CE783',
    availableLatam: true,
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    shortName: 'Disney+',
    icon: '🏰',
    color: '#113CCF',
    availableLatam: true,
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    shortName: 'Prime',
    icon: '📦',
    color: '#00A8E1',
    availableLatam: true,
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    shortName: 'Apple TV+',
    icon: '🍎',
    color: '#000000',
    availableLatam: true,
  },
  {
    id: 'kocowa',
    name: 'KOCOWA',
    shortName: 'KOCOWA',
    icon: '🇰🇷',
    color: '#FF6B35',
    availableLatam: false,
  },
  {
    id: 'wavve',
    name: 'Wavve',
    shortName: 'Wavve',
    icon: '🌊',
    color: '#5B36DC',
    availableLatam: false,
  },
  {
    id: 'tving',
    name: 'TVING',
    shortName: 'TVING',
    icon: '📺',
    color: '#FF0558',
    availableLatam: false,
  },
];

/**
 * Get platforms available in Latin America
 */
export const latamPlatforms = streamingPlatforms.filter((p) => p.availableLatam);

/**
 * Get platform config by ID
 */
export function getPlatformById(id: StreamingPlatform): PlatformConfig | undefined {
  return streamingPlatforms.find((p) => p.id === id);
}

/**
 * Day of week labels in Spanish
 */
export const airingDayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/**
 * Get formatted airing schedule text
 */
export function getAiringScheduleText(day: string | undefined): string {
  if (!day) return '';
  return airingDayLabels[day] || day;
}
