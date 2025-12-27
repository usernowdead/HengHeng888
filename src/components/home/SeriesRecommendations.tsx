"use client";

import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Tv } from 'lucide-react';
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext';

interface Series {
    id: string;
    title: string;
    imageUrl: string;
    platform?: string | null;
}

export default function SeriesRecommendations() {
    const { settings } = useWebsiteSettings();
    const [series, setSeries] = useState<Series[]>([]); // Start empty - will fetch fresh data
    const [loading, setLoading] = useState(true); // Start as true - show loading until data is fetched
    const [mounted, setMounted] = useState(false); // Track if component is mounted on client

    // Only run on client-side to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        console.log('📺 [SeriesRecommendations] Component mounted on client - fetching fresh data');
        fetchSeries();
    }, []);

    const defaultSeries: Series[] = [
        {
            id: 's1',
            title: 'SQUID GAME',
            imageUrl: '/series/0.webp'
        },
        {
            id: 's2',
            title: 'STRANGER THINGS',
            imageUrl: '/series/1.webp'
        },
        {
            id: 's3',
            title: 'THE BOYS',
            imageUrl: '/series/2.webp'
        },
        {
            id: 's4',
            title: 'BREAKING BAD',
            imageUrl: '/series/4.webp'
        },
        {
            id: 's5',
            title: 'GAME OF THRONES',
            imageUrl: '/series/0.webp'
        }
    ];

    // Helper function to convert imageUrl to local folder path
    const getSeriesImagePath = (series: Series, index: number): string => {
        // If imageUrl is already a local path (starts with /), use it
        if (series.imageUrl && series.imageUrl.startsWith('/')) {
            return series.imageUrl;
        }
        // If imageUrl is an external URL (starts with http), convert to local path using index
        // Otherwise, use index to find image in /series/ folder
        return `/series/${index}.webp`;
    };

    const fetchSeries = async () => {
        try {
            setLoading(true); // Ensure loading is true before fetch
            console.log('📺 [SeriesRecommendations] Fetching series...');
            // Add cache busting to ensure fresh data (always, not just in dev)
            const cacheBuster = `&_t=${Date.now()}`;
            const response = await fetch(`/api/v1/movies?type=series${cacheBuster}`, {
                cache: 'no-store', // Force fresh data
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [SeriesRecommendations] API response not OK:', response.status, response.statusText);
                setSeries(defaultSeries);
                setLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [SeriesRecommendations] Response is not JSON:', text.substring(0, 200));
                setSeries(defaultSeries);
                setLoading(false);
                return;
            }
            
            const data = await response.json();
            
            console.log('📺 [SeriesRecommendations] API Response:', {
                success: data.success,
                count: data.movies?.length || 0,
                series: data.movies
            });
            
            // ถ้ามีข้อมูลใน database ให้ใช้ข้อมูลนั้น แต่ถ้าไม่มี (array ว่าง) ให้ใช้ default series
            if (data.success && data.movies && Array.isArray(data.movies) && data.movies.length > 0) {
                console.log('✅ [SeriesRecommendations] Using database series:', data.movies.length);
                console.log('📺 [SeriesRecommendations] Series data:', data.movies.map(s => ({ title: s.title, platform: s.platform })));
                setSeries(data.movies);
            } else {
                // ถ้ายังไม่มีข้อมูลใน database หรือ API fail ให้ใช้ default series
                console.log('⚠️ [SeriesRecommendations] No database series, using defaults');
                setSeries(defaultSeries);
            }
        } catch (error) {
            console.error('❌ [SeriesRecommendations] Error fetching series:', error);
            // Fallback to default series on error
            setSeries(defaultSeries);
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything until mounted on client (prevents SSR/hydration flash)
    if (!mounted) {
        return (
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h3 className='text-base font-medium flex items-center gap-2'>
                                    <Tv className="h-4 w-4" />
                                    {settings?.seriesSectionTitle || 'แนะนำซีรีย์น่าดู'}
                                </h3>
                                <p className='text-xs text-muted-foreground mt-0.5'>
                                    {settings?.seriesSectionSubtitle || 'ซีรีย์ใหม่ที่น่าสนใจ'}
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

    // Don't show if loading
    if (loading) {
        return (
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h3 className='text-base font-medium flex items-center gap-2'>
                                    <Tv className="h-4 w-4" />
                                    {settings?.seriesSectionTitle || 'แนะนำซีรีย์น่าดู'}
                                </h3>
                                <p className='text-xs text-muted-foreground mt-0.5'>
                                    {settings?.seriesSectionSubtitle || 'ซีรีย์ใหม่ที่น่าสนใจ'}
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

    return (
        <section className='border-b'>
            <div className='w-full'>
                <div className='px-3 pt-3 pb-2 border-b'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='text-base font-medium flex items-center gap-2'>
                                <Tv className="h-4 w-4" />
                                {settings?.seriesSectionTitle || 'แนะนำซีรีย์น่าดู'}
                            </h3>
                            <p className='text-xs text-muted-foreground mt-0.5'>
                                {settings?.seriesSectionSubtitle || 'ซีรีย์ใหม่ที่น่าสนใจ'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='px-3 py-3'>
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {series.map((item, index) => {
                                // Debug: Log each item to see if platform exists
                                if (item.title === 'It: Derry' || item.title.includes('Derry')) {
                                    console.log('📺 [SeriesRecommendations] Rendering item:', {
                                        title: item.title,
                                        platform: item.platform,
                                        hasPlatform: !!item.platform
                                    });
                                }
                                const imagePath = getSeriesImagePath(item, index);
                                return (
                                    <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-[45%] sm:basis-[35%] md:basis-[30%]">
                                        <div className="group relative overflow-hidden rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow">
                                            <div className="aspect-[2/3] relative overflow-hidden">
                                                <img
                                                    src={imagePath}
                                                    alt={item.title}
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
                                                        // Try fallback with different extensions
                                                        const currentSrc = target.src;
                                                        if (currentSrc.endsWith('.webp')) {
                                                            target.src = currentSrc.replace('.webp', '.jpg');
                                                        } else if (currentSrc.endsWith('.jpg')) {
                                                            target.src = currentSrc.replace('.jpg', '.png');
                                                        } else {
                                                            target.src = '/image-product-app-p.png';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="p-2">
                                                <h4 className="text-xs font-medium line-clamp-2 leading-tight">
                                                    {item.title}
                                                </h4>
                                                {item.platform ? (
                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                        {item.platform}
                                                    </p>
                                                ) : (
                                                    // Debug: Show if platform is missing
                                                    process.env.NODE_ENV === 'development' && (
                                                        <p className="text-[8px] text-red-400 mt-1">
                                                            [No platform]
                                                        </p>
                                                    )
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
                </div>
            </div>
        </section>
    );
}

