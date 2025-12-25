import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

// GET - Get order history from Gafiwshop
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
        const usernameBuy = searchParams.get('username_buy') || undefined;
        const limit = searchParams.get('limit') || '1000'; // Default 1000, can be 'all' or number

        // Get order history from Gafiwshop API
        try {
            const params: any = {
                keyapi: API_KEY_GAFIW
            };
            
            if (usernameBuy) {
                params.username_buy = usernameBuy;
            }
            
            if (limit && limit !== 'all') {
                params.limit = limit;
            } else if (limit === 'all') {
                params.limit = 'all';
            }

            const response = await axios.get(`${API_URL_GAFIW}/api_history`, {
                params,
                timeout: 15000
            });

            if (response.data && response.data.ok) {
                return NextResponse.json({
                    success: true,
                    data: {
                        orders: response.data.data || [],
                        count: response.data.count || 0,
                        limit: response.data.limit || limit,
                        owner: response.data.owner || '',
                        ref: response.data.ref || '',
                        lastChecked: new Date().toISOString()
                    }
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่สามารถดึงข้อมูลประวัติการสั่งซื้อได้'
                }, { status: 500 });
            }
        } catch (apiError: any) {
            console.error('Gafiwshop API error:', apiError);
            return NextResponse.json({
                success: false,
                message: apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการสั่งซื้อ',
                error: apiError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Admin gafiw history GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

