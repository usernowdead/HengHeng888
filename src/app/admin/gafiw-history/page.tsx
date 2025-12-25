"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { History, Search, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface GafiwOrder {
    id: string
    username_buy: string
    product: string
    location?: string
    status: string
    order: string
    price: number
    createdAt: string
}

export default function GafiwHistoryPage() {
    const [orders, setOrders] = useState<GafiwOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastSync, setLastSync] = useState<Date | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบ')
                return
            }

            const params = new URLSearchParams({
                limit: '1000'
            })
            if (searchQuery) params.append('username_buy', searchQuery)

            const response = await fetch(`/api/v1/admin/gafiw-history?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (data.success) {
                setOrders(data.data?.orders || [])
                setLastSync(new Date())
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูลประวัติได้')
            }
        } catch (error) {
            console.error('Error fetching history:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchHistory()
        setRefreshing(false)
        toast.success('อัปเดตข้อมูลสำเร็จ')
    }

    const getStatusBadge = (status: string) => {
        const lowerStatus = status?.toLowerCase() || ''
        if (lowerStatus.includes('success') || lowerStatus.includes('สำเร็จ') || lowerStatus === 'success') {
            return (
                <Badge variant='default' className='bg-green-100 text-green-800'>
                    <CheckCircle2 className='h-3 w-3 mr-1' />
                    สำเร็จ
                </Badge>
            )
        }
        if (lowerStatus.includes('fail') || lowerStatus.includes('ล้มเหลว') || lowerStatus === 'fail') {
            return (
                <Badge variant='secondary' className='bg-red-100 text-red-800'>
                    <XCircle className='h-3 w-3 mr-1' />
                    ล้มเหลว
                </Badge>
            )
        }
        return (
            <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
                <Clock className='h-3 w-3 mr-1' />
                {status || 'ไม่ทราบสถานะ'}
            </Badge>
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price)
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
                        <History className='h-6 w-6' />
                        ประวัติ Gafiwshop
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        ดูประวัติการสั่งซื้อทั้งหมดจาก Gafiwshop API
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูล'}
                </Button>
            </div>

            {/* Info Card */}
            {lastSync && (
                <Card className='border-blue-200 bg-blue-50'>
                    <CardContent className='pt-6'>
                        <p className='text-sm text-blue-900'>
                            อัปเดตล่าสุด: {lastSync.toLocaleString('th-TH')} | 
                            ทั้งหมด {orders.length} รายการ
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className='flex items-center gap-4'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                        placeholder='ค้นหาด้วย username...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10'
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                fetchHistory()
                            }
                        }}
                    />
                </div>
                <Button onClick={fetchHistory} variant='outline'>
                    ค้นหา
                </Button>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>
                        รายการสั่งซื้อ ({orders.length} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    {orders.length === 0 ? (
                        <div className='text-center py-12 text-gray-500'>
                            <History className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>ไม่พบประวัติการสั่งซื้อ</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Order ID</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Username</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สินค้า</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ประเทศ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ราคา</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สถานะ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>วันที่</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {orders.map((order) => (
                                        <tr key={order.id || order.order} className='hover:bg-gray-50'>
                                            <td className='px-4 py-3 text-sm font-mono text-gray-900'>{order.order || order.id}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{order.username_buy || '-'}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{order.product || '-'}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{order.location || '-'}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{formatPrice(order.price || 0)}</td>
                                            <td className='px-4 py-3'>{getStatusBadge(order.status)}</td>
                                            <td className='px-4 py-3 text-sm text-gray-600 flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString('th-TH') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
