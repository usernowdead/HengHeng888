import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';
import { requireAuth } from '@/lib/security/auth-utils';
import { withApiSecurity } from '@/lib/security/middleware';

const API_KEY_EASYSLIP = secrets.API_KEY_EASYSLIP;
const EASYSLIP_API_URL = 'https://developer.easyslip.com/api/v1';

async function handleEasyslipPayload(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        // Check API key
        if (!API_KEY_EASYSLIP || API_KEY_EASYSLIP === 'apikey_easyslip_default_change_in_production') {
            console.error('EasySlip API Key not configured');
            return NextResponse.json({
                success: false,
                message: 'ระบบตรวจสอบสลิปไม่พร้อมใช้งานในขณะนี้ กรุณาติดต่อฝ่ายสนับสนุน'
            }, { status: 503 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const payload = searchParams.get('payload');
        const checkDuplicate = searchParams.get('checkDuplicate') === 'true';

        if (!payload) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ payload'
            }, { status: 400 });
        }

        // Build query string
        const queryParams = new URLSearchParams({
            payload: payload
        });
        if (checkDuplicate) {
            queryParams.append('checkDuplicate', 'true');
        }

        // Call EasySlip API
        const response = await axios.get(
            `${EASYSLIP_API_URL}/verify?${queryParams.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY_EASYSLIP}`
                },
                timeout: 30000
            }
        );

        const responseData = response.data;

        if (responseData.status === 200 && responseData.data) {
            return NextResponse.json({
                success: true,
                message: 'ตรวจสอบสลิปสำเร็จ',
                data: responseData.data
            });
        } else {
            return NextResponse.json({
                success: false,
                message: responseData.message || 'ไม่สามารถตรวจสอบสลิปได้',
                error: responseData.message
            }, { status: responseData.status || 400 });
        }
    } catch (error: any) {
        console.error('EasySlip verify payload error:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการตรวจสอบสลิป';
        let statusCode = 500;

        if (error.response) {
            statusCode = error.response.status;
            const errorData = error.response.data;
            
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (statusCode === 401) {
                errorMessage = 'ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง';
            } else if (statusCode === 403) {
                errorMessage = 'ไม่สามารถตรวจสอบสลิปได้ กรุณาติดต่อฝ่ายสนับสนุน';
            } else if (statusCode === 400) {
                errorMessage = errorData.message || 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
            }
        }

        return NextResponse.json({
            success: false,
            message: errorMessage,
            error: error.response?.data?.message || error.message
        }, { status: statusCode });
    }
}

// Export with rate limiting (GET doesn't need CSRF)
export const GET = withApiSecurity(handleEasyslipPayload);

