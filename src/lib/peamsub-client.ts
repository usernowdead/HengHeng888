/**
 * Peamsub24hr API Client
 * Centralized utility for Peamsub API authentication and requests
 */

import axios, { AxiosInstance } from 'axios';
import { secrets } from '@/lib/secrets';

const API_KEY_PEAMSUB = secrets.API_KEY_PEAMSUB;
const API_URL_PEAMSUB = "https://api.peamsub24hr.com/v2";

/**
 * Create Basic Auth header with Base64-encoded API key
 * Format: Authorization: Basic base64(YOUR_API_KEY_HERE)
 * 
 * @param apiKey - The Peamsub API key
 * @returns Authorization header value
 */
export function createPeamsubAuthHeader(apiKey: string = API_KEY_PEAMSUB): string {
    if (!apiKey || apiKey === 'apikey_peamsub_default_change_in_production') {
        throw new Error('API_KEY_PEAMSUB is not configured');
    }
    
    // Encode API key with Base64
    const base64Key = Buffer.from(apiKey).toString('base64');
    return `Basic ${base64Key}`;
}

/**
 * Get configured Peamsub API client with authentication headers
 */
export function getPeamsubClient(): AxiosInstance {
    const authHeader = createPeamsubAuthHeader();
    
    return axios.create({
        baseURL: API_URL_PEAMSUB,
        timeout: 10000,
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Verify user data from Peamsub API
 * Endpoint: GET /v2/user/inquiry
 * 
 * @param userId - Optional user ID to verify
 * @returns User data from Peamsub
 */
export async function verifyPeamsubUser(userId?: string) {
    try {
        if (!API_KEY_PEAMSUB || API_KEY_PEAMSUB === 'apikey_peamsub_default_change_in_production') {
            throw new Error('API_KEY_PEAMSUB is not configured');
        }

        const client = getPeamsubClient();
        const response = await client.get('/user/inquiry', {
            params: userId ? { userId } : {}
        });

        if (response.data && response.data.statusCode === 200) {
            return {
                success: true,
                data: response.data.data
            };
        }

        return {
            success: false,
            error: 'รูปแบบข้อมูลตอบกลับไม่ถูกต้อง'
        };
    } catch (error: any) {
        console.error('❌ [Peamsub Client] Error verifying user:', error);
        
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.error || `API Error: ${error.response.status}`
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'ไม่สามารถเชื่อมต่อกับ Peamsub API ได้'
            };
        }
        
        return {
            success: false,
            error: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
        };
    }
}

/**
 * Check if Peamsub API key is configured
 */
export function isPeamsubConfigured(): boolean {
    return !!API_KEY_PEAMSUB && API_KEY_PEAMSUB !== 'apikey_peamsub_default_change_in_production';
}

