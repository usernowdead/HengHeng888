import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

export async function GET(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Get balance from external API
        try {
            const response = await axios.get(`${API_URL_ADS4U}`, {
                params: {
                    key: API_KEY_ADS4U,
                    action: 'balance'
                },
                timeout: 10000,
            });

            return NextResponse.json({
                success: true,
                data: {
                    balance: response.data.balance || '0',
                    currency: response.data.currency || 'USD'
                }
            });
        } catch (error: any) {
            console.error('Error fetching balance from external API:', error);
            return NextResponse.json({
                success: false,
                message: error.response?.data?.error || 'ไม่สามารถดึงข้อมูล balance ได้'
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error getting balance:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล balance'
        }, { status: 500 });
    }
}

