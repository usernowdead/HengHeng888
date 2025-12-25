import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for security headers
 * Applied to all routes in the application
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === 'production';

  // Content Security Policy (CSP)
  // Adjust policy based on your application needs
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com", // Allow Cloudflare Turnstile
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.middle-pay.com https://api.ads4u.co.th https://ads4u.co", // Add your API endpoints
    "frame-src 'self' https://challenges.cloudflare.com", // Allow Cloudflare Turnstile iframes
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  
  // Add CSP Reporting
  const cspReportUri = '/api/v1/csp-report';
  cspDirectives.push(`report-uri ${cspReportUri}`);
  
  // Set CSP header
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  
  // Set Report-To header for CSP reporting (newer standard, for browsers that support it)
  if (isProduction) {
    try {
      response.headers.set(
        'Report-To',
        JSON.stringify({
          group: 'csp-endpoint',
          max_age: 10886400, // 30 days
          endpoints: [{ url: cspReportUri }],
        })
      );
    } catch (error) {
      // Ignore errors in setting Report-To header
      console.warn('Failed to set Report-To header:', error);
    }
  }

  // X-Frame-Options: Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Restrict browser features
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC
  ];
  response.headers.set('Permissions-Policy', permissionsPolicy.join(', '));

  // HSTS: Only in production (HTTPS required)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-XSS-Protection (legacy, but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Configure which routes the middleware runs on
 * Runs on all routes by default
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

