import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { orderService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Get user's topup orders
        const orders = await orderService.findByUserId(user.id, 'topup_game');

        // Format response
        const formattedOrders = orders.map(order => ({
            id: order.id,
            productId: order.productId,
            transactionId: order.transactionId,
            state: order.state,
            price: order.price.toNumber(),
            data: order.data,
            productMetadata: order.productMetadata,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            count: formattedOrders.length
        });

    } catch (error) {
        console.error('Topup orders error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}


