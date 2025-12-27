import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database URL with connection pooling support for Vercel
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // For Supabase on Vercel, ensure connection pooling is properly configured
  if (process.env.VERCEL && (dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com'))) {
    // Check if pgbouncer is enabled
    const hasPgbouncer = dbUrl.includes('pgbouncer=true');
    const hasConnectionLimit = dbUrl.includes('connection_limit=');
    
    // If pgbouncer is enabled but connection_limit is missing, add it
    if (hasPgbouncer && !hasConnectionLimit) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      return `${dbUrl}${separator}connection_limit=1`;
    }
    
    // If neither pgbouncer nor connection_limit exists, add both
    if (!hasPgbouncer) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      return `${dbUrl}${separator}pgbouncer=true&connection_limit=1`;
    }
  }

  return dbUrl;
}

// Optimized Prisma Client with connection pooling support
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Connection pooling is handled by the connection string
  // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

