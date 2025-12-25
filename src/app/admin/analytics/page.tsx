"use client"

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface AnalyticsData {
    period: {
        days: number
        startDate: string
        endDate: string
    }
    summary: {
        totalRevenue: string
        totalOrders: number
        averageOrderValue: string
    }
    dailyRevenue: Array<{ date: string; revenue: string }>
    dailyOrders: Array<{ date: string; count: number }>
    revenueByType: {
        premium: number
        topup_game: number
        social: number
    }
    ordersByState: {
        pending: number
        completed: number
        failed: number
        processing: number
    }
    topUsers: Array<{
        userId: string
        username: string
        email: string
        orderCount: number
    }>
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState('30')
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

    useEffect(() => {
        fetchAnalytics()
    }, [days])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch(`/api/v1/admin/analytics?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (data.success) {
                setAnalytics(data.data)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className='p-4 text-center'>
                <p className='text-gray-500'>ไม่สามารถโหลดข้อมูลได้</p>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-900'>รายงานและสถิติ</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        ข้อมูลย้อนหลัง {days} วัน
                    </p>
                </div>
                <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className='w-32'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='7'>7 วัน</SelectItem>
                        <SelectItem value='30'>30 วัน</SelectItem>
                        <SelectItem value='90'>90 วัน</SelectItem>
                        <SelectItem value='365'>1 ปี</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-2 gap-3'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-medium text-gray-600'>รายได้รวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center gap-2'>
                            <DollarSign className='h-5 w-5 text-green-600' />
                            <span className='text-xl font-bold'>
                                ฿{parseFloat(analytics.summary.totalRevenue).toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-medium text-gray-600'>ออเดอร์ทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center gap-2'>
                            <ShoppingCart className='h-5 w-5 text-blue-600' />
                            <span className='text-xl font-bold'>{analytics.summary.totalOrders}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-medium text-gray-600'>ค่าเฉลี่ยต่อออเดอร์</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center gap-2'>
                            <TrendingUp className='h-5 w-5 text-purple-600' />
                            <span className='text-xl font-bold'>
                                ฿{parseFloat(analytics.summary.averageOrderValue).toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-xs font-medium text-gray-600'>ออเดอร์สำเร็จ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center gap-2'>
                            <BarChart3 className='h-5 w-5 text-green-600' />
                            <span className='text-xl font-bold'>{analytics.ordersByState.completed}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Type */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base'>รายได้ตามประเภท</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        <div>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-sm'>แอพพรีเมี่ยม</span>
                                <span className='font-semibold'>฿{analytics.revenueByType.premium.toLocaleString()}</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                    className='bg-blue-600 h-2 rounded-full'
                                    style={{
                                        width: `${(analytics.revenueByType.premium / Math.max(1, analytics.revenueByType.premium + analytics.revenueByType.topup_game + analytics.revenueByType.social)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-sm'>เติมเกม</span>
                                <span className='font-semibold'>฿{analytics.revenueByType.topup_game.toLocaleString()}</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                    className='bg-green-600 h-2 rounded-full'
                                    style={{
                                        width: `${(analytics.revenueByType.topup_game / Math.max(1, analytics.revenueByType.premium + analytics.revenueByType.topup_game + analytics.revenueByType.social)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-sm'>ปั้มโซเชียล</span>
                                <span className='font-semibold'>฿{analytics.revenueByType.social.toLocaleString()}</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                    className='bg-purple-600 h-2 rounded-full'
                                    style={{
                                        width: `${(analytics.revenueByType.social / Math.max(1, analytics.revenueByType.premium + analytics.revenueByType.topup_game + analytics.revenueByType.social)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders by State */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base'>ออเดอร์ตามสถานะ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='flex items-center gap-2 p-2 bg-yellow-50 rounded'>
                            <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                            <span className='text-sm flex-1'>รอดำเนินการ</span>
                            <span className='font-semibold'>{analytics.ordersByState.pending}</span>
                        </div>
                        <div className='flex items-center gap-2 p-2 bg-green-50 rounded'>
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span className='text-sm flex-1'>สำเร็จ</span>
                            <span className='font-semibold'>{analytics.ordersByState.completed}</span>
                        </div>
                        <div className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            <span className='text-sm flex-1'>กำลังดำเนินการ</span>
                            <span className='font-semibold'>{analytics.ordersByState.processing}</span>
                        </div>
                        <div className='flex items-center gap-2 p-2 bg-red-50 rounded'>
                            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                            <span className='text-sm flex-1'>ล้มเหลว</span>
                            <span className='font-semibold'>{analytics.ordersByState.failed}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Users */}
            {analytics.topUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-base'>ผู้ใช้ที่สั่งซื้อมากที่สุด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {analytics.topUsers.map((user, index) => (
                                <div
                                    key={user.userId}
                                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                                >
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold'>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className='text-sm font-medium'>{user.username}</p>
                                            <p className='text-xs text-gray-500'>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Users className='h-4 w-4 text-gray-400' />
                                        <span className='font-semibold'>{user.orderCount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

