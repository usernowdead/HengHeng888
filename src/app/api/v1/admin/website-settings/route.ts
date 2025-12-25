import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { getWebsiteSettings, saveWebsiteSettings } from '@/lib/website-settings';
import { withCSRFSecurity } from '@/lib/security/middleware';

// GET - Get website settings
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get settings from database
        const settings = await getWebsiteSettings();

        return NextResponse.json({
            success: true,
            settings: settings,
            data: settings
        });

    } catch (error) {
        console.error('Admin website settings GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

// POST - Save website settings (บันทึกใน database สำหรับอนาคต)
async function handleWebsiteSettingsPOST(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get settings from request body
        const settings = await request.json();

        // Validate that settings object is provided
        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({
                success: false,
                message: 'กรุณาส่งข้อมูลการตั้งค่า'
            }, { status: 400 });
        }

        // Save settings to database
        await saveWebsiteSettings(settings, authResult.user.id);

        return NextResponse.json({
            success: true,
            message: 'บันทึกการตั้งค่าสำเร็จ',
            data: settings
        });

    } catch (error) {
        console.error('Admin website settings POST error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        }, { status: 500 });
    }
}

