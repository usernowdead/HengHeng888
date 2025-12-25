"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SocialService, SocialServiceGrid, SocialServiceDialog } from '@/components/social';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ApiResponse {
    success: boolean;
    services: SocialService[];
    count: number;
}

const FILTER_OPTIONS = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'other', label: 'อื่นๆ' }
];

export default function SocialPage() {
    const [allServices, setAllServices] = useState<SocialService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<SocialService | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [displayLimit, setDisplayLimit] = useState(50);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchSocialServices();
    }, []);

    const fetchSocialServices = async () => {
        try {
            const response = await fetch('/api/v1/social');
            const data: ApiResponse = await response.json();

            if (data.success) {
                setAllServices(data.services);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลบริการได้');
            }
        } catch (error) {
            console.error('Error fetching social services:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    // Filter and search services
    const allFilteredServices = useMemo(() => {
        let filtered = allServices;

        // Apply filter
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter(service => {
                const category = service.category.toLowerCase();
                switch (selectedFilter) {
                    case 'instagram':
                        return category.includes('instagram');
                    case 'facebook':
                        return category.includes('facebook');
                    case 'tiktok':
                        return category.includes('tiktok');
                    case 'twitter':
                        return category.includes('twitter') || category.includes('x');
                    case 'youtube':
                        return category.includes('youtube');
                    case 'linkedin':
                        return category.includes('linkedin');
                    case 'telegram':
                        return category.includes('telegram');
                    case 'other':
                        return !category.includes('instagram') &&
                               !category.includes('facebook') &&
                               !category.includes('tiktok') &&
                               !category.includes('twitter') &&
                               !category.includes('youtube') &&
                               !category.includes('linkedin') &&
                               !category.includes('telegram');
                    default:
                        return true;
                }
            });
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allServices, selectedFilter, searchQuery]);

    // Display services based on limit
    const displayedServices = useMemo(() => {
        if (showAll) {
            return allFilteredServices;
        }
        return allFilteredServices.slice(0, displayLimit);
    }, [allFilteredServices, displayLimit, showAll]);

    const handleServiceClick = (service: SocialService) => {
        setSelectedService(service);
        setShowDialog(true);
    };

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 50);
    };

    const handleShowAll = () => {
        setShowAll(true);
    };

    const handleResetLimit = () => {
        setShowAll(false);
        setDisplayLimit(50);
    };

    // Reset display when filter/search changes
    useEffect(() => {
        handleResetLimit();
    }, [selectedFilter, searchQuery]);

    return (
        <main className='min-h-screen'>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            บริการปั้มโซเชียลมีเดีย
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการปั้มโซเชียลมีเดียทั้งหมด
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

                    {/* Results count */}
                    {!loading && (
                        <div className='px-3 pb-2'>
                            <p className='text-xs text-muted-foreground'>
                                แสดง {displayedServices.length} จาก {allFilteredServices.length} บริการ
                                {selectedFilter !== 'all' && ` ในหมวดหมู่ ${FILTER_OPTIONS.find(opt => opt.value === selectedFilter)?.label}`}
                                {searchQuery && ` ค้นหา "${searchQuery}"`}
                            </p>
                        </div>
                    )}

                    <SocialServiceGrid
                        services={displayedServices}
                        loading={loading}
                        onServiceClick={handleServiceClick}
                        showViewAllButton={false}
                    />

                    {/* Load More / Show All Buttons */}
                    {!loading && allFilteredServices.length > 0 && (
                        <div className='p-3 border-t'>
                            <div className='flex gap-2 justify-center'>
                                {!showAll && displayedServices.length < allFilteredServices.length && (
                                    <Button
                                        className='cursor-pointer'
                                        variant='outline'
                                        onClick={handleLoadMore}
                                    >
                                        แสดงเพิ่มเติม (+50)
                                    </Button>
                                )}

                                {!showAll && allFilteredServices.length > 50 && (
                                    <Button
                                        className='cursor-pointer'
                                        variant='secondary'
                                        onClick={handleShowAll}
                                    >
                                        แสดงทั้งหมด ({allFilteredServices.length})
                                    </Button>
                                )}

                                {showAll && (
                                    <Button
                                        className='cursor-pointer'
                                        variant='secondary'
                                        onClick={handleResetLimit}
                                    >
                                        แสดงน้อยลง
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </section>

            <SocialServiceDialog
                service={selectedService}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </main>
    );
}