"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TopupGame, TopupGameGrid, TopupGameDialog } from '@/components/topup';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const FILTER_OPTIONS = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'freefire', label: 'Free Fire' },
    { value: 'pubg', label: 'PUBG Mobile' },
    { value: 'ml', label: 'Mobile Legends' },
    { value: 'genshin', label: 'Genshin Impact' },
    { value: 'valorant', label: 'Valorant' },
    { value: 'lol', label: 'League of Legends' },
    { value: 'dota', label: 'Dota 2' },
    { value: 'csgo', label: 'CS:GO' },
    { value: 'apex', label: 'Apex Legends' },
    { value: 'fortnite', label: 'Fortnite' },
    { value: 'roblox', label: 'Roblox' },
    { value: 'minecraft', label: 'Minecraft' },
    { value: 'cod', label: 'Call of Duty' },
    { value: 'ragnarok', label: 'Ragnarok' },
    { value: 'maple', label: 'MapleStory' },
    { value: 'other', label: 'อื่นๆ' }
];

export default function TopupPage() {
    const [allGames, setAllGames] = useState<TopupGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<TopupGame | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchTopupGames();
    }, []);

    const fetchTopupGames = async () => {
        try {
            const response = await fetch('/api/v1/topup');
            
            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [TopupGame] API response not OK:', response.status, response.statusText);
                setAllGames([]);
                setLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [TopupGame] Response is not JSON:', text.substring(0, 200));
                setAllGames([]);
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (data && Array.isArray(data)) {
                setAllGames(data);
            } else {
                setAllGames([]);
            }
            // Removed error toast to prevent lag
        } catch (error) {
            console.error('❌ [TopupGame] Error fetching topup games:', error);
            setAllGames([]);
            // Removed error toast to prevent lag
        } finally {
            setLoading(false);
        }
    };

    // Filter and search games
    const filteredGames = useMemo(() => {
        let filtered = allGames;

        // Apply filter
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter(game => {
                const name = game.name.toLowerCase();
                switch (selectedFilter) {
                    case 'freefire':
                        return name.includes('free fire') || name.includes('ff');
                    case 'pubg':
                        return name.includes('pubg') || name.includes('battlegrounds');
                    case 'ml':
                        return name.includes('mobile legends') || name.includes('ml');
                    case 'genshin':
                        return name.includes('genshin');
                    case 'valorant':
                        return name.includes('valorant');
                    case 'lol':
                        return name.includes('league of legends') || name.includes('lol');
                    case 'dota':
                        return name.includes('dota');
                    case 'csgo':
                        return name.includes('cs:go') || name.includes('counter strike');
                    case 'apex':
                        return name.includes('apex');
                    case 'fortnite':
                        return name.includes('fortnite');
                    case 'roblox':
                        return name.includes('roblox');
                    case 'minecraft':
                        return name.includes('minecraft');
                    case 'cod':
                        return name.includes('call of duty') || name.includes('cod');
                    case 'ragnarok':
                        return name.includes('ragnarok');
                    case 'maple':
                        return name.includes('maple');
                    case 'other':
                        return !name.includes('free fire') &&
                               !name.includes('pubg') &&
                               !name.includes('mobile legends') &&
                               !name.includes('genshin') &&
                               !name.includes('valorant') &&
                               !name.includes('league of legends') &&
                               !name.includes('dota') &&
                               !name.includes('cs:go') &&
                               !name.includes('apex') &&
                               !name.includes('fortnite') &&
                               !name.includes('roblox') &&
                               !name.includes('minecraft') &&
                               !name.includes('call of duty') &&
                               !name.includes('ragnarok') &&
                               !name.includes('maple');
                    default:
                        return true;
                }
            });
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(game =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allGames, selectedFilter, searchQuery]);

    const handleGameClick = (game: TopupGame) => {
        setSelectedGame(game);
        setShowDialog(true);
    };

    return (
        <main className='min-h-screen'>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            เติมเกม
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการเติมเกมทั้งหมด
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className='px-3 py-3 border-b'>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <div className='relative flex-1'>
                                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                                <Input
                                    placeholder='ค้นหาเกม...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='pl-10'
                                />
                            </div>
                            <div className='relative'>
                                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                                    <SelectTrigger className='w-full sm:w-48 pl-10'>
                                        <SelectValue placeholder='เลือกประเภทเกม' />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[300px] overflow-y-auto'>
                                        {FILTER_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <TopupGameGrid
                        games={filteredGames}
                        loading={loading}
                        onGameClick={handleGameClick}
                        showViewAllButton={false}
                    />

                </div>
            </section>

            <TopupGameDialog
                game={selectedGame}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </main>
    );
}
