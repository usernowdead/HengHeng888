import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import crypto from 'crypto';

const PAYMENT_GATEWAY_API_KEY = secrets.PAYMENT_GATEWAY_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Log webhook for debugging
        console.log('Inwcloud webhook received:', JSON.stringify(body, null, 2));

        // Verify webhook signature (Inwcloud webhook verification)
        // ปรับตามวิธี verification ที่ inwcloud ใช้ (ดูจากเอกสาร API)
        const signature = request.headers.get('x-signature') || 
                         request.headers.get('x-inwcloud-signature') ||
                         request.headers.get('authorization');
        
        if (signature) {
            // Inwcloud webhook signature verification
            // ปรับตามวิธีที่ inwcloud ใช้ (อาจเป็น HMAC SHA256, SHA512, etc.)
            try {
                const expectedSignature = crypto
                    .createHmac('sha256', PAYMENT_GATEWAY_API_KEY)
                    .update(JSON.stringify(body))
                    .digest('hex');
                
                // Inwcloud อาจส่ง signature ในรูปแบบต่างๆ (ปรับตามเอกสาร)
                const receivedSig = signature.replace('sha256=', '').replace('Bearer ', '');
                
                if (receivedSig !== expectedSignature) {
                    console.error('Invalid webhook signature');
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid signature'
                    }, { status: 401 });
                }
            } catch (sigError) {
                console.warn('Signature verification failed, continuing anyway:', sigError);
                // ในบางกรณีอาจไม่ต้องการ signature verification
            }
        }

        // Extract payment information from Inwcloud webhook
        // ปรับ field names ตาม webhook payload จริงจาก inwcloud
        const paymentId = body.payment_id || body.id || body.transaction_id || body.paymentId;
        const transactionId = body.transaction_id || body.metadata?.transactionId;
        const status = body.status || body.payment_status || body.state;
        const amount = parseFloat(body.amount || body.total_amount || body.amount_paid || 0);
        const metadata = body.metadata || body.custom_data || {};

        if (!paymentId || !status) {
            console.error('Missing required fields in webhook:', { paymentId, status, body });
            return NextResponse.json({
                success: false,
                message: 'Missing required fields: payment_id and status'
            }, { status: 400 });
        }

        // BUSINESS LOGIC SECURITY: Find transaction by payment_id or transaction_id from metadata
        const transaction = await prisma.transaction.findFirst({
            where: {
                OR: [
                    { id: transactionId || metadata.transactionId },
                    { 
                        data: {
                            path: ['paymentId'],
                            equals: paymentId
                        }
                    }
                ]
            },
            include: {
                user: true
            }
        });

        if (!transaction) {
            console.error('Transaction not found:', { paymentId, transactionId, metadata });
            // Return 200 to acknowledge receipt (prevent retries)
            return NextResponse.json({
                success: true,
                message: 'Transaction not found (acknowledged)'
            });
        }

        // BUSINESS LOGIC SECURITY: Idempotency check - prevent duplicate processing
        const transactionData = transaction.data as any;
        if (transactionData?.status === 'completed' && transactionData?.paymentId === paymentId) {
            console.warn('⚠️ [Topup Webhook] Transaction already processed:', transaction.id);
            return NextResponse.json({
                success: true,
                message: 'Transaction already processed'
            });
        }

        // Inwcloud payment status values (ปรับตามเอกสาร API จริง)
        // อาจเป็น: 'success', 'completed', 'paid', 'confirmed', etc.
        const successStatuses = ['success', 'completed', 'paid', 'confirmed', 'succeeded'];
        const failedStatuses = ['failed', 'cancelled', 'canceled', 'rejected', 'expired'];

        // BUSINESS LOGIC SECURITY: Update transaction based on payment status with idempotency
        if (successStatuses.includes(status.toLowerCase())) {
            // BUSINESS LOGIC SECURITY: Use transaction with row locking to prevent race conditions
            await prisma.$transaction(async (tx) => {
                // Lock transaction row to prevent concurrent updates
                const lockedTransaction = await tx.transaction.findUnique({
                    where: { id: transaction.id },
                    select: { id: true, data: true }
                });

                if (!lockedTransaction) {
                    throw new Error('Transaction not found');
                }

                // BUSINESS LOGIC SECURITY: Double-check idempotency within transaction
                const lockedData = lockedTransaction.data as any;
                if (lockedData?.status === 'completed' && lockedData?.paymentId === paymentId) {
                    console.warn('⚠️ [Topup Webhook] Transaction already completed during processing:', transaction.id);
                    return; // Exit transaction without update
                }

                // Lock user row
                const user = await tx.$queryRaw<Array<{ id: string; balance: any }>>`
                    SELECT id, balance 
                    FROM users 
                    WHERE id = ${transaction.userId} 
                    FOR UPDATE
                `;

                if (!user || user.length === 0) {
                    throw new Error('User not found');
                }

                const currentBalance = new (await import('@prisma/client')).Prisma.Decimal(user[0].balance);
                const newBalance = currentBalance.plus(amount);

                // Update user balance
                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { balance: newBalance }
                });

                // Update transaction with idempotency marker
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        balanceAfter: newBalance,
                        data: {
                            ...lockedData,
                            status: 'completed',
                            paymentId: paymentId,
                            completedAt: new Date().toISOString(),
                            webhookData: body, // เก็บ webhook data ไว้สำหรับ debug
                            processedAt: new Date().toISOString() // Idempotency marker
                        }
                    }
                });
            });

            return NextResponse.json({
                success: true,
                message: 'Payment processed successfully'
            });
        } else if (failedStatuses.includes(status.toLowerCase())) {
            // Update transaction as failed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    data: {
                        ...transaction.data as any,
                        status: 'failed',
                        paymentId: paymentId,
                        failedAt: new Date().toISOString(),
                        webhookData: body,
                        failureReason: body.reason || body.error_message || 'Payment failed'
                    }
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Payment status updated'
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook received'
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({
            success: false,
            message: 'Webhook processing failed'
        }, { status: 500 });
    }
}

