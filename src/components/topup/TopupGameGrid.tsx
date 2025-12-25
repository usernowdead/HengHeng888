import React from 'react';
import { TopupGameCard, TopupGame } from './TopupGameCard';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';

interface TopupGameGridProps {
    games: TopupGame[];
    loading: boolean;
    onGameClick: (game: TopupGame) => void;
    showViewAllButton?: boolean;
    viewAllHref?: string;
    viewAllText?: string;
}

export function TopupGameGrid({
    games,
    loading,
    onGameClick,
    showViewAllButton = false,
    viewAllHref,
    viewAllText
}: TopupGameGridProps) {
    if (loading) {
        return (
            <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="border p-3 rounded-md">
                            <div className="flex flex-col items-center gap-2">
                                <Skeleton className="w-12 h-12 rounded-md" />
                                <div className="w-full space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3 mx-auto" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="p-3 text-center">
                <p className="text-muted-foreground">ไม่พบเกมที่พร้อมให้บริการ</p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
                {games.map((game) => (
                    <TopupGameCard
                        key={game.key}
                        game={game}
                        onClick={onGameClick}
                    />
                ))}
            </div>
        </div>
    );
}


