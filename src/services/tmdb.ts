/**
 * TMDB API Service for K-Drama content
 * @see https://developer.themoviedb.org/docs
 */

import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

// Types
export interface TMDBDrama {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBDramaDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  production_companies: { id: number; name: string }[];
  credits?: TMDBCredits;
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
  }[];
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBDrama[];
  total_pages: number;
  total_results: number;
}

// Genre ID to name mapping (TMDB TV genres)
const GENRE_MAP: Record<number, string> = {
  10759: 'Acción y Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  10762: 'Infantil',
  9648: 'Misterio',
  10763: 'Noticias',
  10764: 'Reality',
  10765: 'Ciencia Ficción y Fantasía',
  10766: 'Telenovela',
  10767: 'Talk Show',
  10768: 'Guerra y Política',
  37: 'Western',
};

class TMDBService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('language', 'es-ES'); // Spanish for LatAm

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await axios.get<T>(url.toString());
    return response.data;
  }

  /**
   * Search for Korean dramas by query
   */
  async searchKoreanDramas(query: string, page = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/search/tv', {
      query,
      page,
      with_origin_country: 'KR',
    });
  }

  /**
   * Get popular Korean dramas
   */
  async getPopularKoreanDramas(page = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/discover/tv', {
      page,
      with_origin_country: 'KR',
      sort_by: 'popularity.desc',
      'vote_count.gte': 100, // Filter out obscure titles
    });
  }

  /**
   * Get drama details with credits
   */
  async getDramaDetails(id: number): Promise<TMDBDramaDetail> {
    return this.request<TMDBDramaDetail>(`/tv/${id}`, {
      append_to_response: 'credits',
    });
  }

  /**
   * Get drama credits (cast and crew)
   */
  async getDramaCredits(id: number): Promise<TMDBCredits> {
    return this.request<TMDBCredits>(`/tv/${id}/credits`);
  }

  /**
   * Convert poster path to full URL
   */
  getImageUrl(path: string | null): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE}${path}`;
  }

  /**
   * Get genre names from IDs
   */
  getGenreNames(genreIds: number[]): string[] {
    return genreIds
      .map((id) => GENRE_MAP[id])
      .filter(Boolean);
  }

  /**
   * Get genre names from detail genres
   */
  getGenreNamesFromDetail(genres: { id: number; name: string }[]): string[] {
    return genres.map((g) => GENRE_MAP[g.id] || g.name);
  }

  /**
   * Extract main cast names (top 5)
   */
  getMainCast(credits: TMDBCredits | undefined, limit = 5): string[] {
    if (!credits?.cast) return [];
    return credits.cast
      .slice(0, limit)
      .map((actor) => actor.name);
  }

  /**
   * Get network name (first one)
   */
  getNetwork(networks: { name: string }[]): string | undefined {
    return networks[0]?.name;
  }

  /**
   * Extract year from date string
   */
  getYear(dateString: string): number | undefined {
    if (!dateString) return undefined;
    const year = parseInt(dateString.split('-')[0], 10);
    return isNaN(year) ? undefined : year;
  }

  /**
   * Determine where to watch based on network
   */
  getWhereToWatch(networks: { name: string }[]): string[] {
    const networkName = networks[0]?.name?.toLowerCase() || '';
    const platforms: string[] = [];

    // Netflix originals or distributed
    if (networkName.includes('netflix')) {
      platforms.push('Netflix');
    }
    // Korean networks often on Netflix/Viki
    if (['tvn', 'jtbc', 'kbs', 'sbs', 'mbc'].some((n) => networkName.includes(n))) {
      platforms.push('Netflix', 'Viki');
    }
    // Disney+
    if (networkName.includes('disney')) {
      platforms.push('Disney+');
    }

    // Default fallback
    if (platforms.length === 0) {
      platforms.push('Viki');
    }

    return Array.from(new Set(platforms)); // Remove duplicates
  }
}

// Export singleton instance creator
export function createTMDBService(): TMDBService {
  return new TMDBService();
}

export { TMDBService, TMDB_IMAGE_BASE };
