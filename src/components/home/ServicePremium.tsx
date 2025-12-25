"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { PremiumService, PremiumServiceGrid, PremiumServiceDialog } from '../premium';
import { toast } from 'sonner';
import Link from 'next/link';

interface ApiResponse {
    success: boolean;
    services: PremiumService[];
    count: number;
}

export default function ServicePremium() {
    const [services, setServices] = useState<PremiumService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<PremiumService | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchPremiumServices();
    }, []);

    const fetchPremiumServices = async () => {
        try {
            const response = await fetch('/api/v1/premium/recommend');
            const data: ApiResponse = await response.json();

            if (data.success) {
                setServices(data.services);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลบริการได้');
            }
        } catch (error) {
            console.error('Error fetching premium services:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceClick = (service: PremiumService) => {
        setSelectedService(service);
        setShowDialog(true);
    };

    return (
        <>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            แอพพรีเมี่ยม
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการแอพพรีเมี่ยมแนะนำ
                        </p>
                    </div>

                    <PremiumServiceGrid
                        services={services}
                        loading={loading}
                        onServiceClick={handleServiceClick}
                        showViewAllButton={true}
                        viewAllHref='/premium'
                        viewAllText='ดูทั้งหมด'
                    />

                    <div className='px-3 pb-3'>
                        <Button variant={'default'} className='w-full cursor-pointer' asChild>
                            <Link href='/premium'>
                                ดูทั้งหมด
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <PremiumServiceDialog
                service={selectedService}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </>
    );
}