import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

// GET - Get Gafiwshop account balance
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

        // Get balance from Gafiwshop API
        try {
            // Debug: Check if API key is set (but don't log the actual key)
            const hasApiKey = !!API_KEY_GAFIW;
            const apiKeyLength = API_KEY_GAFIW?.length || 0;
            const apiKeyPreview = API_KEY_GAFIW ? `${API_KEY_GAFIW.substring(0, 4)}...${API_KEY_GAFIW.substring(apiKeyLength - 4)}` : 'NOT SET';
            
            console.log('🔑 [Gafiw Balance] API Key Status:', {
                hasKey: hasApiKey,
                keyLength: apiKeyLength,
                keyPreview: apiKeyPreview,
                isDefault: API_KEY_GAFIW?.includes('default') || false
            });
            
            if (!API_KEY_GAFIW || API_KEY_GAFIW.includes('default')) {
                return NextResponse.json({
                    success: false,
                    message: 'กรุณาตั้งค่า API_KEY_GAFIW ในไฟล์ .env.local และ restart server',
                    hint: 'API key ไม่ถูกตั้งค่าหรือยังใช้ค่า default อยู่'
                }, { status: 400 });
            }
            
            // Use POST method to /api_money (as per Gafiwshop API documentation)
            // Note: Endpoint is /api_money NOT /api/api_money
            const endpoint = `${API_URL_GAFIW}/api_money`;
            console.log('📡 [Gafiw Balance] Calling API:', endpoint);
            console.log('📡 [Gafiw Balance] Request payload:', { keyapi: '***' + API_KEY_GAFIW.substring(API_KEY_GAFIW.length - 4) });
            
            const response = await axios.post(endpoint, {
                keyapi: API_KEY_GAFIW
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000,
                validateStatus: (status) => status < 500 // Don't throw on 4xx errors
            });

            console.log('📥 [Gafiw Balance] API Response Status:', response.status);
            console.log('📥 [Gafiw Balance] API Response Data:', JSON.stringify(response.data, null, 2));

            // Check if response is HTML (404 page or error page)
            const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            if (responseText.includes('<!DOCTYPE html') || responseText.includes('<html')) {
                console.error('Gafiwshop API returned HTML instead of JSON');
                return NextResponse.json({
                    success: false,
                    message: 'API endpoint ไม่ถูกต้อง - ได้ HTML กลับมาแทน JSON',
                    error: 'Invalid endpoint - received HTML response'
                }, { status: 500 });
            }

            // Parse response - Expected format: { ok: true, balance: "10.04", owner: "inmwza0088" }
            // Or error format: { msg: "กรุณาใส่keyapiให้ถูกต้อง www.gafiwshop.xyz/api" }
            if (response.data && typeof response.data === 'object') {
                // Check if response has ok field and it's true
                if (response.data.ok === true || response.data.ok === 'true') {
                    const balance = parseFloat(response.data.balance) || 0;
                    const owner = response.data.owner || '';
                    
                    return NextResponse.json({
                        success: true,
                        data: {
                            balance: balance,
                            balanceFormatted: balance.toFixed(2),
                            owner: owner,
                            lastChecked: new Date().toISOString()
                        }
                    });
                }
                // Check for error message (Gafiwshop returns error in msg field)
                else if (response.data.msg) {
                    console.error('❌ [Gafiw Balance] API Error Response:', response.data.msg);
                    return NextResponse.json({
                        success: false,
                        message: response.data.msg || 'ไม่สามารถดึงข้อมูลยอดเงินได้',
                        raw: response.data,
                        hint: 'ตรวจสอบว่า API key ถูกต้องและมีสิทธิ์เข้าถึง API endpoint นี้'
                    }, { status: 400 });
                }
                // If ok is false or not present
                else {
                    console.error('❌ [Gafiw Balance] Unexpected response format:', response.data);
                    return NextResponse.json({
                        success: false,
                        message: response.data.message || 'ไม่สามารถดึงข้อมูลยอดเงินได้ - รูปแบบ response ไม่ถูกต้อง',
                        raw: response.data
                    }, { status: 500 });
                }
            } else {
                console.error('❌ [Gafiw Balance] Response is not an object:', typeof response.data);
                return NextResponse.json({
                    success: false,
                    message: 'ไม่สามารถดึงข้อมูลยอดเงินได้ - รูปแบบ response ไม่ถูกต้อง',
                    raw: typeof response.data === 'string' ? response.data.substring(0, 500) : response.data
                }, { status: 500 });
            }
        } catch (apiError: any) {
            console.error('Gafiwshop API error:', {
                message: apiError.message,
                response: typeof apiError.response?.data === 'string' 
                    ? apiError.response.data.substring(0, 500) 
                    : apiError.response?.data,
                status: apiError.response?.status,
                config: {
                    url: apiError.config?.url,
                    method: apiError.config?.method,
                    params: apiError.config?.params
                }
            });
            
            // Check if error response is HTML
            const errorData = apiError.response?.data;
            const errorText = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            if (errorText.includes('<!DOCTYPE html') || errorText.includes('<html')) {
                return NextResponse.json({
                    success: false,
                    message: 'API endpoint ไม่ถูกต้อง - กรุณาตรวจสอบ endpoint และ API key',
                    error: 'Invalid endpoint - received HTML error page',
                    hint: 'ลองตรวจสอบว่า endpoint /api/api_money ถูกต้องหรือไม่'
                }, { status: 500 });
            }
            
            return NextResponse.json({
                success: false,
                message: apiError.response?.data?.msg || apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลยอดเงิน',
                error: apiError.message,
                status: apiError.response?.status
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Admin gafiw balance GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

