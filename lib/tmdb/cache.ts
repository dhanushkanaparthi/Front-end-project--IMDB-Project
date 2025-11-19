interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class TMDbCache {
  private static instance: TMDbCache;
  private memoryCache: Map<string, { data: any; expires: number }> = new Map();

  private constructor() {}

  static getInstance(): TMDbCache {
    if (!TMDbCache.instance) {
      TMDbCache.instance = new TMDbCache();
    }
    return TMDbCache.instance;
  }

  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramStr}`;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.generateKey(endpoint, params);

    const memCached = this.memoryCache.get(key);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.data as T;
    }

    return null;
  }

  async set(
    endpoint: string,
    data: any,
    params?: Record<string, any>,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.generateKey(endpoint, params);
    const ttl = options.ttl || 3600;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    this.memoryCache.set(key, {
      data,
      expires: expiresAt.getTime(),
    });
  }

  async invalidate(tags: string[]): Promise<void> {
    this.memoryCache.clear();
  }

  clearMemory(): void {
    this.memoryCache.clear();
  }
}

export const tmdbCache = TMDbCache.getInstance();
