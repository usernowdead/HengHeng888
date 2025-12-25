import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const user = authResult.user;

    // Format user response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      balance: user.balance.toNumber(),
      twoFactorEnabled: user.twoFactorEnabled,
      time: user.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Me error:', error);

    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    }, { status: 500 });
  }
}
