"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { TopupGame, TopupGameGrid, TopupGameDialog } from '../topup';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ServiceTopUpGame() {
    const [games, setGames] = useState<TopupGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<TopupGame | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchTopupGames();
    }, []);

    const fetchTopupGames = async () => {
        try {
            const response = await fetch('/api/v1/topup/recommend');
            
            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [TopupGame] API response not OK:', response.status, response.statusText);
                setGames([]);
                setLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [TopupGame] Response is not JSON:', text.substring(0, 200));
                setGames([]);
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (data && Array.isArray(data)) {
                setGames(data);
            } else {
                setGames([]);
            }
            // Removed error toast to prevent lag
        } catch (error) {
            console.error('❌ [TopupGame] Error fetching topup games:', error);
            setGames([]);
            // Removed error toast to prevent lag
        } finally {
            setLoading(false);
        }
    };

    const handleGameClick = (game: TopupGame) => {
        setSelectedGame(game);
        setShowDialog(true);
    };

    return (
        <>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            เติมเกม
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการเติมเกมแนะนำ
                        </p>
                    </div>

                    <TopupGameGrid
                        games={games}
                        loading={loading}
                        onGameClick={handleGameClick}
                        showViewAllButton={true}
                        viewAllHref='/topup'
                        viewAllText='ดูทั้งหมด'
                    />

                    <div className='px-3 pb-3'>
                        <Button variant={'default'} className='w-full cursor-pointer' asChild>
                            <Link href='/topupgame'>
                                ดูทั้งหมด
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <TopupGameDialog
                game={selectedGame}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </>
    );
}
