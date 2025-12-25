import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';

/**
 * GET - Get user balance
 * Returns the current balance of the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const user = authResult.user;

    // Format balance
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

    return NextResponse.json({
      success: true,
      balance: balanceValue,
      message: 'ดึงข้อมูลยอดเงินสำเร็จ'
    });

  } catch (error) {
    console.error('Balance error:', error);

    return NextResponse.json({
      success: false,
      balance: 0,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยอดเงิน'
    }, { status: 500 });
  }
}

