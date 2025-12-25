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
            const services = response.data.data.filter((service: any) => {
                if (service.name && service.name.toLowerCase().includes('test')) {
                    return false;
                }
                
                const priceVip = parseFloat(service.pricevip) || 0;
                const price = parseFloat(service.price) || 0;
                const finalPrice = priceVip > 0 ? priceVip : (price > 0 ? price : 0);
                
                return finalPrice > 0;
            });

            return services.map((service: any) => {
                const priceVip = parseFloat(service.pricevip) || 0;
                const price = parseFloat(service.price) || 0;
                const finalPrice = priceVip > 0 ? priceVip : (price > 0 ? price : 0);
                
                return {
                    name: service.name || '',
                    id: service.type_id || service.name || '',
                    description: service.details || null,
                    price: finalPrice,
                    stock: parseInt(service.stock) || 0,
                    provider: 'gafiw'
                };
            });
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
            console.warn('⚠️ [Premium API] API_KEY_PEAMSUB is not configured');
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
        // Get provider settings
        const settings = await getWebsiteSettings();
        const gafiwEnabled = settings['premium_provider_gafiw_enabled'] !== false && settings['premium_provider_gafiw_enabled'] !== 'false';
        const peamsubEnabled = settings['premium_provider_peamsub_enabled'] !== false && settings['premium_provider_peamsub_enabled'] !== 'false';

        // If no provider is enabled, default to Gafiw
        const useGafiw = gafiwEnabled || (!gafiwEnabled && !peamsubEnabled);
        const usePeamsub = peamsubEnabled;

        console.log('📦 [Premium API] Provider settings:', { useGafiw, usePeamsub });

        const allServices: any[] = [];

        // Fetch from enabled providers
        if (useGafiw) {
            const gafiwServices = await fetchGafiwServices();
            allServices.push(...gafiwServices);
        }

        if (usePeamsub) {
            const peamsubServices = await fetchPeamsubServices();
            allServices.push(...peamsubServices);
        }

        // Remove duplicates by name (if both providers have same service)
        const uniqueServices = Array.from(
            new Map(allServices.map(service => [service.name, service])).values()
        );

        return NextResponse.json({
            success: true,
            services: uniqueServices,
            count: uniqueServices.length
        });
    } catch (error) {
        console.error('Error fetching premium services:', error);
        return NextResponse.json({
            success: false,
            services: [],
            count: 0
        }, { status: 500 });
    }
}
