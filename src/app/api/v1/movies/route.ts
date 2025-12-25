/**
 * Public API endpoint for movies/series
 * Includes caching for performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllMovies } from '@/lib/movie-service';
import { getCached, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable Next.js cache - we handle caching ourselves

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    // Get fresh data (cache is invalidated when movies are created/updated)
    // Use shorter TTL for development, longer for production
    const cacheKey = `movies:${type}`;
    const cacheTTL = process.env.NODE_ENV === 'development' ? CACHE_TTL.SHORT : CACHE_TTL.MEDIUM;
    const movies = await getCached(
      cacheKey,
      () => getAllMovies(type === 'series' ? 'series' : 'movie'),
      cacheTTL
    );

    return NextResponse.json(
      {
        success: true,
        movies,
        count: movies.length,
        type,
      },
      {
        headers: {
          // In development: no cache to see changes immediately
          // In production: short cache with revalidation
          'Cache-Control': process.env.NODE_ENV === 'development' 
            ? 'no-store, no-cache, must-revalidate'
            : 'public, s-maxage=60, stale-while-revalidate=30', // 1 minute cache
        },
      }
    );
  } catch (error) {
    console.error('Movies API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลหนังได้',
        movies: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
