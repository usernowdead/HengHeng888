/**
 * CSRF Protection utilities
 * Implements Double Submit Cookie pattern for CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Generate a secure random CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Set CSRF token in response cookie
 */
export function setCSRFToken(response: NextResponse, token: string): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use 'lax' instead of 'strict' for better cross-browser compatibility
  // 'lax' still provides CSRF protection but is more compatible with privacy-focused browsers like Brave
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false, // Must be accessible to JavaScript for Double Submit Cookie pattern
    secure: isProduction, // HTTPS only in production (allows HTTP in development)
    sameSite: 'lax', // Changed from 'strict' to 'lax' for Brave browser compatibility
    maxAge: CSRF_TOKEN_MAX_AGE,
    path: '/',
    // Don't set domain - let browser use default (better for localhost and subdomains)
  });
  return response;
}

/**
 * Verify CSRF token from request
 * Compares token from header with token from cookie
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

  // Both tokens must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeEquals(headerToken, cookieToken);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware to add CSRF protection to API routes
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Verify CSRF token for state-changing methods
    if (!verifyCSRFToken(request)) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSRF token verification failed',
        },
        { status: 403 }
      );
    }

    // Call the handler
    const response = await handler(request);

    // If response doesn't have CSRF token cookie, generate and set one
    if (!response.cookies.get(CSRF_TOKEN_COOKIE)) {
      const newToken = generateCSRFToken();
      setCSRFToken(response, newToken);
    }

    return response;
  };
}

/**
 * Get CSRF token endpoint - returns token for client to use
 */
export async function getCSRFToken(request: NextRequest): Promise<NextResponse> {
  const token = generateCSRFToken();
  const response = NextResponse.json({
    success: true,
    token,
  });

  return setCSRFToken(response, token);
}

