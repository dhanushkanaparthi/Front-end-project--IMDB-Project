interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private readonly defaultCapacity = 40;
  private readonly defaultRefillRate = 40;
  private readonly refillInterval = 10000;

  private getBucket(key: string): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.defaultCapacity,
        lastRefill: Date.now(),
        capacity: this.defaultCapacity,
        refillRate: this.defaultRefillRate,
      });
    }
    return this.buckets.get(key)!;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const refillIntervals = Math.floor(timePassed / this.refillInterval);

    if (refillIntervals > 0) {
      bucket.tokens = Math.min(
        bucket.capacity,
        bucket.tokens + refillIntervals * bucket.refillRate
      );
      bucket.lastRefill = now;
    }
  }

  async acquire(key: string, tokens: number = 1): Promise<boolean> {
    const bucket = this.getBucket(key);
    this.refillBucket(bucket);

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return true;
    }

    return false;
  }

  async waitForToken(key: string, tokens: number = 1, maxWaitTime: number = 30000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      if (await this.acquire(key, tokens)) {
        return true;
      }

      const bucket = this.getBucket(key);
      const timeUntilRefill = this.refillInterval - (Date.now() - bucket.lastRefill);
      const waitTime = Math.min(timeUntilRefill, 1000);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    return false;
  }

  getRemainingTokens(key: string): number {
    const bucket = this.getBucket(key);
    this.refillBucket(bucket);
    return bucket.tokens;
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  clear(): void {
    this.buckets.clear();
  }
}

export const rateLimiter = new RateLimiter();

export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  options: {
    tokens?: number;
    maxRetries?: number;
    backoffMs?: number;
  } = {}
): Promise<T> {
  const { tokens = 1, maxRetries = 3, backoffMs = 1000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const acquired = await rateLimiter.waitForToken(key, tokens);

    if (acquired) {
      try {
        return await fn();
      } catch (error: any) {
        if (error.status === 429 && attempt < maxRetries) {
          const retryAfter = error.headers?.['retry-after']
            ? parseInt(error.headers['retry-after']) * 1000
            : backoffMs * Math.pow(2, attempt);

          await new Promise(resolve => setTimeout(resolve, retryAfter));
          continue;
        }
        throw error;
      }
    }

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
    }
  }

  throw new Error('Rate limit exceeded after maximum retries');
}
