import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFToken } from '@/lib/security/csrf';

/**
 * GET - Get CSRF token
 * This endpoint generates and returns a CSRF token for the client
 * The token is also set as a cookie for Double Submit Cookie pattern
 */
export async function GET(request: NextRequest) {
  try {
    // Generate new CSRF token
    const token = generateCSRFToken();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      token,
    });

    // Set CSRF token in cookie
    return setCSRFToken(response, token);
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้าง CSRF token',
      },
      { status: 500 }
    );
  }
}
