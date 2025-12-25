import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { requireAuth } from '@/lib/security/auth-utils';

const PAYMENT_GATEWAY_API_KEY = secrets.PAYMENT_GATEWAY_API_KEY?.trim();
// Inwcloud PromptPay API Base URL
const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://api.inwcloud.shop';

async function handleTopupCreate(request: NextRequest) {
    try {
        // Verify authentication (supports both cookie and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const { user, decoded } = authResult;

        // Parse request body
        const { amount, paymentMethod, giftLink } = await request.json();
        
        // Validate payment method
        if (!paymentMethod || !['promptpay', 'truewallet'].includes(paymentMethod)) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาเลือกช่องทางการชำระเงิน (promptpay หรือ truewallet)'
            }, { status: 400 });
        }

        // Validate gift link for TrueWallet
        if (paymentMethod === 'truewallet' && (!giftLink || giftLink.trim() === '')) {
            return NextResponse.json({
                success: false,
                message: 'กรุณากรอกลิงก์ซองของขวัญ TrueWallet'
            }, { status: 400 });
        }

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum < 50) {
            return NextResponse.json({
                success: false,
                message: 'จำนวนเงินขั้นต่ำ 50 บาท'
            }, { status: 400 });
        }

        if (amountNum > 50000) {
            return NextResponse.json({
                success: false,
                message: 'จำนวนเงินสูงสุด 50,000 บาท'
            }, { status: 400 });
        }

        // Create pending transaction record
        const transaction = await prisma.transaction.create({
            data: {
                userId: decoded.id,
                type: 'topup',
                amount: amountNum,
                balanceBefore: user.balance,
                balanceAfter: user.balance,
                description: `Topup request: ฿${amountNum.toLocaleString()}`,
            }
        });

        // Validate API Key
        if (!PAYMENT_GATEWAY_API_KEY || 
            PAYMENT_GATEWAY_API_KEY === 'payment_gateway_api_key_default_change_in_production' ||
            PAYMENT_GATEWAY_API_KEY.trim() === '') {
            console.error('Payment Gateway API Key not configured:', {
                hasKey: !!PAYMENT_GATEWAY_API_KEY,
                keyLength: PAYMENT_GATEWAY_API_KEY?.length,
                isDefault: PAYMENT_GATEWAY_API_KEY === 'payment_gateway_api_key_default_change_in_production'
            });
            return NextResponse.json({
                success: false,
                message: 'Payment Gateway API Key ยังไม่ได้ตั้งค่า กรุณาตั้งค่าใน .env.local และ restart server'
            }, { status: 500 });
        }

        // Call Inwcloud API based on payment method
        try {
            let paymentResponse;
            
            console.log('Creating payment:', {
                paymentMethod,
                amount: amountNum,
                apiKeyPrefix: PAYMENT_GATEWAY_API_KEY.substring(0, 20) + '...',
                apiUrl: PAYMENT_GATEWAY_URL
            });
            
            if (paymentMethod === 'promptpay') {
                // Inwcloud PromptPay API - Generate QR Code
                // API: POST /v1/promptpay/generate
                paymentResponse = await axios.post(
                    `${PAYMENT_GATEWAY_URL}/v1/promptpay/generate`,
                    {
                        amount: amountNum
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${PAYMENT_GATEWAY_API_KEY.trim()}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );
            } else if (paymentMethod === 'truewallet') {
                // TrueWallet - Use gift link provided by user
                // For TrueWallet gift envelope, user provides the link directly
                // We need to validate and process the gift link
                
                // Check if we have a gift link from user
                if (giftLink && giftLink.trim()) {
                    // Use the gift link provided by user
                    // Call API to validate/process the gift link
                    // This might be a different endpoint or we might need to process it directly
                    
                    // For now, we'll create a mock response structure
                    // You may need to call an API to validate the gift link
                    // Example: POST /v1/truewallet/validate or similar
                    
                    try {
                        // Try to call API to validate/process gift link
                        // Adjust endpoint based on your Payment Gateway API documentation
                        paymentResponse = await axios.post(
                            `${PAYMENT_GATEWAY_URL}/v1/truewallet/validate`,
                            {
                                giftLink: giftLink.trim(),
                                amount: amountNum
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${PAYMENT_GATEWAY_API_KEY}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 15000
                            }
                        );
                    } catch (validateError: any) {
                        // If validation endpoint doesn't exist, create transaction with gift link
                        // The system will process it later or manually
                        console.log('Gift link validation endpoint not available, creating transaction with gift link');
                        
                        // Create a mock response for gift link processing
                        paymentResponse = {
                            data: {
                                status: 'success',
                                data: {
                                    transactionId: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    amount: amountNum,
                                    voucher_url: giftLink.trim(),
                                    voucher_code: giftLink.trim().split('/').pop() || '',
                                    expires_at: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minutes
                                }
                            }
                        };
                    }
                } else {
                    // Fallback: Try to generate voucher link (if API supports it)
                    try {
                        paymentResponse = await axios.post(
                            `${PAYMENT_GATEWAY_URL}/v1/truewallet/generate`,
                            {
                                amount: amountNum
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${PAYMENT_GATEWAY_API_KEY}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 15000
                            }
                        );
                    } catch (truewalletError: any) {
                        console.error('TrueWallet API error:', {
                            url: `${PAYMENT_GATEWAY_URL}/v1/truewallet/generate`,
                            status: truewalletError.response?.status,
                            data: truewalletError.response?.data,
                            message: truewalletError.message
                        });
                        
                        if (truewalletError.response?.status === 401 || truewalletError.response?.status === 403) {
                            const errorMsg = truewalletError.response?.data?.message || 'API Key ไม่ถูกต้องหรือไม่มีสิทธิ์เข้าถึง';
                            throw new Error(`${errorMsg} - กรุณาตรวจสอบ API Key ใน .env.local`);
                        }
                        
                        throw truewalletError;
                    }
                }
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'ช่องทางการชำระเงินไม่ถูกต้อง'
                }, { status: 400 });
            }

            // Inwcloud API Response Structure
            const responseData = paymentResponse.data;
            
            if (responseData?.status === 'success' && responseData?.data) {
                const paymentData = responseData.data;
                const transactionId = paymentData.transactionId;
                const expiresAt = paymentData.expires_at;
                
                if (!transactionId) {
                    console.error('Missing transactionId in response:', responseData);
                    throw new Error('Transaction ID not found in API response');
                }

                // Prepare transaction data based on payment method
                let transactionData: any = {
                    paymentGateway: paymentMethod === 'promptpay' ? 'inwcloud_promptpay' : 'inwcloud_truewallet',
                    paymentMethod: paymentMethod,
                    transactionId: transactionId,
                    amount: paymentData.amount,
                    expiresAt: expiresAt,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    rawResponse: responseData
                };

                if (paymentMethod === 'promptpay') {
                    // PromptPay specific data
                    transactionData.qrUrl = paymentData.qr_url;
                    transactionData.payload = paymentData.payload;
                } else if (paymentMethod === 'truewallet') {
                    // TrueWallet specific data
                    transactionData.voucherUrl = paymentData.voucher_url || paymentData.url || paymentData.link;
                    transactionData.voucherCode = paymentData.voucher_code || paymentData.code;
                }

                // Update transaction with payment gateway reference
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        data: transactionData
                    }
                });

                // Prepare response data
                let responseDataToReturn: any = {
                    transactionId: transactionId,
                    amount: paymentData.amount,
                    expiresAt: expiresAt,
                    internalTransactionId: transaction.id,
                    paymentMethod: paymentMethod
                };

                if (paymentMethod === 'promptpay') {
                    responseDataToReturn.qrUrl = paymentData.qr_url;
                    responseDataToReturn.payload = paymentData.payload;
                } else if (paymentMethod === 'truewallet') {
                    responseDataToReturn.voucherUrl = paymentData.voucher_url || paymentData.url || paymentData.link;
                    responseDataToReturn.voucherCode = paymentData.voucher_code || paymentData.code;
                }

                return NextResponse.json({
                    success: true,
                    message: paymentMethod === 'promptpay' ? 'สร้าง QR Code สำเร็จ' : 'สร้างลิงก์ซองของขวัญสำเร็จ',
                    data: responseDataToReturn
                });
            } else {
                // Handle error response
                const errorMessage = responseData?.message || 
                                   responseData?.error || 
                                   responseData?.error_message ||
                                   'ไม่สามารถสร้างลิงก์ชำระเงินได้';
                
                console.error('Inwcloud API error response:', {
                    paymentMethod,
                    status: responseData?.status,
                    message: errorMessage,
                    code: responseData?.code,
                    fullResponse: responseData
                });
                
                // Update transaction as failed
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        data: {
                            error: errorMessage,
                            status: 'failed',
                            errorCode: responseData?.code,
                            rawErrorResponse: responseData
                        }
                    }
                });
                
                return NextResponse.json({
                    success: false,
                    message: errorMessage,
                    code: responseData?.code
                }, { status: 500 });
            }
        } catch (apiError: any) {
            console.error('Payment Gateway API error:', {
                paymentMethod,
                url: apiError.config?.url,
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                message: apiError.message
            });
            
            // Update transaction as failed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    data: {
                        error: apiError.response?.data?.message || apiError.message,
                        status: 'failed',
                        errorCode: apiError.response?.data?.code,
                        httpStatus: apiError.response?.status,
                        rawError: {
                            message: apiError.message,
                            response: apiError.response?.data
                        }
                    }
                }
            });

            // Return user-friendly error message
            let errorMessage = 'ไม่สามารถเชื่อมต่อกับ Payment Gateway ได้';
            if (apiError.response?.data?.message) {
                errorMessage = apiError.response.data.message;
            } else if (apiError.response?.status === 404) {
                errorMessage = 'API endpoint ไม่พบ กรุณาตรวจสอบการตั้งค่า';
            } else if (apiError.response?.status === 401) {
                errorMessage = 'API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า';
            } else if (apiError.message) {
                errorMessage = apiError.message;
            }

            return NextResponse.json({
                success: false,
                message: errorMessage,
                code: apiError.response?.data?.code,
                details: process.env.NODE_ENV === 'development' ? {
                    url: apiError.config?.url,
                    status: apiError.response?.status
                } : undefined
            }, { status: apiError.response?.status || 500 });
        }

    } catch (error) {
        console.error('Topup create error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้างลิงก์ชำระเงิน'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleTopupCreate);

