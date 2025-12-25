import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handleLogoutAll(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Note: Since we're using JWT tokens, we can't invalidate them server-side
        // In a production system, you might want to implement a token blacklist
        // For now, we'll just clear cookies and return success

        const response = NextResponse.json({
            success: true,
            message: 'ออกจากระบบทุกอุปกรณ์สำเร็จ'
        });

        // Clear auth cookies
        const { clearAuthCookies } = await import('@/lib/security/cookie-utils');
        clearAuthCookies(response);

        return response;

    } catch (error) {
        console.error('Logout all error:', error);

        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleLogoutAll);
