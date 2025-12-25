import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { orderService } from '@/lib/db-service';
import { prisma } from '@/lib/db';
import { withCSRFSecurity } from '@/lib/security/middleware';

// GET - Get all orders
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const state = searchParams.get('state');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (type) where.type = type;
        if (state) where.state = state;
        
        // Search by username or email
        if (search) {
            where.OR = [
                { user: { username: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { id: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get orders with filters
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.order.count({ where })
        ]);

        // Format orders
        const ordersWithUserInfo = orders.map(order => ({
            id: order.id,
            userId: order.userId,
            productId: order.productId,
            type: order.type,
            reference: order.reference,
            transactionId: order.transactionId,
            state: order.state,
            price: order.price.toNumber(),
            data: order.data,
            productMetadata: order.productMetadata,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            user: order.user
        }));

        return NextResponse.json({
            success: true,
            orders: ordersWithUserInfo,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Admin orders GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

// PUT - Update order state
async function handleOrdersPUT(request: NextRequest) {
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

        const { orderId, state } = await request.json();

        if (!orderId || !state) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ orderId และ state'
            }, { status: 400 });
        }

        const validStates = ['pending', 'completed', 'failed', 'processing', 'refunded', 'cancelled'];
        if (!validStates.includes(state)) {
            return NextResponse.json({
                success: false,
                message: 'state ไม่ถูกต้อง'
            }, { status: 400 });
        }

        // BUSINESS LOGIC SECURITY: Get current order state to validate state machine transitions
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, state: true, type: true }
        });

        if (!currentOrder) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบออเดอร์'
            }, { status: 404 });
        }

        // BUSINESS LOGIC SECURITY: State machine validation
        // Prevent invalid state transitions
        const currentState = currentOrder.state;
        const validTransitions: Record<string, string[]> = {
            'pending': ['processing', 'completed', 'failed', 'cancelled'],
            'processing': ['completed', 'failed', 'cancelled'],
            'completed': [], // Cannot transition from completed
            'failed': ['refunded'], // Can only refund failed orders
            'refunded': [], // Cannot transition from refunded
            'cancelled': [] // Cannot transition from cancelled
        };

        const allowedStates = validTransitions[currentState] || [];
        if (currentState !== state && !allowedStates.includes(state)) {
            return NextResponse.json({
                success: false,
                message: `ไม่สามารถเปลี่ยน state จาก ${currentState} เป็น ${state} ได้`
            }, { status: 400 });
        }

        // BUSINESS LOGIC SECURITY: Use transaction with row locking to prevent race conditions
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Lock order row
            const lockedOrder = await tx.order.findUnique({
                where: { id: orderId },
                select: { id: true, state: true }
            });

            if (!lockedOrder) {
                throw new Error('Order not found');
            }

            // Double-check state hasn't changed
            if (lockedOrder.state !== currentState) {
                throw new Error(`Order state has changed from ${currentState} to ${lockedOrder.state}`);
            }

            // Update order state
            return await tx.order.update({
                where: { id: orderId },
                data: { state }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'อัปเดตสถานะออเดอร์สำเร็จ',
            order: {
                id: updatedOrder.id,
                userId: updatedOrder.userId,
                productId: updatedOrder.productId,
                type: updatedOrder.type,
                reference: updatedOrder.reference,
                transactionId: updatedOrder.transactionId,
                state: updatedOrder.state,
                price: updatedOrder.price.toNumber(),
                data: updatedOrder.data,
                productMetadata: updatedOrder.productMetadata,
                createdAt: updatedOrder.createdAt.toISOString(),
                updatedAt: updatedOrder.updatedAt.toISOString(),
            }
        });

    } catch (error) {
        console.error('Admin orders PUT error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
        }, { status: 500 });
    }
}

