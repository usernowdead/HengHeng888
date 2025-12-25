import { NextRequest, NextResponse } from 'next/server';
import { SecurityLogger, getClientIP, getUserAgent } from '@/lib/security/security-logger';

/**
 * CSP Violation Report Endpoint
 * Receives and logs Content Security Policy violations
 * 
 * SECURITY: This endpoint should not be rate-limited too strictly
 * as it needs to receive reports from browsers
 */
export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    // Extract violation details
    const violation = report['csp-report'] || report;
    const documentURI = violation['document-uri'] || 'unknown';
    const violatedDirective = violation['violated-directive'] || 'unknown';
    const blockedURI = violation['blocked-uri'] || 'unknown';
    const sourceFile = violation['source-file'] || 'unknown';
    const lineNumber = violation['line-number'] || 'unknown';

    // Log CSP violation as suspicious activity
    SecurityLogger.suspiciousActivity(
      `CSP Violation: ${violatedDirective} blocked ${blockedURI}`,
      getClientIP(request),
      getUserAgent(request),
      undefined,
      {
        documentURI,
        violatedDirective,
        blockedURI,
        sourceFile,
        lineNumber,
        reportType: 'CSP_VIOLATION',
      }
    );

    // Return 204 No Content (standard for CSP reporting)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Don't fail on report parsing errors
    console.error('Error processing CSP report:', error);
    return new NextResponse(null, { status: 204 });
  }
}
