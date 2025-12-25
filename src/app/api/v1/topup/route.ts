import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';

const API_KEY_MIDDLE = secrets.API_KEY_MIDDLE;
const API_URL_MIDDLE = "https://www.middle-pay.com";

export async function GET(request: NextRequest) {
    try {
        const response = await axios.get(`${API_URL_MIDDLE}/api/v1/products/list`, {
            headers: {
                'X-API-Key': API_KEY_MIDDLE
            }
        });

        // Check if the external API response is successful
        if (response.data && Array.isArray(response.data)) {
            // Filter out games with "test" in the name (case insensitive)
            const games = response.data.filter((game: any) =>
                !game.name || !game.name.toLowerCase().includes('test')
            );

            // Format the response to match the expected structure
            const formattedResponse = games.map((game: any) => ({
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
            // If external API doesn't return expected format
            return NextResponse.json([]);
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}



