"use client";

import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Film } from 'lucide-react';
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext';

interface Movie {
    id: string;
    title: string;
    imageUrl: string;
    platform?: string | null;
}

const defaultMovies: Movie[] = [
    {
        id: '1',
        title: 'FURIOSA: A MAD MAX SAGA',
        imageUrl: 'https://img.shibuya24.com/movies/mad_max.webp'
    },
    {
        id: '2',
        title: 'KINGDOM OF THE PLANET OF THE APES',
        imageUrl: 'https://img.shibuya24.com/movies/kingdom_of_the_planet_of_the_apes.webp'
    },
    {
        id: '3',
        title: 'PATTAYA HEAT',
        imageUrl: 'https://img.shibuya24.com/movies/pattaya_heat.webp'
    },
    {
        id: '4',
        title: 'THE BEEKEEPER',
        imageUrl: 'https://img.shibuya24.com/movies/the_beekeeper.webp'
    },
    {
        id: '5',
        title: 'DEMON SLAYER',
        imageUrl: 'https://img.shibuya24.com/movies/demon_slayer.webp'
    }
];

export default function MovieRecommendations() {
    // Log immediately when component is called
    console.log('🎬🎬🎬 [MovieRecommendations] ====== COMPONENT START ======');
    console.log('🎬 [MovieRecommendations] Component function called');
    
    let settings: any = null;
    try {
        console.log('🎬 [MovieRecommendations] Attempting to load WebsiteSettings...');
        const context = useWebsiteSettings();
        settings = context?.settings;
        console.log('🎬 [MovieRecommendations] WebsiteSettings loaded:', !!settings);
    } catch (error: any) {
        console.error('❌ [MovieRecommendations] Error loading WebsiteSettings:', error?.message || error);
        // Continue without settings - use defaults
        settings = null;
    }
    
    const [movies, setMovies] = useState<Movie[]>([]); // Start empty - will fetch fresh data
    const [loading, setLoading] = useState(true); // Start as true - show loading until data is fetched
    const [mounted, setMounted] = useState(false); // Track if component is mounted on client

    console.log('🎬 [MovieRecommendations] State initialized, movies:', movies.length, 'loading:', loading, 'mounted:', mounted);

    // Only run on client-side to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        console.log('🎬 [MovieRecommendations] Component mounted on client - fetching fresh data');
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true); // Set loading before fetch
            console.log('🎬 [MovieRecommendations] Fetching movies...');
            // Add cache busting to ensure fresh data (always, not just in dev)
            const cacheBuster = `&_t=${Date.now()}`;
            const response = await fetch(`/api/v1/movies?type=movie${cacheBuster}`, {
                cache: 'no-store', // Force fresh data
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            const data = await response.json();
            
            console.log('🎬 [MovieRecommendations] API Response:', {
                success: data.success,
                count: data.movies?.length || 0,
                movies: data.movies
            });
            
            // ถ้ามีข้อมูลใน database ให้ใช้ข้อมูลนั้น แต่ถ้าไม่มี (array ว่าง) ให้ใช้ default movies
            if (data.success && data.movies && Array.isArray(data.movies) && data.movies.length > 0) {
                console.log('✅ [MovieRecommendations] Using database movies:', data.movies.length);
                setMovies(data.movies);
            } else {
                // ถ้ายังไม่มีข้อมูลใน database หรือ API fail ให้ใช้ default movies
                console.log('⚠️ [MovieRecommendations] No database movies, using defaults');
                setMovies(defaultMovies);
            }
        } catch (error) {
            console.error('❌ [MovieRecommendations] Error fetching movies:', error);
            // Fallback to default movies on error
            setMovies(defaultMovies);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state until data is fetched AND component is mounted
    console.log('🎬 [MovieRecommendations] Rendering with movies:', movies.length, 'loading:', loading, 'mounted:', mounted);
    
    // Don't render anything until mounted on client (prevents SSR/hydration flash)
    if (!mounted) {
        return (
            <section className='border-b' data-testid="movie-recommendations-section">
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h3 className='text-base font-medium flex items-center gap-2'>
                                    <Film className="h-4 w-4" />
                                    {settings?.movieSectionTitle || 'แนะนำหนังน่าดู'}
                                </h3>
                                <p className='text-xs text-muted-foreground mt-0.5'>
                                    {settings?.movieSectionSubtitle || 'หนังใหม่ที่น่าสนใจ'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='px-3 py-3'>
                        <div className='flex items-center justify-center py-8'>
                            <div className='text-sm text-gray-500'>กำลังโหลด...</div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    
    // Only show movies after loading is complete (no default movies flash)
    const displayMovies = movies;
    console.log('🎬 [MovieRecommendations] Display movies:', displayMovies.length);
    
    return (
        <section className='border-b' data-testid="movie-recommendations-section">
            <div className='w-full'>
                <div className='px-3 pt-3 pb-2 border-b'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='text-base font-medium flex items-center gap-2'>
                                <Film className="h-4 w-4" />
                                {settings?.movieSectionTitle || 'แนะนำหนังน่าดู'}
                            </h3>
                            <p className='text-xs text-muted-foreground mt-0.5'>
                                {settings?.movieSectionSubtitle || 'หนังใหม่ที่น่าสนใจ'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='px-3 py-3'>
                    {loading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='text-sm text-gray-500'>กำลังโหลด...</div>
                        </div>
                    ) : displayMovies.length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='text-sm text-gray-500'>ยังไม่มีหนัง</div>
                        </div>
                    ) : (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: false,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2 md:-ml-4">
                                {displayMovies.map((movie) => {
                                    console.log('🎬 [MovieRecommendations] Rendering movie:', movie.title);
                                    return (
                                        <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-[45%] sm:basis-[35%] md:basis-[30%]">
                                            <div className="group relative overflow-hidden rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="aspect-[2/3] relative overflow-hidden">
                                                    <img
                                                        src={movie.imageUrl}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                                                        draggable={false}
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            return false;
                                                        }}
                                                        onDragStart={(e) => {
                                                            e.preventDefault();
                                                            return false;
                                                        }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/image-product-app-p.png';
                                                        }}
                                                    />
                                                </div>
                                                <div className="p-2">
                                                    <h4 className="text-xs font-medium line-clamp-2 leading-tight">
                                                        {movie.title}
                                                    </h4>
                                                    {movie.platform && (
                                                        <p className="text-[10px] text-gray-500 mt-1">
                                                            {movie.platform}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                            <CarouselPrevious className="hidden sm:flex -left-3 h-8 w-8" />
                            <CarouselNext className="hidden sm:flex -right-3 h-8 w-8" />
                        </Carousel>
                    )}
                </div>
            </div>
        </section>
    );
}



