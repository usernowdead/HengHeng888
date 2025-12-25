/**
 * Health Check Endpoint
 * Used by monitoring services and load balancers
 * 
 * @route GET /api/v1/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-pool';
import { getCacheStats } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseHealth();
    
    // Check cache (if Redis is configured)
    let cacheHealthy = true;
    let cacheStats = null;
    try {
      cacheStats = getCacheStats();
    } catch (error) {
      cacheHealthy = false;
    }

    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      (key) => !process.env[key]
    );

    const responseTime = Date.now() - startTime;

    // Determine overall health status
    const healthy = dbHealthy && cacheHealthy && missingEnvVars.length === 0;

    const status = healthy ? 200 : 503;

    return NextResponse.json(
      {
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        checks: {
          database: {
            status: dbHealthy ? 'ok' : 'error',
            connected: dbHealthy,
          },
          cache: {
            status: cacheHealthy ? 'ok' : 'warning',
            stats: cacheStats,
          },
          environment: {
            status: missingEnvVars.length === 0 ? 'ok' : 'error',
            missing: missingEnvVars,
          },
        },
        version: process.env.npm_package_version || '1.0.0',
      },
      { status }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

