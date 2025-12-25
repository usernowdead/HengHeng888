/**
 * Database Connection Pooling Configuration
 * Optimized for Vercel and production environments
 * 
 * @module db-pool
 */

import { PrismaClient } from '../generated/prisma/client';

// Global Prisma Client instance with connection pooling
let prisma: PrismaClient | undefined;

/**
 * Get or create Prisma Client instance with optimized configuration
 * Uses connection pooling for better performance in serverless environments
 */
export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  // Connection pool configuration
  const connectionLimit = process.env.DATABASE_POOL_SIZE 
    ? parseInt(process.env.DATABASE_POOL_SIZE, 10) 
    : 10;

  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize for serverless (Vercel)
    // Connection pooling is handled by the connection string (pgbouncer)
    // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1
  });

  // Handle graceful shutdown
  if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
      await prisma?.$disconnect();
    });
  }

  return prisma;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get database connection stats (for monitoring)
 */
export async function getDatabaseStats() {
  try {
    const client = getPrismaClient();
    // This is a simple query to check connection
    await client.$queryRaw`SELECT 1`;
    return {
      connected: true,
      poolSize: process.env.DATABASE_POOL_SIZE || 'default',
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default getPrismaClient;

