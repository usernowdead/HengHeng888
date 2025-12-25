import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
import { orderService } from '@/lib/db-service';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

async function handleSocialStatus(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Parse request body
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ orderId'
            }, { status: 400 });
        }

        // Get order from database
        const order = await orderService.findById(orderId);

        if (!order) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบออเดอร์'
            }, { status: 404 });
        }

        // Check if order belongs to user
        if (order.userId !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'คุณไม่มีสิทธิ์เข้าถึงออเดอร์นี้'
            }, { status: 403 });
        }

        // Get order status from external API
        const externalOrderId = order.reference || order.transactionId;
        if (!externalOrderId) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบ external order ID'
            }, { status: 400 });
        }

        try {
            const response = await axios.get(`${API_URL_ADS4U}`, {
                params: {
                    key: API_KEY_ADS4U,
                    action: 'status',
                    order: externalOrderId
                },
                timeout: 10000,
            });

            return NextResponse.json({
                success: true,
                data: {
                    orderId: order.id,
                    externalOrderId: externalOrderId,
                    status: response.data.status || 'Unknown',
                    charge: response.data.charge || '0',
                    startCount: response.data.start_count || '0',
                    remains: response.data.remains || '0',
                    currency: response.data.currency || 'USD',
                    raw: response.data
                }
            });
        } catch (error: any) {
            console.error('Error fetching order status from external API:', error);
            return NextResponse.json({
                success: false,
                message: error.response?.data?.error || 'ไม่สามารถดึงข้อมูลสถานะออเดอร์ได้',
                data: {
                    orderId: order.id,
                    status: order.state
                }
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error getting order status:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะออเดอร์'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleSocialStatus);

