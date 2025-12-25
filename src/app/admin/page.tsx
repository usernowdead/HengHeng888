"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
    Users, 
    ShoppingCart, 
    DollarSign, 
    Wallet,
    AlertTriangle,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'

interface StatsData {
    overview: {
        totalUsers: number
        totalOrders: number
        totalRevenue: string
        totalBalance: string
    }
    orders: {
        total: number
        pending: number
        completed: number
        failed: number
        processing: number
    }
    ordersByType: {
        premium: number
        topup: number
        social: number
    }
    recent: {
        orders: number
        revenue: string
    }
}

interface GafiwBalance {
    balance: number
    balanceFormatted: string
    owner: string
    lastChecked: string
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<StatsData | null>(null)
    const [gafiwBalance, setGafiwBalance] = useState<GafiwBalance | null>(null)
    const [gafiwLoading, setGafiwLoading] = useState(true)
    const [gafiwError, setGafiwError] = useState<string | null>(null)

    useEffect(() => {
        fetchStats()
        fetchGafiwBalance()
    }, [])

    const fetchStats = async () => {
        try {
            console.log('📊 [Dashboard] Starting to fetch stats...')
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            console.log('📊 [Dashboard] Token in localStorage:', token ? 'Found' : 'Not found (will try cookie)')

            // createAuthFetchOptions will use cookie if token is not available
            const response = await fetch('/api/v1/admin/stats', 
                createAuthFetchOptions({}, token)
            )

            console.log('📊 [Dashboard] API Response status:', response.status)

            if (response.status === 401) {
                console.error('❌ [Dashboard] Unauthorized - redirecting to login')
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin'
                }
                setLoading(false)
                return
            }

            if (!response.ok) {
                console.error('❌ [Dashboard] API Response not OK:', response.status, response.statusText)
                const errorData = await response.json().catch(() => ({}))
                console.error('❌ [Dashboard] Error data:', errorData)
                setLoading(false)
                return
            }

            const data = await response.json()
            console.log('📊 [Dashboard] API Response data:', data)

            if (data.success) {
                console.log('✅ [Dashboard] Stats loaded successfully')
                setStats(data.data)
            } else {
                console.error('❌ [Dashboard] API returned error:', data.message)
            }
        } catch (error) {
            console.error('❌ [Dashboard] Error fetching stats:', error)
            console.error('❌ [Dashboard] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchGafiwBalance = async () => {
        try {
            setGafiwLoading(true)
            setGafiwError(null)
            const token = localStorage.getItem('auth_token')
            if (!token) {
                setGafiwLoading(false)
                setGafiwError('กรุณาเข้าสู่ระบบ')
                return
            }

            const response = await fetch('/api/v1/admin/gafiw-balance', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            console.log('Gafiw Balance API Response:', data) // Debug log
            
            if (data.success) {
                setGafiwBalance(data.data)
                setGafiwError(null)
            } else {
                const errorMsg = data.message || 'ไม่สามารถโหลดข้อมูลยอดเงินได้'
                console.error('Gafiw Balance API Error:', errorMsg)
                setGafiwError(errorMsg)
                setGafiwBalance(null)
            }
        } catch (error: any) {
            console.error('Error fetching gafiw balance:', error)
            setGafiwError('เกิดข้อผิดพลาดในการเชื่อมต่อ API')
            setGafiwBalance(null)
        } finally {
            setGafiwLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className='p-4 text-center'>
                <p className='text-gray-500'>ไม่สามารถโหลดข้อมูลได้</p>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <h2 className='text-2xl font-semibold text-gray-900'>Dashboard</h2>
                <p className='text-sm text-gray-500 mt-1'>ยินดีต้อนรับ, {user?.username}</p>
            </div>

            {/* Gafiwshop Balance Alert */}
            {gafiwBalance && gafiwBalance.balance < 100 && (
                <Card className='border-orange-200 bg-orange-50'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center gap-3'>
                            <AlertTriangle className='h-5 w-5 text-orange-600' />
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-orange-900'>
                                    ยอดเงิน Gafiwshop ต่ำ
                                </p>
                                <p className='text-xs text-orange-700 mt-0.5'>
                                    ยอดเงินคงเหลือ: ฿{gafiwBalance.balanceFormatted} - กรุณาเติมเงินเพื่อให้บริการต่อเนื่อง
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overview Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>ผู้ใช้ทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>{stats.overview.totalUsers}</span>
                            <span className='text-sm text-gray-500'>คน</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>ออเดอร์ทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>{stats.overview.totalOrders}</span>
                            <span className='text-sm text-gray-500'>รายการ</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>รายได้รวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>฿{parseFloat(stats.overview.totalRevenue).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>ยอดเงินรวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>฿{parseFloat(stats.overview.totalBalance).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Gafiwshop Balance */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle className='text-base font-semibold'>ยอดเงิน Gafiwshop</CardTitle>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={fetchGafiwBalance}
                            disabled={gafiwLoading}
                            className='h-8 w-8 p-0'
                        >
                            <RefreshCw className={`h-4 w-4 ${gafiwLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {gafiwLoading ? (
                            <div className='flex items-center justify-center py-4'>
                                <Spinner />
                            </div>
                        ) : gafiwError ? (
                            <div className='space-y-3'>
                                <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                                    <div className='flex items-start gap-2'>
                                        <AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 shrink-0' />
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium text-red-900'>ไม่สามารถโหลดข้อมูลได้</p>
                                            <p className='text-xs text-red-700 mt-1'>{gafiwError}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={fetchGafiwBalance}
                                    className='w-full'
                                >
                                    <RefreshCw className='h-4 w-4 mr-2' />
                                    ลองใหม่
                                </Button>
                            </div>
                        ) : gafiwBalance ? (
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between py-2 border-b'>
                                    <span className='text-sm text-gray-700'>ยอดเงินคงเหลือ</span>
                                    <span className={`text-lg font-bold ${gafiwBalance.balance < 100 ? 'text-orange-600' : 'text-gray-900'}`}>
                                        ฿{parseFloat(gafiwBalance.balanceFormatted).toLocaleString()}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between py-2 border-b'>
                                    <span className='text-sm text-gray-700'>บัญชี</span>
                                    <span className='text-sm font-medium text-gray-900'>{gafiwBalance.owner || '-'}</span>
                                </div>
                                <div className='flex items-center justify-between py-2'>
                                    <span className='text-sm text-gray-700'>อัปเดตล่าสุด</span>
                                    <span className='text-xs text-gray-500'>
                                        {new Date(gafiwBalance.lastChecked).toLocaleString('th-TH')}
                                    </span>
                                </div>
                                {gafiwBalance.balance < 100 && (
                                    <div className='mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md'>
                                        <p className='text-xs text-orange-700'>
                                            ยอดเงินต่ำกว่า 100 บาท กรุณาเติมเงินเพื่อให้บริการต่อเนื่อง
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className='text-sm text-gray-500 text-center py-4'>ไม่สามารถโหลดข้อมูลได้</p>
                        )}
                    </CardContent>
                </Card>

                {/* Orders Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-base font-semibold'>สถานะออเดอร์</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between py-2 border-b'>
                                <span className='text-sm text-gray-700'>รอดำเนินการ</span>
                                <span className='font-semibold text-gray-900'>{stats.orders.pending}</span>
                            </div>
                            <div className='flex items-center justify-between py-2 border-b'>
                                <span className='text-sm text-gray-700'>กำลังดำเนินการ</span>
                                <span className='font-semibold text-gray-900'>{stats.orders.processing}</span>
                            </div>
                            <div className='flex items-center justify-between py-2 border-b'>
                                <span className='text-sm text-gray-700'>สำเร็จ</span>
                                <span className='font-semibold text-gray-900'>{stats.orders.completed}</span>
                            </div>
                            <div className='flex items-center justify-between py-2'>
                                <span className='text-sm text-gray-700'>ล้มเหลว</span>
                                <span className='font-semibold text-gray-900'>{stats.orders.failed}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders by Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-base font-semibold'>ออเดอร์ตามประเภท</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between py-2 border-b'>
                                <span className='text-sm text-gray-700'>แอพพรีเมี่ยม</span>
                                <span className='font-semibold text-gray-900'>{stats.ordersByType.premium}</span>
                            </div>
                            <div className='flex items-center justify-between py-2 border-b'>
                                <span className='text-sm text-gray-700'>เติมเกม</span>
                                <span className='font-semibold text-gray-900'>{stats.ordersByType.topup}</span>
                            </div>
                            <div className='flex items-center justify-between py-2'>
                                <span className='text-sm text-gray-700'>ปั้มโซเชียล</span>
                                <span className='font-semibold text-gray-900'>{stats.ordersByType.social}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>กิจกรรมล่าสุด (7 วัน)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between py-2 border-b'>
                            <span className='text-sm text-gray-700'>ออเดอร์ใหม่</span>
                            <span className='font-semibold text-gray-900'>{stats.recent.orders}</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <span className='text-sm text-gray-700'>รายได้</span>
                            <span className='font-semibold text-gray-900'>฿{parseFloat(stats.recent.revenue).toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

