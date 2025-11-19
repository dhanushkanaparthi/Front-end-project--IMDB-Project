const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class TMDbClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = TMDB_BASE_URL;
    this.apiKey = TMDB_API_KEY;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    return response.json();
  }

  async getMovie(id: number) {
    return this.fetch(`/movie/${id}`, {
      append_to_response: 'credits,videos,reviews,similar',
    });
  }

  async getPerson(id: number) {
    return this.fetch(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits,combined_credits',
    });
  }

  async searchMovies(query: string, page: number = 1) {
    return this.fetch('/search/movie', { query, page: page.toString() });
  }

  async getPopularMovies(page: number = 1) {
    return this.fetch('/movie/popular', { page: page.toString() });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
    return this.fetch(`/trending/movie/${timeWindow}`);
  }

  getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  getProfileUrl(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string {
    if (!path) return '/placeholder-person.jpg';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdbClient = new TMDbClient();
