// Security middleware for Next.js API routes
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, authRateLimit, apiRateLimit } from './rate-limit';
import { validateBodySize } from './validation';
import { apiCors, handleCorsPreflight } from './cors';
import { withCSRFProtection } from './csrf';

/**
 * Wraps API route handler with security middleware
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: ReturnType<typeof rateLimit>;
    maxBodySize?: number;
    requireAuth?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Handle CORS preflight requests
      const preflightResponse = handleCorsPreflight(request);
      if (preflightResponse) {
        return preflightResponse;
      }

      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = await options.rateLimit(request as any);
        if (rateLimitResponse) {
          // Apply CORS to rate limit response
          const origin = request.headers.get('origin');
          return apiCors(rateLimitResponse as NextResponse, origin);
        }
      }

      // Body size validation
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        const body = await request.text();
        const maxSize = options.maxBodySize || 1024 * 1024; // 1MB default
        
        const sizeValidation = validateBodySize(body, maxSize);
        if (!sizeValidation.valid) {
          const errorResponse = NextResponse.json(
            {
              success: false,
              message: sizeValidation.errors[0],
            },
            { status: 413 }
          );
          const origin = request.headers.get('origin');
          return apiCors(errorResponse, origin);
        }

        // Re-create request with body for handler
        const clonedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body,
        });

        const response = await handler(clonedRequest);
        const origin = request.headers.get('origin');
        return apiCors(response, origin);
      }

      const response = await handler(request);
      
      // Apply CORS with origin header
      const origin = request.headers.get('origin');
      return apiCors(response, origin);
    } catch (error: any) {
      console.error('Security middleware error:', error);
      const errorResponse = NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
        },
        { status: 500 }
      );
      const origin = request.headers.get('origin');
      return apiCors(errorResponse, origin);
    }
  };
}

/**
 * Default security wrapper for authentication endpoints
 */
export function withAuthSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return withSecurity(handler, {
    rateLimit: authRateLimit,
    maxBodySize: 10 * 1024, // 10KB for auth endpoints
  });
}

/**
 * Default security wrapper for API endpoints
 */
export function withApiSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return withSecurity(handler, {
    rateLimit: apiRateLimit,
    maxBodySize: 1024 * 1024, // 1MB
  });
}

/**
 * Security wrapper with CSRF protection
 * Use for state-changing operations (POST, PUT, PATCH, DELETE)
 */
export function withCSRFSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: ReturnType<typeof rateLimit>;
    maxBodySize?: number;
  } = {}
) {
  const securedHandler = withSecurity(handler, {
    rateLimit: options.rateLimit || apiRateLimit,
    maxBodySize: options.maxBodySize || 1024 * 1024,
  });
  
  return withCSRFProtection(securedHandler);
}

// Explicit export to ensure module resolution
export { withCSRFSecurity as default };

