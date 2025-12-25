import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handle2FASetup(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const user = authResult.user;

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `Web Store (${user.email})`,
      issuer: 'Web Store'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return NextResponse.json({
      success: true,
      message: 'สร้าง 2FA สำเร็จ',
      data: {
        secret: secret.base32,
        qrCodeUrl,
        otpauth_url: secret.otpauth_url
      }
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตั้งค่า 2FA'
    }, { status: 500 });
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handle2FASetup);







