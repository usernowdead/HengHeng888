import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisAvailable } from './redis-client';

// In-memory store for rate limiting (fallback when Redis is not available)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes (only for in-memory store)
setInterval(() => {
  if (!isRedisAvailable()) {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    });
  }
}, 5 * 60 * 1000);

/**
 * Rate limit using Redis (preferred) or in-memory fallback
 */
async function checkRateLimitRedis(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number; resetTime?: number }> {
  const redis = getRedisClient();
  if (!redis) {
    return { allowed: true }; // Fall back to in-memory
  }

  try {
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);
    const redisKey = `ratelimit:${key}`;
    
    // Increment counter
    const count = await redis.incr(redisKey);
    
    // Set expiration only if this is the first request (count === 1)
    // This ensures the window starts from the first request
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    
    // Get remaining TTL to calculate reset time
    const ttl = await redis.ttl(redisKey);
    const resetTime = now + (ttl > 0 ? ttl * 1000 : windowMs);
    
    if (count > maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((resetTime - now) / 1000),
        resetTime,
      };
    }
    
    return { allowed: true, resetTime };
  } catch (error) {
    console.error('Redis rate limit error, falling back to in-memory:', error);
    return { allowed: true }; // Fall back to in-memory on error
  }
}

/**
 * Rate limit using in-memory store
 */
function checkRateLimitMemory(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number; resetTime?: number } {
  const now = Date.now();
  let entry = rateLimitStore[key];
  
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore[key] = entry;
    return { allowed: true, resetTime: entry.resetTime };
  }
  
  entry.count++;
  
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      resetTime: entry.resetTime,
    };
  }
  
  rateLimitStore[key] = entry;
  return { allowed: true, resetTime: entry.resetTime };
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Combine IP with user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent}`;
}

/**
 * Create a rate limit function
 * Uses Redis if available, otherwise falls back to in-memory store
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number
): (request: NextRequest) => Promise<NextResponse | null> {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const clientId = getClientId(request);
    
    // Try Redis first, fall back to in-memory
    let result: { allowed: boolean; retryAfter?: number; resetTime?: number };
    
    if (isRedisAvailable()) {
      try {
        result = await checkRateLimitRedis(clientId, maxRequests, windowMs);
        // If Redis returns { allowed: true } without resetTime, it means it failed internally
        // In that case, fall back to in-memory
        if (result.allowed && !result.resetTime) {
          result = checkRateLimitMemory(clientId, maxRequests, windowMs);
        }
      } catch (error) {
        // Redis operation failed, fall back to in-memory
        console.error('Rate limit Redis error, using in-memory fallback:', error);
        result = checkRateLimitMemory(clientId, maxRequests, windowMs);
      }
    } else {
      result = checkRateLimitMemory(clientId, maxRequests, windowMs);
    }
    
    if (!result.allowed) {
      // Rate limit exceeded - log security event
      const retryAfter = result.retryAfter || 60;
      const resetTime = result.resetTime || Date.now() + windowMs;
      
      // Import security logger (dynamic import to avoid circular dependency)
      const { SecurityLogger, getClientIP, getUserAgent } = await import('./security-logger');
      SecurityLogger.rateLimit(
        getClientIP(request),
        request.nextUrl.pathname,
        getUserAgent(request)
      );
      
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );
    }
    
    return null; // Allow request
  };
}

/**
 * Rate limit for authentication endpoints
 * Stricter limits: 5 requests per 15 minutes
 */
export const authRateLimit = rateLimit(5, 15 * 60 * 1000);

/**
 * Rate limit for general API endpoints
 * More lenient: 100 requests per minute
 */
export const apiRateLimit = rateLimit(100, 60 * 1000);
