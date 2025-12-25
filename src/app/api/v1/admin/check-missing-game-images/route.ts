import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { secrets } from '@/lib/secrets';

const API_KEY_MIDDLE = secrets.API_KEY_MIDDLE;
const API_URL_MIDDLE = "https://www.middle-pay.com";

// Game image map from TopupGameCard.tsx
const gameImageMap: Record<string, boolean> = {
    // Valorant
    'valorant': true,
    
    // Arena Breakout
    'arena breakout': true,
    'arena breakout infinite': true,
    
    // Call of Duty
    'call of duty': true,
    'call of duty mobile': true,
    'cod': true,
    'codm': true,
    
    // Delta Force
    'delta force': true,
    'delta force garena': true,
    'delta force steam': true,
    
    // Dragon Nest
    'dragon nest': true,
    'dragon nest m': true,
    
    // Dragon Raja
    'dragon raja': true,
    
    // Free Fire
    'free fire': true,
    'freefire': true,
    'ff': true,
    
    // Haikyu
    'haikyu': true,
    'haikyu fly high': true,
    
    // League of Legends
    'league of legends': true,
    'lol': true,
    'wild rift': true,
    'lol wild rift': true,
    
    // Lord Nine
    'lord nine': true,
    
    // Magic Chess
    'magic chess': true,
    'magic chess go go': true,
    
    // Mobile Legends
    'mobile legends': true,
    'mobile legends bang bang': true,
    'ml': true,
    'mlbb': true,
    
    // PUBG Mobile
    'pubg': true,
    'pubg mobile': true,
    'pubg mobile global': true,
    'battlegrounds': true,
    
    // Racing Master
    'racing master': true,
    
    // Ragnarok
    'ragnarok': true,
    'ragnarok m': true,
    'ro': true,
    
    // Roblox
    'roblox': true,
    
    // ROV (Arena of Valor)
    'rov': true,
    'arena of valor': true,
    'aov': true,
    
    // Sword of Justice
    'sword of justice': true,
    
    // Teamfight Tactics
    'teamfight tactics': true,
    'tft': true,
    'tft mobile': true,
    
    // Where Winds Meet
    'where winds meet': true,
    
    // Cabal
    'cabal': true,
    'cabal infinite combo': true,
    
    // Eggy Party
    'eggy party': true,
    
    // FC Mobile
    'fc mobile': true,
    
    // Dunk City Dynasty
    'dunk city dynasty': true,
    
    // Draconia Saga
    'draconia saga': true,
    
    // Blood Strike
    'blood strike': true,
    
    // AFK Journey
    'afk journey': true,
    
    // Genshin Impact
    'genshin impact': true,
};

function checkGameHasImage(gameName: string, gameKey?: string): boolean {
    const name = gameName.toLowerCase();
    
    // Check exact match
    if (gameImageMap[name]) {
        return true;
    }
    
    // Check partial match
    for (const key of Object.keys(gameImageMap)) {
        if (name.includes(key) || key.includes(name)) {
            return true;
        }
    }
    
    // Check game key
    if (gameKey) {
        const keyLower = gameKey.toLowerCase();
        if (gameImageMap[keyLower]) {
            return true;
        }
        
        // Check normalized key
        const normalizedKey = keyLower.replace(/_/g, '-').replace(/-/g, '_');
        if (gameImageMap[normalizedKey]) {
            return true;
        }
    }
    
    return false;
}

export async function GET(request: NextRequest) {
    try {
        const response = await axios.get(`${API_URL_MIDDLE}/api/v1/products/list`, {
            headers: {
                'X-API-Key': API_KEY_MIDDLE
            },
            timeout: 10000,
        });

        if (!response.data || !Array.isArray(response.data)) {
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถดึงข้อมูลเกมได้'
            }, { status: 500 });
        }

        // Filter out test games
        const games = response.data.filter((game: any) =>
            !game.name || !game.name.toLowerCase().includes('test')
        );

        const missingImages: Array<{ name: string; key: string }> = [];
        const hasImages: Array<{ name: string; key: string }> = [];
        
        games.forEach((game: any) => {
            const hasImage = checkGameHasImage(game.name || '', game.key);
            if (!hasImage) {
                missingImages.push({
                    name: game.name || '',
                    key: game.key || ''
                });
            } else {
                hasImages.push({
                    name: game.name || '',
                    key: game.key || ''
                });
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                total: games.length,
                hasImages: hasImages.length,
                missingImages: missingImages.length,
                missingGames: missingImages,
                allGames: games.map((game: any) => ({
                    name: game.name || '',
                    key: game.key || '',
                    hasImage: checkGameHasImage(game.name || '', game.key)
                }))
            }
        });

    } catch (error: any) {
        console.error('Error checking missing game images:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบ'
        }, { status: 500 });
    }
}

