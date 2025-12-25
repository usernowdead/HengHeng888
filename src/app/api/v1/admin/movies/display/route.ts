import { NextRequest, NextResponse } from 'next/server';
import { getAllMovies } from '@/lib/movie-service';
import { requireAuth } from '@/lib/security/auth-utils';

// Default movies ที่ใช้ในหน้าเว็บ
const DEFAULT_MOVIES = [
    {
        id: '1',
        title: 'FURIOSA: A MAD MAX SAGA',
        imageUrl: 'https://img.shibuya24.com/movies/mad_max.webp',
        type: 'movie' as const,
        order: 0,
        isDefault: true
    },
    {
        id: '2',
        title: 'KINGDOM OF THE PLANET OF THE APES',
        imageUrl: 'https://img.shibuya24.com/movies/kingdom_of_the_planet_of_the_apes.webp',
        type: 'movie' as const,
        order: 1,
        isDefault: true
    },
    {
        id: '3',
        title: 'PATTAYA HEAT',
        imageUrl: 'https://img.shibuya24.com/movies/pattaya_heat.webp',
        type: 'movie' as const,
        order: 2,
        isDefault: true
    },
    {
        id: '4',
        title: 'THE BEEKEEPER',
        imageUrl: 'https://img.shibuya24.com/movies/the_beekeeper.webp',
        type: 'movie' as const,
        order: 3,
        isDefault: true
    },
    {
        id: '5',
        title: 'DEMON SLAYER',
        imageUrl: 'https://img.shibuya24.com/movies/demon_slayer.webp',
        type: 'movie' as const,
        order: 4,
        isDefault: true
    }
];

// Default series ที่ใช้ในหน้าเว็บ
const DEFAULT_SERIES = [
    {
        id: 's1',
        title: 'SQUID GAME',
        imageUrl: 'https://img.shibuya24.com/series/squid_game.webp',
        type: 'series' as const,
        order: 0,
        isDefault: true
    },
    {
        id: 's2',
        title: 'STRANGER THINGS',
        imageUrl: 'https://img.shibuya24.com/series/stranger_things.webp',
        type: 'series' as const,
        order: 1,
        isDefault: true
    },
    {
        id: 's3',
        title: 'THE BOYS',
        imageUrl: 'https://img.shibuya24.com/series/the_boys.webp',
        type: 'series' as const,
        order: 2,
        isDefault: true
    },
    {
        id: 's4',
        title: 'BREAKING BAD',
        imageUrl: 'https://img.shibuya24.com/series/breaking_bad.webp',
        type: 'series' as const,
        order: 3,
        isDefault: true
    },
    {
        id: 's5',
        title: 'GAME OF THRONES',
        imageUrl: 'https://img.shibuya24.com/series/game_of_thrones.webp',
        type: 'series' as const,
        order: 4,
        isDefault: true
    }
];

// GET - Get movies that are actually displayed on the website
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get type from query params (optional)
        const type = request.nextUrl.searchParams.get('type') as 'movie' | 'series' | null;
        
        // Get movies/series from database
        const dbItems = await getAllMovies(type || undefined);
        
        // Determine defaults based on type
        const defaults = type === 'series' ? DEFAULT_SERIES : DEFAULT_MOVIES;
        
        // If database has items, use them; otherwise use default items
        let displayItems;
        if (dbItems && dbItems.length > 0) {
            // Use database items, mark as not default
            displayItems = dbItems.map(item => ({
                ...item,
                isDefault: false
            }));
        } else {
            // Use default items
            displayItems = defaults;
        }

        return NextResponse.json({
            success: true,
            movies: displayItems,
            source: dbItems && dbItems.length > 0 ? 'database' : 'default'
        });
    } catch (error) {
        console.error('Error fetching display movies:', error);
        const type = request.nextUrl.searchParams.get('type') as 'movie' | 'series' | null;
        const defaults = type === 'series' ? DEFAULT_SERIES : DEFAULT_MOVIES;
        
        return NextResponse.json({
            success: false,
            movies: defaults,
            source: 'default',
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

