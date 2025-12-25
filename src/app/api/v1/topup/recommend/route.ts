import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

import { secrets } from '@/lib/secrets';

const API_KEY_MIDDLE = secrets.API_KEY_MIDDLE;
const API_URL_MIDDLE = "https://www.middle-pay.com";

export async function GET(request: NextRequest) {
    try {
        // Skip if using default API key (development only)
        if (API_KEY_MIDDLE === 'apikey' && process.env.NODE_ENV === 'production') {
            return NextResponse.json([], { status: 500 });
        }

        const response = await axios.get(`${API_URL_MIDDLE}/api/v1/products/list`, {
            headers: {
                'X-API-Key': API_KEY_MIDDLE
            },
            timeout: 10000,
        });

        if (response.data && Array.isArray(response.data)) {
            // Filter out games with "test" in the name (case insensitive)
            const allGames = response.data.filter((game: any) =>
                !game.name || !game.name.toLowerCase().includes('test')
            );

            // Shuffle the games array (Fisher-Yates algorithm)
            for (let i = allGames.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allGames[i], allGames[j]] = [allGames[j], allGames[i]];
            }

            // Take first 10 games
            const recommendedGames = allGames.slice(0, 10);

            // Format the response to match the expected structure
            const formattedResponse = recommendedGames.map((game: any) => ({
                name: game.name || '',
                key: game.key || '',
                items: game.items?.map((item: any) => ({
                    name: item.name || '',
                    sku: item.sku || '',
                    price: item.price || '0'
                })) || [],
                inputs: game.inputs?.map((input: any) => ({
                    key: input.key || '',
                    title: input.title || '',
                    type: input.type || '',
                    placeholder: input.placeholder || '',
                    options: input.options || []
                })) || []
            }));

            return NextResponse.json(formattedResponse);
        } else {
            return NextResponse.json([]);
        }
    } catch (error: any) {
        // Don't log full error in production
        if (process.env.NODE_ENV === 'development') {
            console.error('Topup recommend error:', error?.response?.status, error?.message);
        }
        
        // Handle 401 specifically
        if (error?.response?.status === 401) {
            return NextResponse.json([], { status: 401 });
        }
        
        return NextResponse.json([], { status: 500 });
    }
}


