import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { checkAndDeductBalance, validatePositiveNumber } from '@/lib/security/transaction-safety';
import { auditPurchaseSuccess, auditPurchaseFailure, auditException, extractRequestInfo } from '@/lib/security/audit-log';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_MIDDLE = secrets.API_KEY_MIDDLE;
const API_URL_MIDDLE = "https://www.middle-pay.com";

interface OrderData {
    id: string;
    userId: string;
    productId: string;
    type: 'premium' | 'topup_game' | 'social';
    reference?: string;
    transactionId?: string;
    state: 'pending' | 'completed' | 'failed' | 'processing' | 'confirming' | 'refunded';
    price: number;
    input?: {
        uid: string;
        [key: string]: string;
    };
    productMetadata?: {
        id: number;
        name: string;
        key: string;
        price: number;
        itemId: number;
        itemName: string;
        itemSku: string;
    };
    createdAt: string;
    updatedAt: string;
    finishedAt?: string;
    result_code?: number;
}

async function handleTopupBuy(request: NextRequest) {
    const requestInfo = extractRequestInfo(request);
    
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;
        const decoded = authResult.decoded;

        // Parse request body
        const { product_key, item_sku, input, webhookURL } = await request.json();

        // Validate request body
        if (!product_key || !item_sku || !input || !input.uid) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุข้อมูลให้ครบถ้วน (product_key, item_sku, input.uid)'
            }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            }, { status: 404 });
        }

        // Get game details to check price
        let itemPrice = 0;
        let productName = '';
        let itemName = '';

        try {
            const gamesResponse = await axios.get(`${API_URL_MIDDLE}/api/v1/products/list`, {
                headers: {
                    'X-API-Key': API_KEY_MIDDLE
                }
            });

            const game = gamesResponse.data?.find((g: any) => g.key === product_key);
            if (!game) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่พบเกมที่ระบุ'
                }, { status: 404 });
            }

            const item = game.items?.find((i: any) => i.sku === item_sku);
            if (!item) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่พบไอเท็มที่ระบุ'
                }, { status: 404 });
            }

            itemPrice = parseFloat(item.price) || 0;
            productName = game.name || '';
            itemName = item.name || '';

            if (itemPrice <= 0) {
                return NextResponse.json({
                    success: false,
                    message: 'ราคาไอเท็มไม่ถูกต้อง'
                }, { status: 400 });
            }
        } catch (error) {
            console.error('Error fetching game details:', error);
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถตรวจสอบข้อมูลเกมได้'
            }, { status: 500 });
        }

        // Validate price
        try {
            validatePositiveNumber(itemPrice, 'Item price');
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                message: error.message || 'ราคาไอเท็มไม่ถูกต้อง'
            }, { status: 400 });
        }

        // STEP 1: Deduct balance in a SHORT transaction (no external API calls)
        let orderId: string;
        let finalBalance: number = 0;
        let balanceBefore: number = 0;

        try {
            const result = await prisma.$transaction(async (tx) => {
                // Check balance and deduct atomically (prevents race conditions)
                const updatedUser = await checkAndDeductBalance(tx, user.id, itemPrice);
                finalBalance = updatedUser.balance.toNumber();
                balanceBefore = finalBalance + itemPrice;

                // Create order record with 'pending' state
                const order = await tx.order.create({
                    data: {
                        userId: user.id,
                        productId: product_key,
                        type: 'topup_game',
                        state: 'pending', // Will be updated after external API call
                        price: itemPrice,
                        productMetadata: {
                            input: input,
                            product_key: product_key,
                            item_sku: item_sku,
                            productName: productName,
                            itemName: itemName
                        },
                    }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        userId: user.id,
                        orderId: order.id,
                        type: 'purchase',
                        amount: itemPrice,
                        balanceBefore: balanceBefore,
                        balanceAfter: finalBalance,
                        description: `Purchase topup game: ${product_key} - ${item_sku}`,
                    }
                });

                return { orderId: order.id };
            });

            orderId = result.orderId;
        } catch (error: any) {
            if (error.message === 'Insufficient balance') {
                auditPurchaseFailure({
                    userId: user.id,
                    productId: product_key,
                    productType: 'topup_game',
                    price: itemPrice,
                    error: 'Insufficient balance',
                    ...requestInfo,
                    details: { item_sku },
                });
                return NextResponse.json({
                    success: false,
                    message: 'ยอดเงินคงเหลือไม่เพียงพอ'
                }, { status: 400 });
            }
            console.error('Transaction error:', error);
            auditPurchaseFailure({
                userId: decoded.id,
                productId: product_key,
                productType: 'topup_game',
                price: itemPrice,
                error: error.message || 'Transaction error',
                ...requestInfo,
                details: { item_sku, errorType: 'transaction' },
            });
            return NextResponse.json({
                success: false,
                message: 'การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง'
            }, { status: 500 });
        }

        // STEP 2: Call external API OUTSIDE transaction (no database lock)
        try {
            const externalResponse = await axios.post(`${API_URL_MIDDLE}/api/v1/agent/orders/create`, {
                product_key: product_key,
                item_sku: item_sku,
                input: input,
                webhookURL: webhookURL
            }, {
                headers: {
                    'X-API-Key': API_KEY_MIDDLE,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });

            const externalData = externalResponse.data;

            if (externalData.order) {
                // Update order with external response (outside transaction)
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        transactionId: externalData.order.transactionId,
                        state: externalData.order.state || 'completed',
                        data: JSON.stringify(externalData.order),
                        productMetadata: {
                            ...externalData.order.productMetadata,
                            input: externalData.order.input
                        },
                    }
                });

                // Audit log successful purchase
                auditPurchaseSuccess({
                    userId: user.id,
                    orderId: updatedOrder.id,
                    productId: product_key,
                    productType: 'topup_game',
                    price: itemPrice,
                    ...requestInfo,
                    details: {
                        item_sku,
                        transactionId: updatedOrder.transactionId,
                        state: updatedOrder.state,
                        balanceAfter: finalBalance,
                    },
                });

                // Return success response
                return NextResponse.json({
                    success: true,
                    message: 'สั่งซื้อสำเร็จ',
                    data: {
                        order: {
                            id: updatedOrder.id,
                            transactionId: updatedOrder.transactionId,
                            price: itemPrice,
                            state: updatedOrder.state,
                            input: externalData.order.input,
                            productMetadata: updatedOrder.productMetadata,
                            createdAt: updatedOrder.createdAt.toISOString(),
                            updatedAt: updatedOrder.updatedAt.toISOString(),
                        },
                        user: {
                            id: user.id,
                            username: user.username,
                            balance: finalBalance.toString(),
                            balance_used: itemPrice.toString()
                        }
                    }
                });
            } else {
                // External API returned invalid response - refund user
                auditPurchaseFailure({
                    userId: user.id,
                    orderId,
                    productId: product_key,
                    productType: 'topup_game',
                    price: itemPrice,
                    error: 'External API returned invalid response',
                    ...requestInfo,
                    details: { item_sku, errorType: 'invalid_response' },
                });
                
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    user.id,
                    itemPrice,
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

            // Audit log external API failure
            auditPurchaseFailure({
                userId: decoded.id,
                orderId,
                productId: product_key,
                productType: 'topup_game',
                price: itemPrice,
                error: `External API error: ${externalError.message || 'Unknown error'}`,
                ...requestInfo,
                details: { item_sku, errorType: 'external_api', statusCode: externalError.response?.status },
            });

            // Update order state to failed
            await prisma.order.update({
                where: { id: orderId },
                data: { state: 'failed' }
            });

            // Refund user (external API failed after balance deduction)
            try {
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    user.id,
                    itemPrice,
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

    } catch (error: any) {
        console.error('Topup buy error:', error);
        
        // Audit log exception
        auditException({
            event: 'topup.buy.exception',
            error: error.message || 'Unknown error',
            ...requestInfo,
            details: {
                errorType: error.name || 'Error',
                stack: error.stack,
            },
        });
        
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสั่งซื้อ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleTopupBuy);


