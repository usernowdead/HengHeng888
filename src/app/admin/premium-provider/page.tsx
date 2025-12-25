"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createAuthFetchOptions } from '@/lib/api-helpers';

type PremiumProvider = 'gafiw' | 'peamsub' | 'both';

interface ProviderStatus {
    name: string;
    enabled: boolean;
    description: string;
    apiKeySet: boolean;
}

export default function PremiumProviderPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [providers, setProviders] = useState<ProviderStatus[]>([
        {
            name: 'Gafiwshop',
            enabled: true,
            description: 'Gafiwshop - แอพพรีเมี่ยม (API: gafiwshop.xyz)',
            apiKeySet: false
        },
        {
            name: 'Peamsub24hr',
            enabled: false,
            description: 'Peamsub24hr - แอพพรีเมี่ยมและสินค้าพรีออเดอร์ (API: api.peamsub24hr.com)',
            apiKeySet: false
        }
    ]);
    const [selectedProvider, setSelectedProvider] = useState<PremiumProvider>('gafiw');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            
            const response = await fetch('/api/v1/admin/website-settings',
                createAuthFetchOptions({
                    method: 'GET',
                }, token)
            );

            if (response.status === 401) {
                toast.error('กรุณาเข้าสู่ระบบใหม่');
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin';
                }
                return;
            }

            const data = await response.json();

            if (data.success && data.data) {
                const settings = data.data;
                
                // Get provider settings
                const gafiwEnabled = settings['premium_provider_gafiw_enabled'] !== false && settings['premium_provider_gafiw_enabled'] !== 'false';
                const peamsubEnabled = settings['premium_provider_peamsub_enabled'] !== false && settings['premium_provider_peamsub_enabled'] !== 'false';
                
                // Determine selected provider
                let provider: PremiumProvider = 'gafiw';
                if (gafiwEnabled && peamsubEnabled) {
                    provider = 'both';
                } else if (peamsubEnabled) {
                    provider = 'peamsub';
                } else {
                    provider = 'gafiw';
                }

                setSelectedProvider(provider);
                setProviders([
                    {
                        ...providers[0],
                        enabled: gafiwEnabled,
                        apiKeySet: !!process.env.NEXT_PUBLIC_API_KEY_GAFIW || true // Check if API key is set
                    },
                    {
                        ...providers[1],
                        enabled: peamsubEnabled,
                        apiKeySet: !!process.env.NEXT_PUBLIC_API_KEY_PEAMSUB || true // Check if API key is set
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

            // Determine enabled providers based on selection
            const gafiwEnabled = selectedProvider === 'gafiw' || selectedProvider === 'both';
            const peamsubEnabled = selectedProvider === 'peamsub' || selectedProvider === 'both';

            const settings = {
                premium_provider_gafiw_enabled: gafiwEnabled,
                premium_provider_peamsub_enabled: peamsubEnabled,
                premium_provider_selection: selectedProvider
            };

            const response = await fetch('/api/v1/admin/website-settings',
                createAuthFetchOptions({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(settings)
                }, token)
            );

            if (response.status === 401) {
                toast.error('กรุณาเข้าสู่ระบบใหม่ (Session หมดอายุ)');
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin';
                }
                return;
            }

            const data = await response.json();

            if (data.success) {
                toast.success('บันทึกการตั้งค่าสำเร็จ');
                // Update local state
                setProviders([
                    {
                        ...providers[0],
                        enabled: gafiwEnabled
                    },
                    {
                        ...providers[1],
                        enabled: peamsubEnabled
                    }
                ]);
            } else {
                toast.error(data.message || 'เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    const handleProviderChange = (provider: PremiumProvider) => {
        setSelectedProvider(provider);
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <h2 className='text-2xl font-semibold text-gray-900'>จัดการผู้ให้บริการแอพพรีเมี่ยม</h2>
                <p className='text-sm text-gray-500 mt-1'>
                    เลือกผู้ให้บริการที่ต้องการแสดงผลในหน้าแอพพรีเมี่ยม
                </p>
            </div>

            {/* Info Card */}
            <Card className='border-blue-200 bg-blue-50'>
                <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                        <Info className='h-5 w-5 text-blue-600 mt-0.5' />
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-blue-900 mb-1'>
                                วิธีใช้งาน
                            </p>
                            <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                                <li>เลือกผู้ให้บริการที่ต้องการแสดงผล (Gafiwshop, Peamsub24hr, หรือทั้งสอง)</li>
                                <li>เมื่อสินค้าของเจ้าหนึ่งหมด สามารถสลับไปใช้เจ้าอื่นได้ทันที</li>
                                <li>หากเลือก "ทั้งสอง" ระบบจะแสดงสินค้าจากทั้งสองเจ้า</li>
                                <li>ต้องตั้งค่า API Key ของแต่ละเจ้าในหน้า "ตั้งค่า API KEY" ก่อนใช้งาน</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Provider Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>เลือกผู้ให้บริการ</CardTitle>
                    <CardDescription>
                        เลือกผู้ให้บริการที่ต้องการแสดงผลในหน้าแอพพรีเมี่ยม
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Gafiwshop */}
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                                <Label className='text-base font-semibold'>Gafiwshop</Label>
                                {providers[0].enabled && (
                                    <CheckCircle className='h-4 w-4 text-green-600' />
                                )}
                            </div>
                            <p className='text-sm text-gray-600'>{providers[0].description}</p>
                            <p className='text-xs text-gray-500 mt-1'>
                                API: https://gafiwshop.xyz/api
                            </p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Switch
                                checked={selectedProvider === 'gafiw' || selectedProvider === 'both'}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        if (selectedProvider === 'peamsub') {
                                            setSelectedProvider('both');
                                        } else {
                                            setSelectedProvider('gafiw');
                                        }
                                    } else {
                                        if (selectedProvider === 'both') {
                                            setSelectedProvider('peamsub');
                                        } else {
                                            setSelectedProvider('peamsub'); // At least one must be enabled
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Peamsub24hr */}
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                                <Label className='text-base font-semibold'>Peamsub24hr</Label>
                                {providers[1].enabled && (
                                    <CheckCircle className='h-4 w-4 text-green-600' />
                                )}
                            </div>
                            <p className='text-sm text-gray-600'>{providers[1].description}</p>
                            <p className='text-xs text-gray-500 mt-1'>
                                API: https://api.peamsub24hr.com/v2
                            </p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Switch
                                checked={selectedProvider === 'peamsub' || selectedProvider === 'both'}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        if (selectedProvider === 'gafiw') {
                                            setSelectedProvider('both');
                                        } else {
                                            setSelectedProvider('peamsub');
                                        }
                                    } else {
                                        if (selectedProvider === 'both') {
                                            setSelectedProvider('gafiw');
                                        } else {
                                            setSelectedProvider('gafiw'); // At least one must be enabled
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Current Selection Display */}
                    <div className='pt-4 border-t'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>
                            การตั้งค่าปัจจุบัน:
                        </p>
                        <div className='flex items-center gap-2'>
                            {selectedProvider === 'both' && (
                                <Badge variant='default' className='bg-green-600'>
                                    แสดงทั้งสองเจ้า
                                </Badge>
                            )}
                            {selectedProvider === 'gafiw' && (
                                <Badge variant='default' className='bg-blue-600'>
                                    แสดงเฉพาะ Gafiwshop
                                </Badge>
                            )}
                            {selectedProvider === 'peamsub' && (
                                <Badge variant='default' className='bg-purple-600'>
                                    แสดงเฉพาะ Peamsub24hr
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Warning if no provider selected */}
            {(selectedProvider !== 'gafiw' && selectedProvider !== 'peamsub' && selectedProvider !== 'both') && (
                <Card className='border-orange-200 bg-orange-50'>
                    <CardContent className='pt-6'>
                        <div className='flex items-start gap-3'>
                            <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-orange-900 mb-1'>
                                    คำเตือน
                                </p>
                                <p className='text-xs text-orange-700'>
                                    ต้องเลือกผู้ให้บริการอย่างน้อย 1 เจ้า
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Save Button */}
            <div className='flex justify-end'>
                <Button
                    onClick={handleSave}
                    disabled={saving || (selectedProvider !== 'gafiw' && selectedProvider !== 'peamsub' && selectedProvider !== 'both')}
                    size='lg'
                >
                    {saving ? (
                        <>
                            <Spinner className='h-4 w-4 mr-2' />
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            <CheckCircle className='h-4 w-4 mr-2' />
                            บันทึกการตั้งค่า
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

