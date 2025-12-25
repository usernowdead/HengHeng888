import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handle2FADisable(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const user = authResult.user;

    // Update user to disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'ปิดใช้งาน 2FA สำเร็จ'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการปิดใช้งาน 2FA'
    }, { status: 500 });
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handle2FADisable);







