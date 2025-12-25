import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const PAYMENT_GATEWAY_API_KEY = secrets.PAYMENT_GATEWAY_API_KEY?.trim();
const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://api.inwcloud.shop';

// POST - Check payment status with transactionId
async function handleTopupCheck(request: NextRequest) {
    try {
        // Verify authentication (supports both cookie and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const { user, decoded } = authResult;

        // Parse request body
        const { transactionId } = await request.json();

        if (!transactionId) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ transactionId'
            }, { status: 400 });
        }

        // Call Inwcloud PromptPay API to check payment status
        // API: POST /v1/promptpay/check
        try {
            const checkResponse = await axios.post(
                `${PAYMENT_GATEWAY_URL}/v1/promptpay/check`,
                {
                    transactionId: transactionId
                },
                {
                        headers: {
                            'Authorization': `Bearer ${PAYMENT_GATEWAY_API_KEY.trim()}`,
                            'Content-Type': 'application/json'
                        },
                    timeout: 10000
                }
            );

            const responseData = checkResponse.data;

            // Inwcloud Response: { status: 'success'|'pending'|'error', message, transactionId, amount, ... }
            if (responseData?.status === 'success') {
                // Payment successful - update user balance
                const amount = parseFloat(responseData.amount || '0');
                
                // Find order by transactionId
                const order = await prisma.order.findFirst({
                    where: {
                        transactionId: transactionId,
                        userId: decoded.id
                    },
                    include: {
                        user: true
                    }
                });

                if (order && order.userId === decoded.id) {
                    // Parse order data
                    let orderData: any = {};
                    try {
                        if (order.data) {
                            orderData = JSON.parse(order.data);
                        }
                    } catch (e) {
                        // If data is not JSON, treat as empty object
                        orderData = {};
                    }

                    // Update balance if not already completed
                    if (orderData.status !== 'completed' && order.state !== 'completed') {
                        await prisma.$transaction(async (tx) => {
                            // Lock user row
                            const user = await tx.$queryRaw<Array<{ id: string; balance: any }>>`
                                SELECT id, balance 
                                FROM users 
                                WHERE id = ${order.userId} 
                                FOR UPDATE
                            `;

                            if (!user || user.length === 0) {
                                throw new Error('User not found');
                            }

                            const currentBalance = new (await import('@prisma/client')).Prisma.Decimal(user[0].balance);
                            const newBalance = currentBalance.plus(amount);

                            // Update user balance
                            await tx.user.update({
                                where: { id: order.userId },
                                data: { balance: newBalance }
                            });

                            // Create transaction record
                            await tx.transaction.create({
                                data: {
                                    userId: order.userId,
                                    orderId: order.id,
                                    type: 'topup',
                                    amount: amount,
                                    balanceBefore: currentBalance,
                                    balanceAfter: newBalance,
                                    description: `Top-up via PromptPay: ${transactionId}`,
                                    note: JSON.stringify({
                                        transactionId,
                                        status: 'completed',
                                        completedAt: new Date().toISOString(),
                                        checkResponse: responseData
                                    })
                                }
                            });

                            // Update order
                            await tx.order.update({
                                where: { id: order.id },
                                data: {
                                    state: 'completed',
                                    data: JSON.stringify({
                                        ...orderData,
                                        status: 'completed',
                                        completedAt: new Date().toISOString(),
                                        checkResponse: responseData
                                    })
                                }
                            });
                        });
                    }
                }

                return NextResponse.json({
                    success: true,
                    status: 'success',
                    message: responseData.message || 'ชำระเงินสำเร็จ',
                    data: {
                        transactionId: responseData.transactionId,
                        amount: responseData.amount,
                        customer_type: responseData.customer_type,
                        cost: responseData.cost
                    }
                });
            } else if (responseData?.status === 'pending') {
                // Payment still pending
                return NextResponse.json({
                    success: true,
                    status: 'pending',
                    message: responseData.message || 'กำลังรอการชำระเงิน',
                    data: {
                        transactionId: responseData.transactionId,
                        amount: responseData.amount,
                        expires_at: responseData.expires_at,
                        time_remaining: responseData.time_remaining
                    }
                });
            } else {
                // Error response
                return NextResponse.json({
                    success: false,
                    status: 'error',
                    message: responseData.message || 'เกิดข้อผิดพลาด',
                    code: responseData.code
                }, { status: 400 });
            }
        } catch (apiError: any) {
            console.error('Inwcloud check API error:', apiError);
            
            return NextResponse.json({
                success: false,
                message: apiError.response?.data?.message || 'ไม่สามารถตรวจสอบสถานะการชำระเงินได้',
                code: apiError.response?.data?.code
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Topup check error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleTopupCheck);

