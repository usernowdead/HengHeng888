import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration for API routes
 * Uses whitelist from CORS_ALLOWED_ORIGINS environment variable
 * Default: no origins allowed (must be explicitly configured)
 */
const ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : [];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-CSRF-Token',
  'Accept',
  'Origin',
];

/**
 * Check if an origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Apply CORS headers to a NextResponse
 * By default: no wildcard, no credentials (security best practice)
 */
export function apiCors(response: NextResponse, origin?: string | null): NextResponse {
  // If no whitelist configured, reject all CORS requests (but allow same-origin)
  if (ALLOWED_ORIGINS.length === 0) {
    // No CORS headers set, browser will block cross-origin but allow same-origin
    return response;
  }

  // Check if origin is in whitelist
  const originHeader = origin || null;
  
  // If no origin header, it's a same-origin request - allow it without CORS headers
  if (!originHeader) {
    return response; // Same-origin requests don't need CORS headers
  }
  
  if (isOriginAllowed(originHeader)) {
    // Origin is whitelisted: set specific origin and allow credentials
    response.headers.set('Access-Control-Allow-Origin', originHeader);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    // Add other CORS headers
    response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
    response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  } else {
    // Origin not whitelisted: reject (no CORS headers, browser will block)
    return response;
  }

  return response;
}

/**
 * Handle OPTIONS preflight request
 * Returns proper preflight response if origin is allowed
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    
    // Check if origin is allowed
    if (!origin || !isOriginAllowed(origin)) {
      // Return 403 for disallowed origins
      return new NextResponse(null, { status: 403 });
    }

    // Return proper preflight response
    const response = new NextResponse(null, { status: 204 });
    return apiCors(response, origin);
  }
  return null;
}
