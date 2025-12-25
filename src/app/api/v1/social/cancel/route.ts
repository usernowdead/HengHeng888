import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
import { orderService } from '@/lib/db-service';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

async function handleSocialCancel(request: NextRequest) {
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

        // Get external order ID
        const externalOrderId = order.reference || order.transactionId;
        if (!externalOrderId) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบ external order ID'
            }, { status: 400 });
        }

        // Request cancel from external API
        try {
            const response = await axios.get(`${API_URL_ADS4U}`, {
                params: {
                    key: API_KEY_ADS4U,
                    action: 'cancel',
                    order: externalOrderId
                },
                timeout: 10000,
            });

            // Update order state in database
            await orderService.update(orderId, {
                state: 'cancelled'
            });

            return NextResponse.json({
                success: true,
                data: {
                    orderId: order.id,
                    externalOrderId: externalOrderId,
                    cancel: response.data.cancel || response.data,
                    message: 'ยกเลิกออเดอร์สำเร็จ'
                }
            });
        } catch (error: any) {
            console.error('Error cancelling order from external API:', error);
            return NextResponse.json({
                success: false,
                message: error.response?.data?.error || 'ไม่สามารถยกเลิกออเดอร์ได้'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error cancelling order:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการยกเลิกออเดอร์'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleSocialCancel);

