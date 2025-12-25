import React from 'react';
import { Button } from '../ui/button';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { PremiumService, PremiumServiceCard } from './PremiumServiceCard';

interface PremiumServiceGridProps {
    services: PremiumService[];
    loading: boolean;
    onServiceClick: (service: PremiumService) => void;
    showViewAllButton?: boolean;
    viewAllHref?: string;
    viewAllText?: string;
}

export function PremiumServiceGrid({
    services,
    loading,
    onServiceClick,
    showViewAllButton = true,
    viewAllHref = '/premium',
    viewAllText = 'ดูทั้งหมด'
}: PremiumServiceGridProps) {
    return (
        <div className='grid grid-cols-3 gap-2 p-2'>
            {loading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className='group relative overflow-hidden border p-2 rounded-md animate-pulse'>
                        <div className='w-full h-24 bg-gray-200 rounded-md'></div>
                        <div className='mt-2 space-y-2'>
                            <div className='h-4 bg-gray-200 rounded'></div>
                            <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                        </div>
                    </div>
                ))
            ) : services.length > 0 ? (
                services.map((service) => (
                    <PremiumServiceCard
                        key={service.id}
                        service={service}
                        onClick={onServiceClick}
                    />
                ))
            ) : (
                <div className='col-span-full text-center py-8'>
                    <Package className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                    <p className='text-gray-500'>ไม่พบข้อมูลบริการ</p>
                </div>
            )}
        </div>
    );
}
