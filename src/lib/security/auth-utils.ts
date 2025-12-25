/**
 * Authentication utilities for API routes
 * Supports both httpOnly cookies (preferred) and Authorization header (backward compatibility)
 * 
 * SECURITY: Designed for Vercel deployment compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { extractToken } from './cookie-utils';
import { secrets } from '@/lib/secrets';
import { userService } from '@/lib/db-service';

const JWT_SECRET = secrets.JWT_SECRET;

export interface AuthResult {
  success: boolean;
  user?: any;
  decoded?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Verify authentication from request
 * Supports both cookie (preferred) and Authorization header (backward compatibility)
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract token from cookie or Authorization header
    const token = extractToken(request);

    if (!token) {
      return {
        success: false,
        error: 'ไม่พบ token สำหรับการยืนยันตัวตน',
        statusCode: 401,
      };
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          error: 'Token หมดอายุ',
          statusCode: 401,
        };
      }
      return {
        success: false,
        error: 'Token ไม่ถูกต้อง',
        statusCode: 401,
      };
    }

    // Find user
    const user = await userService.findById(decoded.id);
    if (!user) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้',
        statusCode: 404,
      };
    }

    return {
      success: true,
      user,
      decoded,
    };
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการยืนยันตัวตน',
      statusCode: 500,
    };
  }
}

/**
 * Middleware helper to verify auth and return error response if failed
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ success: true; user: any; decoded: any } | NextResponse> {
  const authResult = await verifyAuth(request);

  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: authResult.error,
      },
      { status: authResult.statusCode || 401 }
    );
  }

  return {
    success: true as const,
    user: authResult.user!,
    decoded: authResult.decoded!,
  };
}

