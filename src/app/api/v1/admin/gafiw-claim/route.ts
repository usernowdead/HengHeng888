import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

// POST - Submit a claim to Gafiwshop
async function handleGafiwClaim(request: NextRequest) {
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

        // Parse request body
        const { order_id, reason, contact } = await request.json();

        // Validate required fields
        if (!order_id) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุรหัสออเดอร์'
            }, { status: 400 });
        }

        if (!reason || reason.trim() === '') {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุสาเหตุการเคลม'
            }, { status: 400 });
        }

        // Submit claim to Gafiwshop API
        try {
            const params: any = {
                keyapi: API_KEY_GAFIW,
                order_id: order_id.toString(),
                reason: reason.trim()
            };

            if (contact) {
                params.contact = contact.trim();
            }

            const response = await axios.post(`${API_URL_GAFIW}/api_claim`, params, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            if (response.data && response.data.ok) {
                return NextResponse.json({
                    success: true,
                    message: response.data.message || 'แจ้งเคลมสำเร็จ',
                    data: {
                        claim_id: response.data.data?.claim_id,
                        order_id: response.data.data?.order_id,
                        reason: response.data.data?.reason,
                        status: response.data.data?.status || 'pending',
                        created_at: response.data.data?.created_at,
                        estimated_response: response.data.data?.estimated_response
                    }
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: response.data?.message || 'การแจ้งเคลมล้มเหลว'
                }, { status: 500 });
            }
        } catch (apiError: any) {
            console.error('Gafiwshop API error:', apiError);
            return NextResponse.json({
                success: false,
                message: apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการแจ้งเคลม',
                error: apiError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Admin gafiw claim POST error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแจ้งเคลม'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleGafiwClaim);

