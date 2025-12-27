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
let prismaInstance: PrismaClient;

try {
  // Get database URL first
  const dbUrl = getDatabaseUrlLazy();
  
  // Log database URL configuration (never log full URL in production)
  try {
    const urlObj = new URL(dbUrl);
    const logInfo = {
      host: urlObj.hostname,
      port: urlObj.port,
      database: urlObj.pathname,
      hasPgbouncer: urlObj.searchParams.has('pgbouncer'),
      hasConnectionLimit: urlObj.searchParams.has('connection_limit'),
      sslMode: urlObj.searchParams.get('sslmode'),
      connectTimeout: urlObj.searchParams.get('connect_timeout'),
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [DB] Database connection configured:', logInfo);
    } else {
      // In production, only log if there's an issue
      console.log('✅ [DB] Database connection initialized:', {
        host: logInfo.host,
        hasPgbouncer: logInfo.hasPgbouncer,
        isVercel: logInfo.isVercel,
      });
    }
  } catch (error) {
    console.warn('⚠️ [DB] Could not parse database URL for logging:', error);
  }

  // Create Prisma client instance
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    // Connection pooling is handled by the connection string
    // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1&sslmode=require
  });

  // Store in global for development to prevent multiple instances
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error: any) {
  console.error('❌ [DB] Failed to initialize Prisma Client:', error);
  console.error('❌ [DB] Error details:', {
    message: error.message,
    code: error.code,
    name: error.name,
  });
  
  // Create a fallback Prisma client that will fail at runtime
  // This prevents module initialization errors
  prismaInstance = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
      },
    },
  });
}

export const prisma = prismaInstance;

