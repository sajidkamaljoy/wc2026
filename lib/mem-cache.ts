/**
 * Simple in-memory TTL cache for server-side data.
 * Avoids redundant API calls and bypasses Next.js's 2MB data cache limit.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get or set a cached value. If the cache is expired or missing,
 * the fetcher function is called and its result is stored.
 *
 * @param key - Unique cache key
 * @param fetcher - Async function that produces the value
 * @param ttlMs - Time-to-live in milliseconds (default: 1 hour)
 */
export async function memCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 3600_000
): Promise<T> {
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing && Date.now() < existing.expiresAt) {
    return existing.data;
  }

  const data = await fetcher();

  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });

  return data;
}

/**
 * Clear the entire in-memory cache.
 * Useful for testing to ensure a clean state between test runs.
 */
export function clearMemCache(): void {
  store.clear();
}
