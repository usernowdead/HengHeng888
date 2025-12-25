import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';

const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";

// Helper function to create Basic Auth header
function createAuthHeader(apiKey: string): string {
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

export async function GET(request: NextRequest) {
    try {
        // Check if API key is set
        if (!API_KEY_PEAMSUB || API_KEY_PEAMSUB === 'apikey_peamsub_default_change_in_production') {
            console.error('❌ [Preorder API] API_KEY_PEAMSUB is not configured');
            return NextResponse.json({
                success: false,
                error: 'API Key ไม่ได้ถูกตั้งค่า กรุณาตั้งค่า API_KEY_PEAMSUB ในไฟล์ .env.local',
                products: [],
                count: 0
            }, { status: 500 });
        }

        console.log('📦 [Preorder API] Fetching preorder products...');

        const response = await axios.get(`${API_URL_PEAMSUB}/preorder`, {
            headers: {
                'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                'Content-Type': 'application/json'
            },
            timeout: 10000,
        });

        // Check if response is successful
        if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
            const products = response.data.data;

            // Format products
            const formattedProducts = products.map((product: any) => ({
                id: product.id,
                name: product.name || '',
                price: parseFloat(product.price) || 0,
                pricevip: parseFloat(product.pricevip) || 0,
                agent_price: parseFloat(product.agent_price) || 0,
                type_app: product.type_app || '',
                stock: parseInt(product.stock) || 0,
                img: product.img || '',
                des: product.des || '',
                recommendedPrice: parseFloat(product.recommendedPrice) || 0,
            }));

            console.log('✅ [Preorder API] Found', formattedProducts.length, 'products');

            return NextResponse.json({
                success: true,
                products: formattedProducts,
                count: formattedProducts.length
            });
        }

        console.error('❌ [Preorder API] Unexpected response format:', response.data);
        return NextResponse.json({
            success: false,
            error: 'รูปแบบข้อมูลตอบกลับไม่ถูกต้อง',
            products: [],
            count: 0
        }, { status: 500 });
    } catch (error: any) {
        console.error('❌ [Preorder API] Error fetching preorder products:', error);
        
        let errorMessage = 'Internal server error';
        if (error.response) {
            errorMessage = error.response.data?.error || `API Error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            errorMessage = 'ไม่สามารถเชื่อมต่อกับ API ภายนอกได้';
        } else {
            errorMessage = error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            products: [],
            count: 0,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

