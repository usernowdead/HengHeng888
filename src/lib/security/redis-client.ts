/**
 * Redis client for rate limiting
 * Falls back to null if Redis is not available (will use in-memory rate limiting)
 */

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let redisAvailable = false;

/**
 * Initialize Redis client if RATE_LIMIT_REDIS_URL is provided
 */
export async function initializeRedis(): Promise<boolean> {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
  
  if (!redisUrl) {
    console.log('ℹ️  Redis not configured (RATE_LIMIT_REDIS_URL not set), using in-memory rate limiting');
    return false;
  }

  try {
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true, // Lazy connect - connect when needed (better for serverless)
      enableOfflineQueue: false, // Don't queue when offline (fail fast for rate limiting)
    });

    // Test connection by pinging (will auto-connect)
    await redisClient.ping();
    
    redisAvailable = true;
    console.log('✅ Redis connected for rate limiting');
    
    // Handle connection errors
    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      redisAvailable = false;
    });
    
    redisClient.on('connect', () => {
      redisAvailable = true;
    });
    
    redisClient.on('close', () => {
      redisAvailable = false;
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.log('ℹ️  Falling back to in-memory rate limiting');
    redisClient = null;
    redisAvailable = false;
    return false;
  }
}

/**
 * Get Redis client instance (may be null if not available)
 */
export function getRedisClient(): Redis | null {
  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
  }
}

// Auto-initialize on module load (non-blocking)
if (typeof window === 'undefined') {
  initializeRedis().catch((error) => {
    console.error('Failed to initialize Redis:', error);
  });
}

