import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const API_KEY_EASYSLIP = secrets.API_KEY_EASYSLIP;
const EASYSLIP_API_URL = 'https://developer.easyslip.com/api/v1';

async function handleEasyslipTruewallet(request: NextRequest) {
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

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const checkDuplicate = formData.get('checkDuplicate') === 'true' || formData.get('checkDuplicate') === true;

        if (!file) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาอัปโหลดไฟล์ภาพสลิป TrueWallet'
            }, { status: 400 });
        }

        // Convert File to Blob for FormData
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });

        // Create FormData for EasySlip API
        const easyslipFormData = new FormData();
        easyslipFormData.append('file', blob, file.name);
        if (checkDuplicate) {
            easyslipFormData.append('checkDuplicate', 'true');
        }

        // Call EasySlip API
        const response = await axios.post(
            `${EASYSLIP_API_URL}/verify/truewallet`,
            easyslipFormData,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY_EASYSLIP}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            }
        );

        const responseData = response.data;

        if (responseData.status === 200 && responseData.data) {
            return NextResponse.json({
                success: true,
                message: 'ตรวจสอบสลิป TrueWallet สำเร็จ',
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
        console.error('EasySlip verify TrueWallet error:', error);
        
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

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleEasyslipTruewallet);

