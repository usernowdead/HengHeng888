import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getWebsiteSettings } from '@/lib/website-settings';
import { secrets } from '@/lib/secrets';

const API_URL_GAFIW = "https://gafiwshop.xyz/api";
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";
const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;

// Helper function to create Basic Auth header for Peamsub
function createAuthHeader(apiKey: string): string {
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

// Fetch services from Gafiwshop
async function fetchGafiwServices() {
    try {
        const response = await axios.get(`${API_URL_GAFIW}/api_product`, {
            timeout: 10000
        });

        if (response.data && response.data.ok && Array.isArray(response.data.data)) {
            return response.data.data.filter((service: any) =>
                !service.name || !service.name.toLowerCase().includes('test')
            ).map((service: any) => ({
                name: service.name || '',
                id: service.type_id || service.name || '',
                description: service.details || null,
                price: parseFloat(service.pricevip) || parseFloat(service.price) || 0,
                stock: parseInt(service.stock) || 0,
                provider: 'gafiw'
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching Gafiw services:', error);
        return [];
    }
}

// Fetch services from Peamsub24hr
async function fetchPeamsubServices() {
    try {
        if (!API_KEY_PEAMSUB || API_KEY_PEAMSUB === 'apikey_peamsub_default_change_in_production') {
            return [];
        }

        const response = await axios.get(`${API_URL_PEAMSUB}/app-premium`, {
            headers: {
                'Authorization': createAuthHeader(API_KEY_PEAMSUB),
                'Content-Type': 'application/json'
            },
            timeout: 10000,
        });

        if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
            return response.data.data.map((product: any) => ({
                name: product.name || '',
                id: product.id || '',
                description: product.des || null,
                price: parseFloat(product.pricevip) || parseFloat(product.price) || 0,
                stock: parseInt(product.stock) || 0,
                provider: 'peamsub'
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching Peamsub services:', error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('📦 [Premium Recommend API] Starting fetch...');
        
        // Get provider settings
        const settings = await getWebsiteSettings();
        const gafiwEnabled = settings['premium_provider_gafiw_enabled'] !== false && settings['premium_provider_gafiw_enabled'] !== 'false';
        const peamsubEnabled = settings['premium_provider_peamsub_enabled'] !== false && settings['premium_provider_peamsub_enabled'] !== 'false';

        // If no provider is enabled, default to Gafiw
        const useGafiw = gafiwEnabled || (!gafiwEnabled && !peamsubEnabled);
        const usePeamsub = peamsubEnabled;

        console.log('📦 [Premium Recommend API] Provider settings:', { useGafiw, usePeamsub });

        const allServices: any[] = [];

        // Fetch from enabled providers
        if (useGafiw) {
            console.log('📦 [Premium Recommend API] Fetching from Gafiw...');
            try {
                const gafiwServices = await fetchGafiwServices();
                console.log('✅ [Premium Recommend API] Gafiw services:', gafiwServices.length);
                allServices.push(...gafiwServices);
            } catch (error) {
                console.error('❌ [Premium Recommend API] Gafiw fetch error:', error);
                // Continue with other providers
            }
        }

        if (usePeamsub) {
            console.log('📦 [Premium Recommend API] Fetching from Peamsub...');
            try {
                const peamsubServices = await fetchPeamsubServices();
                console.log('✅ [Premium Recommend API] Peamsub services:', peamsubServices.length);
                allServices.push(...peamsubServices);
            } catch (error) {
                console.error('❌ [Premium Recommend API] Peamsub fetch error:', error);
                // Continue with other providers
            }
        }

        console.log('📦 [Premium Recommend API] Total services fetched:', allServices.length);

        // Shuffle array for random recommendations
        for (let i = allServices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allServices[i], allServices[j]] = [allServices[j], allServices[i]];
        }

        const recommendedServices = allServices.slice(0, 10);

        console.log('✅ [Premium Recommend API] Returning', recommendedServices.length, 'recommended services');

        return NextResponse.json({
            success: true,
            services: recommendedServices,
            count: recommendedServices.length
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });
    } catch (error: any) {
        console.error('❌ [Premium Recommend API] Error:', {
            message: error?.message,
            status: error?.response?.status,
            stack: error?.stack
        });
        
        // Return empty array instead of error to prevent frontend crash
        return NextResponse.json({
            success: false,
            services: [],
            count: 0,
            error: process.env.NODE_ENV === 'development' ? error?.message : undefined
        }, { 
            status: 200, // Return 200 with success:false instead of 500
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
