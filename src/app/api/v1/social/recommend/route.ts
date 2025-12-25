import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

import { secrets } from '@/lib/secrets';

const API_KEY_ADS4U = secrets.API_KEY_ADS4U;
const API_URL_ADS4U = "https://ads4u.co/api/v2";

export async function GET(request: NextRequest) {
    try {
        // Check if API key is set
        if (!API_KEY_ADS4U || API_KEY_ADS4U === 'apikey_ads4u_default_change_in_production') {
            console.error('❌ [Social Recommend] API_KEY_ADS4U is not configured');
            return NextResponse.json([], { status: 500 });
        }

        console.log('📡 [Social Recommend] Fetching services with API Key:', API_KEY_ADS4U ? `${API_KEY_ADS4U.substring(0, 8)}...` : 'NOT SET');

        const response = await axios.get(`${API_URL_ADS4U}`, {
            params: {
                key: API_KEY_ADS4U,
                action: "services",
            },
            timeout: 10000,
        });

        if (response.data && Array.isArray(response.data)) {
            const allServices = response.data;

            // Filter out services with "test" in their name
            const filteredServices = allServices.filter((service: any) =>
                !service.name || !service.name.toLowerCase().includes('test')
            );

            // Shuffle array using Fisher-Yates algorithm
            for (let i = filteredServices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filteredServices[i], filteredServices[j]] = [filteredServices[j], filteredServices[i]];
            }

            // Take only first 10 services and format them
            const recommendedServices = filteredServices.slice(0, 10).map((service: any) => ({
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

            return NextResponse.json(recommendedServices);
        }

        // If response.data is not an array, return empty array
        console.warn('API response is not an array:', response.data);
        return NextResponse.json([]);
    } catch (error: any) {
        console.error('❌ [Social Recommend] Error:', error?.response?.status, error?.message);
        
        // Handle 401 specifically (Unauthorized from ADS4U API)
        if (error?.response?.status === 401) {
            console.error('❌ [Social Recommend] 401 Unauthorized - API Key อาจไม่ถูกต้องหรือหมดอายุ');
            // Return empty array to prevent frontend error, but log the issue
            return NextResponse.json([], { status: 401 });
        }
        
        // Handle other errors
        if (error?.response) {
            console.error('❌ [Social Recommend] API Error:', error.response.status, error.response.data);
        } else if (error?.request) {
            console.error('❌ [Social Recommend] No response from API');
        } else {
            console.error('❌ [Social Recommend] Error:', error.message);
        }
        
        // Return empty array instead of 500 error to prevent frontend errors
        return NextResponse.json([]);
    }
}