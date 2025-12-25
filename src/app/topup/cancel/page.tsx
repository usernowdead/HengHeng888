"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function TopupCancelPage() {
    const router = useRouter()

    return (
        <main className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardContent className='pt-6'>
                    <div className='text-center space-y-4'>
                        <div className='flex justify-center'>
                            <div className='rounded-full bg-red-100 p-3'>
                                <XCircle className='h-12 w-12 text-red-600' />
                            </div>
                        </div>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
                                ยกเลิกการชำระเงิน
                            </h1>
                            <p className='text-sm text-gray-600'>
                                คุณได้ยกเลิกการชำระเงินแล้ว ไม่มีการหักเงินจากบัญชีของคุณ
                            </p>
                        </div>
                        <div className='flex gap-3 pt-4'>
                            <Button
                                variant='outline'
                                onClick={() => router.push('/topup')}
                                className='flex-1'
                            >
                                ลองอีกครั้ง
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                className='flex-1'
                            >
                                กลับหน้าหลัก
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

