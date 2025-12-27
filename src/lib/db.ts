import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database URL with connection pooling support for Vercel
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    // Return a placeholder URL to prevent module initialization failure
    // The actual error will be caught when Prisma tries to connect
    return 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
  }

  // For Supabase on Vercel, ensure connection pooling is properly configured
  if (process.env.VERCEL && (dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com'))) {
    try {
      // Parse URL to add/update parameters
      const url = new URL(dbUrl);
      
      // Ensure pgbouncer is enabled
      url.searchParams.set('pgbouncer', 'true');
      
      // Set connection limit for serverless (Vercel)
      url.searchParams.set('connection_limit', '1');
      
      // Add SSL requirement for Supabase (required for secure connections)
      if (!url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'require');
      }
      
      // Add connect_timeout for better reliability
      if (!url.searchParams.has('connect_timeout')) {
        url.searchParams.set('connect_timeout', '10');
      }
      
      return url.toString();
    } catch (error) {
      // Fallback: manually append parameters if URL parsing fails
      console.warn('⚠️ Failed to parse DATABASE_URL, using fallback method:', error);
      const separator = dbUrl.includes('?') ? '&' : '?';
      const params = [
        'pgbouncer=true',
        'connection_limit=1',
        'sslmode=require',
        'connect_timeout=10'
      ].join('&');
      return `${dbUrl}${separator}${params}`;
    }
  }

  return dbUrl;
}

// Get the database URL (lazy evaluation to prevent module initialization errors)
let databaseUrl: string | null = null;
function getDatabaseUrlLazy(): string {
  if (!databaseUrl) {
    databaseUrl = getDatabaseUrl();
  }
  return databaseUrl;
}

// Optimized Prisma Client with connection pooling support
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrlLazy(),
    },
  },
  // Connection pooling is handled by the connection string
  // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1&sslmode=require
})

// Log database URL configuration in development (never log full URL in production)
if (process.env.NODE_ENV === 'development') {
  try {
    const urlObj = new URL(getDatabaseUrlLazy());
    console.log('Database connection configured:', {
      host: urlObj.hostname,
      port: urlObj.port,
      database: urlObj.pathname,
      hasPgbouncer: urlObj.searchParams.has('pgbouncer'),
      hasConnectionLimit: urlObj.searchParams.has('connection_limit'),
      sslMode: urlObj.searchParams.get('sslmode'),
      isVercel: !!process.env.VERCEL
    });
  } catch (error) {
    console.warn('⚠️ Could not parse database URL for logging:', error);
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

