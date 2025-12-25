/**
 * Caching utilities for API responses and database queries
 * Uses Redis (preferred) or in-memory fallback
 * 
 * SRE: Critical for performance optimization
 */

import { getRedisClient, isRedisAvailable } from './security/redis-client';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60,      // 1 minute - for frequently changing data
  MEDIUM: 300,    // 5 minutes - for moderately changing data
  LONG: 3600,     // 1 hour - for rarely changing data
  VERY_LONG: 86400, // 24 hours - for static data
} as const;

// In-memory cache fallback (when Redis is not available)
interface MemoryCacheEntry {
  data: any;
  expiresAt: number;
}

const memoryCache: Map<string, MemoryCacheEntry> = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get cached data or fetch and cache it
 * 
 * @param key Cache key
 * @param fetcher Function to fetch data if cache miss
 * @param ttl Time to live in seconds (default: 5 minutes)
 * @returns Cached or freshly fetched data
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  const redis = getRedisClient();
  
  // Try Redis cache first
  if (redis && isRedisAvailable()) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      console.error(`[Cache] Redis read error for key "${key}":`, error);
      // Fall through to memory cache or fetch
    }
  }
  
  // Try memory cache
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return memoryEntry.data as T;
  }
  
  // Cache miss - fetch data
  const data = await fetcher();
  
  // Cache the result
  if (redis && isRedisAvailable()) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error(`[Cache] Redis write error for key "${key}":`, error);
      // Fall through to memory cache
    }
  }
  
  // Also cache in memory as fallback
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + (ttl * 1000),
  });
  
  return data;
}

/**
 * Invalidate cache by key pattern
 * 
 * @param pattern Cache key pattern (supports Redis KEYS pattern)
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  
  if (redis && isRedisAvailable()) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`[Cache] Invalidation error for pattern "${pattern}":`, error);
    }
  }
  
  // Also invalidate memory cache
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Invalidate specific cache key
 * 
 * @param key Cache key to invalidate
 */
export async function invalidateKey(key: string): Promise<void> {
  const redis = getRedisClient();
  
  if (redis && isRedisAvailable()) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`[Cache] Key invalidation error for "${key}":`, error);
    }
  }
  
  // Also invalidate memory cache
  memoryCache.delete(key);
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache(): Promise<void> {
  const redis = getRedisClient();
  
  if (redis && isRedisAvailable()) {
    try {
      const keys = await redis.keys('cache:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('[Cache] Clear all error:', error);
    }
  }
  
  // Clear memory cache
  memoryCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  memoryCacheSize: number;
  redisAvailable: boolean;
} {
  return {
    memoryCacheSize: memoryCache.size,
    redisAvailable: isRedisAvailable(),
  };
}

