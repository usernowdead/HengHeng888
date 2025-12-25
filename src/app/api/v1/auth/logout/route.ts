import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/security/cookie-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

/**
 * Logout endpoint
 * Clears authentication cookies
 */
async function handleLogout(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  });

  // Clear authentication cookies
  clearAuthCookies(response);

  return response;
}

export const POST = withCSRFSecurity(handleLogout);

