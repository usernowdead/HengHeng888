import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { orderService, transactionService } from '@/lib/db-service';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { checkAndDeductBalance, validatePositiveNumber } from '@/lib/security/transaction-safety';
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

interface OrderData {
    id: string;
    userId: string;
    productId: string;
    type: 'premium' | 'topup_game' | 'social';
    reference?: string;
    transactionId?: string;
    state: 'pending' | 'completed' | 'failed' | 'processing';
    price: number;
    data?: string;
    productMetadata?: {
        link?: string;
        quantity?: number;
        runs?: number;
        interval?: number;
        key: string;
        price: number;
    };
    createdAt: string;
    updatedAt: string;
}

async function handleSocialBuy(request: NextRequest) {
    try {
        // Verify authentication (supports both cookie and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const { user, decoded } = authResult;

        // Parse request body
        const { service, link, quantity, runs, interval } = await request.json();

        // Validate request body
        if (!service || !link || !quantity) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ service, link และ quantity'
            }, { status: 400 });
        }

        // Quantity validation will be done by validatePositiveNumber

        // Validate quantity
        let validatedQuantity: number;
        try {
            validatedQuantity = validatePositiveNumber(quantity, 'Quantity');
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                message: error.message || 'จำนวนต้องมากกว่า 0'
            }, { status: 400 });
        }

        // Get service details to check price
        let servicePrice = 0;
        try {
            const servicesResponse = await axios.get(`${API_URL_ADS4U}`, {
                params: {
                    key: API_KEY_ADS4U,
                    action: "services"
                }
            });

            const serviceData = servicesResponse.data?.find((s: any) => s.service == service);
            if (!serviceData) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่พบบริการที่ระบุ'
                }, { status: 404 });
            }

            // Calculate price based on rate and quantity
            const rate = parseFloat(serviceData.rate) || 0;
            servicePrice = (rate * validatedQuantity) / 1000; // Rate is per 1000

            if (servicePrice <= 0) {
                return NextResponse.json({
                    success: false,
                    message: 'ราคาบริการไม่ถูกต้อง'
                }, { status: 400 });
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถตรวจสอบข้อมูลบริการได้'
            }, { status: 500 });
        }

        // Validate price
        try {
            validatePositiveNumber(servicePrice, 'Service price');
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                message: error.message || 'ราคาบริการไม่ถูกต้อง'
            }, { status: 400 });
        }

        // STEP 1: Deduct balance in a SHORT transaction (no external API calls)
        let orderId: string;
        let finalBalance: number;
        let balanceBefore: number;

        try {
            const result = await prisma.$transaction(async (tx) => {
                // Check balance and deduct atomically (prevents race conditions)
                const updatedUser = await checkAndDeductBalance(tx, decoded.id, servicePrice);
                finalBalance = updatedUser.balance.toNumber();
                balanceBefore = finalBalance + servicePrice;

                // Create order record with 'pending' state
                const order = await tx.order.create({
                    data: {
                        userId: decoded.id,
                        productId: service.toString(),
                        type: 'social',
                        state: 'pending', // Will be updated after external API call
                        price: servicePrice,
                        productMetadata: {
                            link: link,
                            quantity: validatedQuantity,
                            runs: runs,
                            interval: interval,
                            key: API_KEY_ADS4U,
                            price: servicePrice
                        },
                    }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        userId: decoded.id,
                        orderId: order.id,
                        type: 'purchase',
                        amount: servicePrice,
                        balanceBefore: balanceBefore,
                        balanceAfter: finalBalance,
                        description: `Purchase social service: ${service}`,
                    }
                });

                return { orderId: order.id };
            });

            orderId = result.orderId;
        } catch (error: any) {
            if (error.message === 'Insufficient balance') {
                return NextResponse.json({
                    success: false,
                    message: 'ยอดเงินคงเหลือไม่เพียงพอ'
                }, { status: 400 });
            }
            console.error('Transaction error:', error);
            return NextResponse.json({
                success: false,
                message: 'การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง'
            }, { status: 500 });
        }

        // STEP 2: Call external API OUTSIDE transaction (no database lock)
        try {
            const ads4uParams: any = {
                key: API_KEY_ADS4U,
                action: 'add',
                service: service,
                link: link,
                quantity: validatedQuantity
            };

            // Add optional parameters
            if (runs) ads4uParams.runs = runs;
            if (interval) ads4uParams.interval = interval;

            const externalResponse = await axios.get(`${API_URL_ADS4U}`, {
                params: ads4uParams,
                timeout: 30000 // 30 second timeout
            });

            const externalData = externalResponse.data;

            if (externalData.order) {
                // Update order with external response (outside transaction)
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        transactionId: externalData.order.toString(),
                        state: 'completed',
                        data: JSON.stringify(externalData),
                    }
                });

                // Return success response
                return NextResponse.json({
                    success: true,
                    message: 'สั่งซื้อสำเร็จ',
                    data: {
                        order: {
                            id: updatedOrder.id,
                            transactionId: updatedOrder.transactionId,
                            state: updatedOrder.state,
                            data: externalData
                        },
                        user: {
                            balance: finalBalance.toString(),
                            balance_used: servicePrice.toString()
                        }
                    }
                });
            } else {
                // External API returned invalid response - refund user
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    decoded.id,
                    servicePrice,
                    orderId,
                    'External API returned invalid response'
                );

                return NextResponse.json({
                    success: false,
                    message: 'การสั่งซื้อล้มเหลว เงินจะถูกคืนให้คุณภายใน 1-2 นาที'
                }, { status: 500 });
            }
        } catch (externalError: any) {
            console.error('External API error:', externalError);

            // Update order state to failed
            await prisma.order.update({
                where: { id: orderId },
                data: { state: 'failed' }
            });

            // Refund user (external API failed after balance deduction)
            try {
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    decoded.id,
                    servicePrice,
                    orderId,
                    `External API error: ${externalError.message || 'Unknown error'}`
                );
            } catch (refundError) {
                console.error('Refund error:', refundError);
                // Log for manual intervention
            }

            return NextResponse.json({
                success: false,
                message: 'การสั่งซื้อล้มเหลว เงินจะถูกคืนให้คุณภายใน 1-2 นาที'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Social buy error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสั่งซื้อ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleSocialBuy);
