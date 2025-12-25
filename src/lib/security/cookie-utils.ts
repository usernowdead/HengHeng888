/**
 * Cookie utilities for secure token storage
 * Uses httpOnly cookies for JWT tokens (more secure than localStorage)
 * Vercel-compatible implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const AUTH_TOKEN_COOKIE = 'auth_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (same as JWT expiry)
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days for refresh token

/**
 * Set authentication token in httpOnly cookie
 * SECURITY: httpOnly prevents JavaScript access (XSS protection)
 */
export function setAuthToken(response: NextResponse, token: string): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set(AUTH_TOKEN_COOKIE, token, {
    httpOnly: true, // Critical: prevents XSS attacks
    secure: isProduction, // HTTPS only in production (allows HTTP in development)
    sameSite: 'lax', // Changed from 'strict' to 'lax' for Brave browser compatibility (still provides CSRF protection)
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    // Don't set domain - let browser use default (better for localhost and subdomains)
  });
  
  return response;
}

/**
 * Set refresh token in httpOnly cookie
 */
export function setRefreshToken(response: NextResponse, refreshToken: string): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production (allows HTTP in development)
    sameSite: 'lax', // Changed from 'strict' to 'lax' for Brave browser compatibility
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
    // Don't set domain - let browser use default (better for localhost and subdomains)
  });
  
  return response;
}

/**
 * Get authentication token from cookie
 */
export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get(AUTH_TOKEN_COOKIE)?.value || null;
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Clear authentication cookies (logout)
 * Vercel-compatible: Sets expired cookies to ensure they're cleared
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Delete cookies
  response.cookies.delete(AUTH_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  
  // Also set expired cookies to ensure they're cleared (Vercel compatibility)
  response.cookies.set(AUTH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for Brave browser compatibility
    maxAge: 0,
    path: '/',
  });
  
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for Brave browser compatibility
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

/**
 * Generate secure refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Extract token from request (supports both cookie and Authorization header for backward compatibility)
 */
export function extractToken(request: NextRequest): string | null {
  // Try cookie first (new method)
  const cookieToken = getAuthToken(request);
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback to Authorization header (backward compatibility)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

