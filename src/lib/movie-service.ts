// Movie Service
// Manages movie recommendations stored in database
import { prisma } from './db';
import { sanitizeId } from '@/lib/security/sanitize';
import { sanitizeString } from '@/lib/security/validation';
import { getCached, invalidateCache, CACHE_TTL } from './cache';

export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  type: 'movie' | 'series';
  platform?: string | null; // Streaming platform (e.g., "HBO", "Netflix", "Disney+")
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create movies table if it doesn't exist
 * NOTE: This should be handled by Prisma migrations, but kept for backward compatibility
 * SECURITY: Table creation is safe as it doesn't use user input
 */
async function createMoviesTable(): Promise<void> {
  try {
    // Use Prisma migrations instead of raw SQL
    // This function is kept for backward compatibility but should be removed
    // Run: npx prisma migrate dev
  } catch (error) {
    console.error('Error creating movies table:', error);
  }
}

/**
 * Get all movies ordered by order field
 * SECURITY: Uses Prisma ORM to prevent SQL injection
 * PERFORMANCE: Uses caching to reduce database queries
 */
export async function getAllMovies(type?: 'movie' | 'series'): Promise<Movie[]> {
  try {
    const cacheKey = `movies:${type || 'all'}`;
    
    // Use cache for movies (rarely changes)
    return await getCached(
      cacheKey,
      async () => {
        console.log('📚 [MovieService] getAllMovies called with type:', type || 'all');
        
        // Build where clause
        const whereClause: any = {};
        if (type) {
          whereClause.type = type;
        } else {
          // If no type specified, get all (but filter out null types for backward compatibility)
          whereClause.type = { not: null };
        }
        
        console.log('📚 [MovieService] Where clause:', whereClause);
        
        // Use Prisma ORM instead of raw SQL for security
        const movies = await prisma.movie.findMany({
          where: whereClause,
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ]
        });

        console.log('📚 [MovieService] Found', movies.length, 'movies in database');

        return movies.map(movie => ({
          id: movie.id,
          title: movie.title,
          imageUrl: movie.imageUrl,
          type: (movie.type as 'movie' | 'series') || 'movie',
          platform: movie.platform || null,
          order: movie.order,
          createdAt: movie.createdAt.toISOString(),
          updatedAt: movie.updatedAt.toISOString(),
        }));
      },
      CACHE_TTL.MEDIUM // Cache for 5 minutes
    );
  } catch (error) {
    console.error('❌ [MovieService] Error fetching movies:', error);
    console.error('❌ [MovieService] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

/**
 * Get a single movie by ID
 * SECURITY: Uses Prisma ORM and input validation to prevent SQL injection
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  try {
    // Validate and sanitize ID
    const sanitizedId = sanitizeId(id);
    if (!sanitizedId) {
      return null;
    }

    // Use Prisma ORM instead of raw SQL
    const movie = await prisma.movie.findUnique({
      where: { id: sanitizedId }
    });

    if (!movie) return null;

    return {
      id: movie.id,
      title: movie.title,
      imageUrl: movie.imageUrl,
      type: (movie.type as 'movie' | 'series') || 'movie',
      platform: movie.platform || null,
      order: movie.order,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

/**
 * Create a new movie
 * SECURITY: Uses Prisma ORM and input sanitization to prevent SQL injection
 */
export async function createMovie(data: {
  title: string;
  imageUrl: string;
  type?: 'movie' | 'series';
  platform?: string | null;
  order?: number;
}): Promise<Movie> {
  try {
    // Sanitize input
    const sanitizedTitle = sanitizeString(data.title, 200);
    const sanitizedImageUrl = sanitizeString(data.imageUrl, 500);
    const type = (data.type === 'series' ? 'series' : 'movie') as 'movie' | 'series';
    const platform = data.platform ? sanitizeString(data.platform, 50) : null;
    const order = data.order ?? 0;

    if (!sanitizedTitle || !sanitizedImageUrl) {
      throw new Error('Invalid input data');
    }

    // Use Prisma ORM instead of raw SQL
    const movie = await prisma.movie.create({
      data: {
        title: sanitizedTitle,
        imageUrl: sanitizedImageUrl,
        type: type,
        platform: platform,
        order: order,
      }
    });

    // Invalidate cache after creating
    await invalidateCache('movies:*');

    return {
      id: movie.id,
      title: movie.title,
      imageUrl: movie.imageUrl,
      type: (movie.type as 'movie' | 'series') || 'movie',
      platform: movie.platform || null,
      order: movie.order,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error creating movie:', error);
    throw error;
  }
}

/**
 * Update a movie
 * SECURITY: Uses Prisma ORM and input sanitization to prevent SQL injection
 */
export async function updateMovie(
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    type?: 'movie' | 'series';
    platform?: string | null;
    order?: number;
  }
): Promise<Movie | null> {
  try {
    // Validate and sanitize ID
    const sanitizedId = sanitizeId(id);
    if (!sanitizedId) {
      return null;
    }

    // Build update data with sanitization
    const updateData: {
      title?: string;
      imageUrl?: string;
      type?: 'movie' | 'series';
      platform?: string | null;
      order?: number;
    } = {};

    if (data.title !== undefined) {
      updateData.title = sanitizeString(data.title, 200);
      if (!updateData.title) {
        throw new Error('Invalid title');
      }
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = sanitizeString(data.imageUrl, 500);
      if (!updateData.imageUrl) {
        throw new Error('Invalid image URL');
      }
    }
    if (data.type !== undefined) {
      updateData.type = (data.type === 'series' ? 'series' : 'movie') as 'movie' | 'series';
    }
    if (data.platform !== undefined) {
      updateData.platform = data.platform ? sanitizeString(data.platform, 50) : null;
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }

    // Use Prisma ORM instead of raw SQL
    const movie = await prisma.movie.update({
      where: { id: sanitizedId },
      data: updateData
    });

    // Invalidate cache after updating
    await invalidateCache('movies:*');

    return {
      id: movie.id,
      title: movie.title,
      imageUrl: movie.imageUrl,
      type: (movie.type as 'movie' | 'series') || 'movie',
      platform: movie.platform || null,
      order: movie.order,
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Record not found
      return null;
    }
    console.error('Error updating movie:', error);
    throw error;
  }
}

/**
 * Delete a movie
 * SECURITY: Uses Prisma ORM and input validation to prevent SQL injection
 */
export async function deleteMovie(id: string): Promise<boolean> {
  try {
    // Validate and sanitize ID
    const sanitizedId = sanitizeId(id);
    if (!sanitizedId) {
      return false;
    }

    // Use Prisma ORM instead of raw SQL
    try {
      await prisma.movie.delete({
        where: { id: sanitizedId }
      });
      
      // Invalidate cache after deleting
      await invalidateCache('movies:*');
      
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
}

/**
 * Update movie order (for reordering)
 * SECURITY: Uses Prisma ORM and input validation to prevent SQL injection
 */
export async function updateMovieOrder(movies: { id: string; order: number }[]): Promise<void> {
  try {
    // Use transaction for atomic updates
    await prisma.$transaction(
      movies.map(movie => {
        const sanitizedId = sanitizeId(movie.id);
        if (!sanitizedId) {
          throw new Error(`Invalid movie ID: ${movie.id}`);
        }
        return prisma.movie.update({
          where: { id: sanitizedId },
          data: { order: movie.order }
        });
      })
    );
    
    // Invalidate cache after reordering
    await invalidateCache('movies:*');
  } catch (error) {
    console.error('Error updating movie order:', error);
    throw error;
  }
}

