import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handle2FAVerify(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const user = authResult.user;

    const { secret, token: totpToken } = await request.json();

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: totpToken,
      window: 2 // Allow 30 seconds window
    });

    if (!verified) {
      return NextResponse.json({
        success: false,
        message: 'รหัส 2FA ไม่ถูกต้อง'
      }, { status: 400 });
    }

    // Update user with 2FA secret
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'เปิดใช้งาน 2FA สำเร็จ'
    });

  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยัน 2FA'
    }, { status: 500 });
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handle2FAVerify);







