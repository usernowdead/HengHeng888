"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PremiumService, PremiumServiceGrid, PremiumServiceDialog } from '@/components/premium';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ApiResponse {
    success: boolean;
    services: PremiumService[];
    count: number;
}

const FILTER_OPTIONS = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'nf', label: 'Netflix (nf)' },
    { value: 'netflix', label: 'Netflix' },
    { value: 'iqiyi', label: 'IQIYI Gold' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'canva', label: 'CANVA' },
    { value: 'wetv', label: 'Wetv' },
    { value: 'viu', label: 'VIU' },
    { value: 'bilibili', label: 'Bilibili' },
    { value: 'youku', label: 'YOUKU' },
    { value: 'trueid', label: 'TrueID' },
    { value: 'ch', label: 'CH' },
    { value: 'capcut', label: 'CAPCUT' },
    { value: 'max', label: 'MAX UNLIMITED' },
    { value: 'short', label: 'SHORT' },
    { value: 'kalos', label: 'KALOS TV' },
    { value: 'goodshort', label: 'GOOD SHORT' },
    { value: 'shotshort', label: 'SHOT SHORT' },
    { value: 'reelshort', label: 'REEL SHORT' },
    { value: 'moboreels', label: 'MOBOREELS VIP' },
    { value: 'stardust', label: 'STARDUST TV' },
    { value: 'shortwave', label: 'SHORT WAVE' },
    { value: 'netshort', label: 'NET SHORT' },
    { value: 'flextv', label: 'FLEXTV' },
    { value: 'monomax1', label: 'MONOMAX1' },
    { value: 'youkuvip', label: 'YOUKU VIP' },
    { value: 'chatgpt', label: 'Chat GPT' }
];

export default function PremiumPage() {
    const [allServices, setAllServices] = useState<PremiumService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<PremiumService | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchPremiumServices();
    }, []);

    const fetchPremiumServices = async () => {
        try {
            const response = await fetch('/api/v1/premium');
            
            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [Premium] API response not OK:', response.status, response.statusText);
                setAllServices([]);
                setLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [Premium] Response is not JSON:', text.substring(0, 200));
                setAllServices([]);
                setLoading(false);
                return;
            }

            const data: ApiResponse = await response.json();

            if (data.success) {
                setAllServices(data.services || []);
            } else {
                setAllServices([]);
            }
            // Removed error toast to prevent lag
        } catch (error) {
            console.error('❌ [Premium] Error fetching premium services:', error);
            setAllServices([]);
            // Removed error toast to prevent lag
        } finally {
            setLoading(false);
        }
    };

    // Filter and search services
    const filteredServices = useMemo(() => {
        let filtered = allServices;

        // Apply filter
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter(service => {
                const name = service.name.toLowerCase();
                switch (selectedFilter) {
                    case 'nf':
                        return name.includes('netflix') || name.includes('nf');
                    case 'netflix':
                        return name.includes('netflix');
                    case 'iqiyi':
                        return name.includes('iqiyi') || name.includes('gold');
                    case 'youtube':
                        return name.includes('youtube');
                    case 'canva':
                        return name.includes('canva');
                    case 'wetv':
                        return name.includes('wetv');
                    case 'viu':
                        return name.includes('viu');
                    case 'bilibili':
                        return name.includes('bilibili');
                    case 'youku':
                        return name.includes('youku');
                    case 'trueid':
                        return name.includes('trueid');
                    case 'ch':
                        return name.includes('ch');
                    case 'capcut':
                        return name.includes('capcut');
                    case 'max':
                        return name.includes('max') || name.includes('unlimited');
                    case 'short':
                        return name.includes('short');
                    case 'kalos':
                        return name.includes('kalos');
                    case 'goodshort':
                        return name.includes('good short');
                    case 'shotshort':
                        return name.includes('shot short');
                    case 'reelshort':
                        return name.includes('reel short');
                    case 'moboreels':
                        return name.includes('moboreels') || name.includes('vip');
                    case 'stardust':
                        return name.includes('stardust');
                    case 'shortwave':
                        return name.includes('short wave');
                    case 'netshort':
                        return name.includes('net short');
                    case 'flextv':
                        return name.includes('flextv');
                    case 'monomax1':
                        return name.includes('monomax');
                    case 'youkuvip':
                        return name.includes('youku vip');
                    case 'chatgpt':
                        return name.includes('chat') && name.includes('gpt');
                    default:
                        return true;
                }
            });
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return filtered;
    }, [allServices, selectedFilter, searchQuery]);

    const handleServiceClick = (service: PremiumService) => {
        setSelectedService(service);
        setShowDialog(true);
    };

    return (
        <main className='min-h-screen'>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            แอพพรีเมี่ยม
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการแอพพรีเมี่ยมทั้งหมด
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className='px-3 py-3 border-b'>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <div className='relative flex-1'>
                                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                                <Input
                                    placeholder='ค้นหาบริการ...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='pl-10'
                                />
                            </div>
                            <div className='relative'>
                                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                                    <SelectTrigger className='w-full sm:w-48 pl-10'>
                                        <SelectValue placeholder='เลือกประเภท' />
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

                    <PremiumServiceGrid
                        services={filteredServices}
                        loading={loading}
                        onServiceClick={handleServiceClick}
                        showViewAllButton={false}
                    />

                </div>
            </section>

            <PremiumServiceDialog
                service={selectedService}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </main>
    );
}