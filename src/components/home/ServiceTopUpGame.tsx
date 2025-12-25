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
            const data = await response.json();

            if (data && Array.isArray(data)) {
                setGames(data);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลเกมได้');
            }
        } catch (error) {
            console.error('Error fetching topup games:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
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
