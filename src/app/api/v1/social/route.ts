import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';

const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

export async function GET(request: NextRequest) {
    try {
        // Check if API key is set
        if (!API_KEY_ADS4U || API_KEY_ADS4U === 'apikey_ads4u_default_change_in_production') {
            console.error('API_KEY_ADS4U is not configured');
            return NextResponse.json({
                success: false,
                error: 'API Key ไม่ได้ถูกตั้งค่า กรุณาตั้งค่า API_KEY_ADS4U ในไฟล์ .env.local',
                services: [],
                count: 0
            }, { status: 500 });
        }

        console.log('Fetching social services with API Key:', API_KEY_ADS4U ? `${API_KEY_ADS4U.substring(0, 8)}...` : 'NOT SET');
        console.log('API URL:', API_URL_ADS4U);

        const response = await axios.get(`${API_URL_ADS4U}`, {
            params: {
                key: API_KEY_ADS4U,
                action: "services",
            },
            timeout: 10000,
        });

        // Check if response is an error
        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
            console.error('API Error:', response.data.error);
            return NextResponse.json({
                success: false,
                error: response.data.error || 'เกิดข้อผิดพลาดจาก API ภายนอก',
                services: [],
                count: 0
            }, { status: 400 });
        }

        if (response.data && Array.isArray(response.data)) {
            const allServices = response.data;

            // Filter out services with "test" in their name
            const filteredServices = allServices.filter((service: any) =>
                !service.name || !service.name.toLowerCase().includes('test')
            );

            // Format services
            const formattedServices = filteredServices.map((service: any) => ({
                service: service.service || service.id || 0,
                name: service.name || '',
                type: service.type || 'Default',
                category: service.category || 'General',
                rate: service.rate || '0.00',
                min: service.min || '1',
                max: service.max || '1000',
                refill: service.refill || false,
                cancel: service.cancel || true
            }));

            return NextResponse.json({
                success: true,
                services: formattedServices,
                count: formattedServices.length
            });
        }

        console.error('Unexpected response format:', response.data);
        return NextResponse.json({
            success: false,
            error: 'รูปแบบข้อมูลตอบกลับไม่ถูกต้อง',
            services: [],
            count: 0
        }, { status: 500 });
    } catch (error: any) {
        console.error('Error fetching social services:', error);
        
        // More detailed error messages
        let errorMessage = 'Internal server error';
        if (error.response) {
            // API responded with error status
            errorMessage = error.response.data?.error || `API Error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'ไม่สามารถเชื่อมต่อกับ API ภายนอกได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else {
            errorMessage = error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            services: [],
            count: 0,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}