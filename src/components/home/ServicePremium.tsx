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
            setLoading(true);
            const response = await fetch('/api/v1/premium/recommend', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [ServicePremium] API response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ [ServicePremium] Error response:', errorText.substring(0, 200));
                throw new Error(`API returned ${response.status}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [ServicePremium] Response is not JSON:', text.substring(0, 200));
                throw new Error('Response is not JSON');
            }

            const data: ApiResponse = await response.json();
            console.log('✅ [ServicePremium] Fetched services:', data.count, 'services');

            if (data.success && data.services && Array.isArray(data.services)) {
                setServices(data.services);
                if (data.services.length === 0) {
                    console.warn('⚠️ [ServicePremium] No services returned from API');
                }
            } else {
                console.warn('⚠️ [ServicePremium] API returned success=false or invalid data');
                setServices([]);
            }
        } catch (error) {
            console.error('❌ [ServicePremium] Error fetching premium services:', error);
            setServices([]);
            // Don't show toast error to avoid spamming user
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