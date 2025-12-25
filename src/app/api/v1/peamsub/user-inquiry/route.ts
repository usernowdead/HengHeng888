/**
 * Peamsub User Inquiry API
 * Endpoint: GET /api/v1/peamsub/user-inquiry
 * 
 * ตรวจสอบข้อมูลผู้ใช้จาก Peamsub24hr API
 * ตามเอกสาร: GET https://api.peamsub24hr.com/v2/user/inquiry
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { verifyPeamsubUser, isPeamsubConfigured } from '@/lib/peamsub-client';
import { withApiSecurity } from '@/lib/security/middleware';

async function handleUserInquiry(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        // Check if Peamsub is configured
        if (!isPeamsubConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'API Key ไม่ได้ถูกตั้งค่า กรุณาตั้งค่า API_KEY_PEAMSUB ในไฟล์ .env.local'
            }, { status: 500 });
        }

        // Get optional userId from query params
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;

        console.log('🔍 [Peamsub User Inquiry] Verifying user:', userId || 'current user');

        // Call Peamsub API
        const result = await verifyPeamsubUser(userId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: result.data
            });
        }

        return NextResponse.json({
            success: false,
            error: result.error || 'ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้'
        }, { status: 500 });

    } catch (error: any) {
        console.error('❌ [Peamsub User Inquiry] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
        }, { status: 500 });
    }
}

// Export with rate limiting
export const GET = withApiSecurity(handleUserInquiry);

