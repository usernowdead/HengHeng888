"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Wallet } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function TopupSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, refreshUser } = useAuth()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Refresh user balance
        const refresh = async () => {
            if (refreshUser) {
                await refreshUser()
            }
            setLoading(false)
        }
        refresh()
    }, [refreshUser])

    return (
        <main className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardContent className='pt-6'>
                    <div className='text-center space-y-4'>
                        <div className='flex justify-center'>
                            <div className='rounded-full bg-green-100 p-3'>
                                <CheckCircle className='h-12 w-12 text-green-600' />
                            </div>
                        </div>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
                                ชำระเงินสำเร็จ
                            </h1>
                            <p className='text-sm text-gray-600'>
                                ระบบกำลังเติมเงินเข้าบัญชีของคุณ กรุณารอสักครู่
                            </p>
                        </div>
                        {loading ? (
                            <div className='flex items-center justify-center gap-2 text-gray-600'>
                                <Spinner />
                                <span className='text-sm'>กำลังอัปเดตยอดเงิน...</span>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='p-4 bg-gray-50 rounded-lg'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-gray-600'>ยอดเงินคงเหลือ</span>
                                        <div className='flex items-center gap-2'>
                                            <Wallet className='h-5 w-5 text-gray-400' />
                                            <span className='text-lg font-bold text-gray-900'>
                                                ฿{(user?.balance || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex gap-3'>
                                    <Button
                                        variant='outline'
                                        onClick={() => router.push('/')}
                                        className='flex-1'
                                    >
                                        กลับหน้าหลัก
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/store')}
                                        className='flex-1'
                                    >
                                        ไปซื้อสินค้า
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

