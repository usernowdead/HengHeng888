import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { checkAndDeductBalance, validatePositiveNumber } from '@/lib/security/transaction-safety';
import { getWebsiteSettings } from '@/lib/website-settings';
import { withCSRFSecurity } from '@/lib/security/middleware';
const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";

// Helper function to create Basic Auth header for Peamsub
function createAuthHeader(apiKey: string): string {
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

// Find service from Gafiwshop
async function findGafiwService(id: string | number) {
    try {
        const response = await axios.get(`${API_URL_GAFIW}/api_product`, {
            timeout: 10000
        });

        if (response.data && response.data.ok && Array.isArray(response.data.data)) {
            const service = response.data.data.find((s: any) => {
                return s.type_id === id || s.type_id === id.toString() || s.name === id;
            });
            
            if (service) {
                const priceVip = parseFloat(service.pricevip) || 0;
                const price = parseFloat(service.price) || 0;
                const finalPrice = priceVip > 0 ? priceVip : (price > 0 ? price : 0);
                
                return {
                    name: service.name || '',
                    price: finalPrice,
                    provider: 'gafiw',
                    service: service
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error finding Gafiw service:', error);
        return null;
    }
}

// Find service from Peamsub24hr
async function findPeamsubService(id: string | number) {
    try {
        if (!API_KEY_PEAMSUB || API_KEY_PEAMSUB === 'apikey_peamsub_default_change_in_production') {
            return null;
        }

        const response = await axios.get(`${API_URL_PEAMSUB}/app-premium`, {
            headers: {
                'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                'Content-Type': 'application/json'
            },
            timeout: 10000,
        });

        if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
            const product = response.data.data.find((p: any) => p.id === id || p.id === parseInt(id.toString()));
            
            if (product) {
                const priceVip = parseFloat(product.pricevip) || 0;
                const price = parseFloat(product.price) || 0;
                const finalPrice = priceVip > 0 ? priceVip : (price > 0 ? price : 0);
                
                return {
                    name: product.name || '',
                    price: finalPrice,
                    provider: 'peamsub',
                    service: product
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error finding Peamsub service:', error);
        return null;
    }
}

async function handlePremiumBuy(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;
        const decoded = authResult.decoded;

        // Parse request body
        const { id, reference, provider } = await request.json();

        // Validate request body
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุรหัสสินค้า'
            }, { status: 400 });
        }

        // Get provider settings
        const settings = await getWebsiteSettings();
        const gafiwEnabled = settings['premium_provider_gafiw_enabled'] !== false && settings['premium_provider_gafiw_enabled'] !== 'false';
        const peamsubEnabled = settings['premium_provider_peamsub_enabled'] !== false && settings['premium_provider_peamsub_enabled'] !== 'false';

        // Find service from enabled providers
        let serviceInfo: { name: string; price: number; provider: string; service: any } | null = null;
        let servicePrice = 0;
        let serviceName = '';
        let serviceProvider = 'gafiw';

        // If provider is specified, try that first
        if (provider === 'gafiw' && gafiwEnabled) {
            serviceInfo = await findGafiwService(id);
        } else if (provider === 'peamsub' && peamsubEnabled) {
            serviceInfo = await findPeamsubService(id);
        } else {
            // Try both providers
            if (gafiwEnabled) {
                serviceInfo = await findGafiwService(id);
                if (serviceInfo) {
                    serviceProvider = 'gafiw';
                }
            }
            
            if (!serviceInfo && peamsubEnabled) {
                serviceInfo = await findPeamsubService(id);
                if (serviceInfo) {
                    serviceProvider = 'peamsub';
                }
            }
        }

        if (!serviceInfo) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบสินค้าที่ระบุ'
            }, { status: 404 });
        }

        servicePrice = serviceInfo.price;
        serviceName = serviceInfo.name;
        serviceProvider = serviceInfo.provider;

        if (servicePrice <= 0) {
            return NextResponse.json({
                success: false,
                message: 'ราคาสินค้าไม่ถูกต้อง'
            }, { status: 400 });
        }

        // Validate price
        try {
            validatePositiveNumber(servicePrice, 'Service price');
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
                const updatedUser = await checkAndDeductBalance(tx, user.id, servicePrice);
                finalBalance = updatedUser.balance.toNumber();
                balanceBefore = finalBalance + servicePrice;

                const order = await tx.order.create({
                    data: {
                        userId: user.id,
                        productId: id.toString(),
                        type: 'premium',
                        reference: reference,
                        state: 'pending',
                        price: servicePrice,
                        data: {
                            provider: serviceProvider
                        }
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId: user.id,
                        orderId: order.id,
                        type: 'purchase',
                        amount: servicePrice,
                        balanceBefore: balanceBefore,
                        balanceAfter: finalBalance,
                        description: `Purchase premium service: ${serviceName || id} (${serviceProvider})`,
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

        // STEP 2: Call external API based on provider
        try {
            let externalResponse: any;
            let externalData: any;

            if (serviceProvider === 'gafiw') {
                // Gafiwshop API
                externalResponse = await axios.post(`${API_URL_GAFIW}/api_buy`, {
                    keyapi: API_KEY_GAFIW,
                    type_id: id,
                    username_buy: user.username || undefined
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                externalData = externalResponse.data;

                if (externalData.ok && externalData.status === 'success') {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            transactionId: externalData.data?.uid?.toString() || orderId,
                            state: 'completed',
                            data: {
                                provider: 'gafiw',
                                order_id: externalData.data?.uid,
                                product_name: externalData.data?.name || serviceName,
                                details: externalData.data?.textdb,
                                point: externalData.data?.point,
                                date: externalData.data?.date
                            },
                            productMetadata: {
                                image: externalData.data?.imageapi,
                                message: externalData.message
                            }
                        }
                    });

                    return NextResponse.json({
                        success: true,
                        message: externalData.message || 'สั่งซื้อสำเร็จ',
                        data: {
                            order: {
                                id: orderId,
                                state: 'completed'
                            },
                            user: {
                                balance: finalBalance.toString(),
                                balance_used: servicePrice.toString()
                            }
                        }
                    });
                }
            } else if (serviceProvider === 'peamsub') {
                // Peamsub24hr API
                externalResponse = await axios.post(`${API_URL_PEAMSUB}/app-premium`, {
                    id: id,
                    reference: reference || `PREMIUM_${Date.now()}_${user.id}`
                }, {
                    headers: {
                        'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                externalData = externalResponse.data;

                if (externalData.statusCode === 200) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            transactionId: externalData.data?.toString() || orderId,
                            state: 'completed',
                            data: {
                                provider: 'peamsub',
                                product_name: serviceName,
                                reference: reference
                            }
                        }
                    });

                    return NextResponse.json({
                        success: true,
                        message: 'สั่งซื้อสำเร็จ',
                        data: {
                            order: {
                                id: orderId,
                                state: 'completed'
                            },
                            user: {
                                balance: finalBalance.toString(),
                                balance_used: servicePrice.toString()
                            }
                        }
                    });
                }
            }

            // External API returned invalid response - refund user
            const { refundPurchase } = await import('@/lib/security/refund');
            await refundPurchase(
                user.id,
                servicePrice,
                orderId,
                'External API returned invalid response'
            );

            return NextResponse.json({
                success: false,
                message: externalData?.message || 'การสั่งซื้อล้มเหลว เงินจะถูกคืนให้คุณภายใน 1-2 นาที'
            }, { status: 500 });
        } catch (externalError: any) {
            console.error('External API error:', externalError);

            await prisma.order.update({
                where: { id: orderId },
                data: { state: 'failed' }
            });

            try {
                const { refundPurchase } = await import('@/lib/security/refund');
                await refundPurchase(
                    user.id,
                    servicePrice,
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
        console.error('Premium buy error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสั่งซื้อ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handlePremiumBuy);
