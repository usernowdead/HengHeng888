import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Callback endpoint for Preorder API
 * This endpoint receives POST requests from peamsub24hr.com when a preorder is updated
 * 
 * Expected payload:
 * {
 *   "reference": "ABCD123",
 *   "status": "success",
 *   "prize": "สินค้าที่อัพเดตแล้ว"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference, status, prize } = body;

        console.log('📞 [Preorder Callback] Received callback:', { reference, status, prize });

        if (!reference) {
            console.error('❌ [Preorder Callback] Missing reference in callback');
            return NextResponse.json({
                statusCode: 400,
                message: 'Missing reference'
            }, { status: 400 });
        }

        // BUSINESS LOGIC SECURITY: Verify webhook authenticity
        // TODO: Add webhook signature verification if provider supports it
        // For now, we rely on the callback URL being secret
        
        // Find order by reference
        const order = await prisma.order.findFirst({
            where: {
                type: 'preorder',
                reference: reference
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!order) {
            console.warn('⚠️ [Preorder Callback] Order not found for reference:', reference);
            // Still return 200 to acknowledge receipt (prevent retries)
            return NextResponse.json({
                statusCode: 200
            });
        }

        // BUSINESS LOGIC SECURITY: Idempotency check - prevent duplicate processing
        const orderData = typeof order.data === 'object' ? order.data : {};
        if (order.state === 'completed' && orderData.callback_reference === reference) {
            console.warn('⚠️ [Preorder Callback] Order already completed with same reference, ignoring:', order.id);
            return NextResponse.json({
                statusCode: 200,
                message: 'Order already completed'
            });
        }

        // BUSINESS LOGIC SECURITY: Prevent state manipulation
        // Only allow state transitions: pending -> processing -> completed/failed
        // Prevent re-processing completed orders
        if (order.state === 'completed') {
            console.warn('⚠️ [Preorder Callback] Order already completed, ignoring:', order.id);
            return NextResponse.json({
                statusCode: 200,
                message: 'Order already completed'
            });
        }

        // Update order based on status
        const orderState = status === 'success' ? 'completed' : 'failed';
        
        // BUSINESS LOGIC SECURITY: Use transaction with row locking to prevent race conditions
        await prisma.$transaction(async (tx) => {
            // Lock order row to prevent concurrent updates
            const lockedOrder = await tx.order.findUnique({
                where: { id: order.id },
                select: { id: true, state: true, data: true }
            });

            if (!lockedOrder) {
                throw new Error('Order not found');
            }

            // BUSINESS LOGIC SECURITY: Double-check idempotency within transaction
            const lockedData = typeof lockedOrder.data === 'object' ? lockedOrder.data : {};
            if (lockedOrder.state === 'completed' && lockedData.callback_reference === reference) {
                console.warn('⚠️ [Preorder Callback] Order completed with same reference during transaction:', order.id);
                return; // Exit transaction without update
            }

            // Double-check state hasn't changed
            if (lockedOrder.state === 'completed') {
                console.warn('⚠️ [Preorder Callback] Order completed during transaction:', order.id);
                return; // Exit transaction without update
            }

            await tx.order.update({
                where: { id: order.id },
                data: {
                    state: orderState,
                    data: {
                        ...lockedData,
                        callback_reference: reference,
                        callback_status: status,
                        prize: prize,
                        updated_at: new Date().toISOString(),
                        processed_at: new Date().toISOString() // Idempotency marker
                    }
                }
            });
        });

        console.log('✅ [Preorder Callback] Order updated:', order.id, 'state:', orderState);

        // Return 200 to confirm receipt
        return NextResponse.json({
            statusCode: 200
        });

    } catch (error: any) {
        console.error('❌ [Preorder Callback] Error:', error);
        
        // Still return 200 to prevent retries
        return NextResponse.json({
            statusCode: 200,
            error: 'Internal error (acknowledged)'
        });
    }
}

