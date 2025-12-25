import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { setAuthToken, setRefreshToken, generateRefreshToken } from '@/lib/security/cookie-utils';
import { SecurityLogger, getClientIP, getUserAgent } from '@/lib/security/security-logger';
import { withCSRFSecurity } from '@/lib/security/middleware';

const JWT_SECRET = secrets.JWT_SECRET;

async function handleVerify2FA(request: NextRequest) {
  try {
    const { userId, token: totpToken } = await request.json();

    // Validation
    if (!userId || !totpToken) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      }, { status: 400 });
    }

    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      }, { status: 404 });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({
        success: false,
        message: '2FA ไม่ได้เปิดใช้งาน'
      }, { status: 400 });
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = generateRefreshToken();

    // Format user response
    let balanceValue = 0;
    try {
      if (user.balance && typeof user.balance === 'object' && 'toNumber' in user.balance) {
        balanceValue = (user.balance as any).toNumber();
      } else {
        balanceValue = Number(user.balance) || 0;
      }
    } catch (e) {
      console.error('Error converting balance:', e);
      balanceValue = 0;
    }

    let createdAtISO = '';
    try {
      if (user.createdAt instanceof Date) {
        createdAtISO = user.createdAt.toISOString();
      } else {
        createdAtISO = new Date(user.createdAt as any).toISOString();
      }
    } catch (e) {
      console.error('Error converting createdAt:', e);
      createdAtISO = new Date().toISOString();
    }

    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      balance: balanceValue,
      twoFactorEnabled: user.twoFactorEnabled,
      time: createdAtISO
    };

    // Log successful 2FA login
    SecurityLogger.authSuccess(
      user.id,
      getClientIP(request),
      getUserAgent(request)
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: userWithoutPassword,
        // Still return token for backward compatibility
        token
      }
    });

    // Set tokens in httpOnly cookies (more secure)
    setAuthToken(response, token);
    setRefreshToken(response, refreshToken);

    return response;

  } catch (error) {
    console.error('2FA login verify error:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยัน 2FA'
    }, { status: 500 });
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleVerify2FA);






