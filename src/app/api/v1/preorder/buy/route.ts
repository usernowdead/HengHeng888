import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { checkAndDeductBalance, validatePositiveNumber } from '@/lib/security/transaction-safety';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";

// Helper function to create Basic Auth header
function createAuthHeader(apiKey: string): string {
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

// Get callback URL for preorder
function getCallbackUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
    return `${baseUrl}/api/v1/preorder/callback`;
}

async function handlePreorderBuy(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;
        const decoded = authResult.decoded;

        // Parse request body
        const { id, reference } = await request.json();

        // Validate request body
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุรหัสสินค้า'
            }, { status: 400 });
        }

        // Get product details to check price
        let productPrice = 0;
        let productName = '';
        try {
            const productsResponse = await axios.get(`${API_URL_PEAMSUB}/preorder`, {
                headers: {
                    'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (!productsResponse.data || productsResponse.data.statusCode !== 200 || !Array.isArray(productsResponse.data.data)) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่สามารถดึงข้อมูลสินค้าได้'
                }, { status: 500 });
            }

            const product = productsResponse.data.data.find((p: any) => p.id === id || p.id === parseInt(id));
            
            if (!product) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่พบสินค้าที่ระบุ'
                }, { status: 404 });
            }

            // Use pricevip if available and > 0, otherwise use price
            const priceVip = parseFloat(product.pricevip) || 0;
            const price = parseFloat(product.price) || 0;
            productPrice = priceVip > 0 ? priceVip : (price > 0 ? price : 0);
            productName = product.name || '';

            if (productPrice <= 0) {
                return NextResponse.json({
                    success: false,
                    message: 'ราคาสินค้าไม่ถูกต้อง'
                }, { status: 400 });
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถตรวจสอบข้อมูลสินค้าได้'
            }, { status: 500 });
        }

        // Validate price
        try {
            validatePositiveNumber(productPrice, 'Product price');
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                message: error.message || 'ราคาสินค้าไม่ถูกต้อง'
            }, { status: 400 });
        }

        // STEP 1: Deduct balance in a SHORT transaction
        let orderId: string;
        let finalBalance: number;
        let balanceBefore: number;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const updatedUser = await checkAndDeductBalance(tx, user.id, productPrice);
                finalBalance = updatedUser.balance.toNumber();
                balanceBefore = finalBalance + productPrice;

                // Create order record with 'pending' state
                const order = await tx.order.create({
                    data: {
                        userId: user.id,
                        productId: id.toString(),
                        type: 'preorder',
                        reference: reference || `PREORDER_${Date.now()}`,
                        state: 'pending',
                        price: productPrice,
                    }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        userId: user.id,
                        orderId: order.id,
                        type: 'purchase',
                        amount: productPrice,
                        balanceBefore: balanceBefore,
                        balanceAfter: finalBalance,
                        description: `Purchase preorder product: ${productName || id}`,
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

        // STEP 2: Call external API OUTSIDE transaction
        try {
            const callbackUrl = getCallbackUrl();
            const externalResponse = await axios.post(`${API_URL_PEAMSUB}/preorder`, {
                id: id,
                reference: reference || `PREORDER_${Date.now()}`,
                callbackUrl: callbackUrl
            }, {
                headers: {
                    'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            const externalData = externalResponse.data;

            if (externalData.statusCode === 200) {
                // Update order state to processing (will be updated via callback)
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        state: 'processing',
                        data: {
                            external_reference: reference,
                            callback_url: callbackUrl
                        }
                    }
                });

                return NextResponse.json({
                    success: true,
                    message: 'สั่งซื้อสำเร็จ กำลังดำเนินการ',
                    data: {
                        order: {
                            id: orderId,
                            state: 'processing'
                        },
                        user: {
                            balance: finalBalance.toString(),
                            balance_used: productPrice.toString()
                        }
                    }
                });
            } else {
                // External API returned error - refund user
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    user.id,
                    productPrice,
                    orderId,
                    `External API error: ${externalData.message || 'Unknown error'}`
                );

                return NextResponse.json({
                    success: false,
                    message: externalData.message || 'การสั่งซื้อล้มเหลว เงินจะถูกคืนให้คุณภายใน 1-2 นาที'
                }, { status: 500 });
            }
        } catch (externalError: any) {
            console.error('External API error:', externalError);

            // Update order state to failed
            await prisma.order.update({
                where: { id: orderId },
                data: { state: 'failed' }
            });

            // Refund user
            try {
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    user.id,
                    productPrice,
                    orderId,
                    `External API error: ${externalError.message || 'Unknown error'}`
                );
            } catch (refundError) {
                console.error('Refund error:', refundError);
            }

            return NextResponse.json({
                success: false,
                message: 'การสั่งซื้อล้มเหลว เงินจะถูกคืนให้คุณภายใน 1-2 นาที'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Preorder buy error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสั่งซื้อ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handlePreorderBuy);

