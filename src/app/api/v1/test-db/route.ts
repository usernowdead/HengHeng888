/**
 * Database Connection Test Endpoint
 * Used to diagnose database connection issues
 * 
 * @route GET /api/v1/test-db
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
    },
    database: {
      urlConfigured: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0,
      urlPreview: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
        : 'NOT SET',
    },
    tests: {} as any,
  };

  // Test 1: Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    results.tests.envCheck = {
      status: 'FAILED',
      message: 'DATABASE_URL is not set',
    };
    return NextResponse.json(results, { status: 500 });
  }

  results.tests.envCheck = {
    status: 'PASSED',
    message: 'DATABASE_URL is set',
  };

  // Test 2: Try to connect to database
  try {
    await prisma.$connect();
    results.tests.connection = {
      status: 'PASSED',
      message: 'Successfully connected to database',
    };
  } catch (error: any) {
    results.tests.connection = {
      status: 'FAILED',
      message: error.message,
      code: error.code,
      name: error.name,
    };
    return NextResponse.json(results, { status: 500 });
  }

  // Test 3: Try a simple query
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    results.tests.query = {
      status: 'PASSED',
      message: 'Successfully executed query',
      result,
    };
  } catch (error: any) {
    results.tests.query = {
      status: 'FAILED',
      message: error.message,
      code: error.code,
      name: error.name,
    };
    return NextResponse.json(results, { status: 500 });
  }

  // Test 4: Try to query User table
  try {
    const userCount = await prisma.user.count();
    results.tests.userTable = {
      status: 'PASSED',
      message: 'Successfully queried User table',
      userCount,
    };
  } catch (error: any) {
    results.tests.userTable = {
      status: 'FAILED',
      message: error.message,
      code: error.code,
      name: error.name,
    };
  }

  // Test 5: Check Prisma client info
  try {
    const prismaInfo = await prisma.$queryRaw`SELECT version() as version`;
    results.tests.prismaInfo = {
      status: 'PASSED',
      message: 'Prisma client is working',
      info: prismaInfo,
    };
  } catch (error: any) {
    results.tests.prismaInfo = {
      status: 'FAILED',
      message: error.message,
    };
  }

  // Disconnect
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Ignore disconnect errors
  }

  return NextResponse.json(results, { status: 200 });
}

