import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuth } from '@/lib/security/auth-utils';
import { secrets } from '@/lib/secrets';
const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";

// Helper function to create Basic Auth header
function createAuthHeader(apiKey: string): string {
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Parse request body
        const { references } = await request.json();

        // references is optional - if empty array, get all history
        const requestBody = {
            references: Array.isArray(references) ? references : []
        };

        console.log('📜 [Preorder History] Fetching history for user:', user.id, 'references:', references);

        const response = await axios.post(`${API_URL_PEAMSUB}/preorder/history`, requestBody, {
            headers: {
                'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                'Content-Type': 'application/json'
            },
            timeout: 10000,
        });

        if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
            const history = response.data.data;

            console.log('✅ [Preorder History] Found', history.length, 'orders');

            return NextResponse.json({
                success: true,
                orders: history,
                count: history.length
            });
        }

        return NextResponse.json({
            success: false,
            error: 'รูปแบบข้อมูลตอบกลับไม่ถูกต้อง',
            orders: [],
            count: 0
        }, { status: 500 });
    } catch (error: any) {
        console.error('❌ [Preorder History] Error:', error);
        
        let errorMessage = 'Internal server error';
        if (error.response) {
            errorMessage = error.response.data?.error || `API Error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'ไม่สามารถเชื่อมต่อกับ API ภายนอกได้';
        } else {
            errorMessage = error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            orders: [],
            count: 0
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handlePreorderHistory);

