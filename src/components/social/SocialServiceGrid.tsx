import React from 'react';
import { Button } from '../ui/button';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { SocialService, SocialServiceCard } from './SocialServiceCard';

interface SocialServiceGridProps {
    services: SocialService[];
    loading: boolean;
    onServiceClick: (service: SocialService) => void;
    showViewAllButton?: boolean;
    viewAllHref?: string;
    viewAllText?: string;
}

export function SocialServiceGrid({
    services,
    loading,
    onServiceClick,
    showViewAllButton = true,
    viewAllHref = '/social',
    viewAllText = 'ดูทั้งหมด'
}: SocialServiceGridProps) {
    return (
        <div className='space-y-3 p-2'>
            {loading ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className='border rounded-md relative flex cursor-pointer items-start gap-2 p-3 animate-pulse'>
                        <div>
                            <div className='w-12 h-12 bg-gray-200 rounded-md'></div>
                        </div>
                        <div className='flex-1 py-1 space-y-2'>
                            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                            <div className='flex gap-2'>
                                <div className='h-3 bg-gray-200 rounded w-16'></div>
                                <div className='h-3 bg-gray-200 rounded w-12'></div>
                                <div className='h-3 bg-gray-200 rounded w-14'></div>
                            </div>
                        </div>
                        <div className='absolute top-2 right-2'>
                            <div className='h-5 bg-gray-200 rounded w-16'></div>
                        </div>
                    </div>
                ))
            ) : services.length > 0 ? (
                <>
                    {services.map((service) => (
                        <SocialServiceCard
                            key={service.service}
                            service={service}
                            onClick={onServiceClick}
                        />
                    ))}

                    {showViewAllButton && (
                        <div className="pt-4">
                            <Link href={viewAllHref}>
                                <Button variant="default" className="w-full">
                                    {viewAllText}
                                </Button>
                            </Link>
                        </div>
                    )}
                </>
            ) : (
                <div className='text-center py-8'>
                    <Package className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                    <p className='text-gray-500'>ไม่พบข้อมูลบริการ</p>
                </div>
            )}
        </div>
    );
}
