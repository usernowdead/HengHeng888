"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Search, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface OtpOrder {
    orderId: string
    product: string
    location: string
    status: string
    sms?: string
    createdAt: string
}

export default function OtpOrderHistoryPage() {
    const [orders, setOrders] = useState<OtpOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [checkingOrder, setCheckingOrder] = useState<string | null>(null)

    useEffect(() => {
        // TODO: Fetch from database when API is ready
        // For now, load from localStorage
        const savedOrders = localStorage.getItem('otp_orders')
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders))
            } catch (e) {
                console.error('Error parsing saved orders:', e)
            }
        }
        setLoading(false)
    }, [])

    const handleCheckStatus = async (orderId: string) => {
        try {
            setCheckingOrder(orderId)
            const token = localStorage.getItem('auth_token')
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบ')
                return
            }

            const response = await fetch('/api/v1/otp/status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order: orderId })
            })

            const data = await response.json()
            if (data.success) {
                // Update order status
                const updatedOrders = orders.map(order =>
                    order.orderId === orderId
                        ? { ...order, status: data.statusSms || order.status, sms: data.sms || order.sms }
                        : order
                )
                setOrders(updatedOrders)
                localStorage.setItem('otp_orders', JSON.stringify(updatedOrders))
                toast.success('อัปเดตสถานะสำเร็จ')
            } else {
                toast.error(data.message || 'ไม่สามารถตรวจสอบสถานะได้')
            }
        } catch (error) {
            console.error('Error checking status:', error)
            toast.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะ')
        } finally {
            setCheckingOrder(null)
        }
    }

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        const lowerStatus = status?.toLowerCase() || ''
        if (lowerStatus.includes('success') || lowerStatus.includes('สำเร็จ')) {
            return <Badge variant='default' className='bg-green-100 text-green-800'>สำเร็จ</Badge>
        }
        if (lowerStatus.includes('pending') || lowerStatus.includes('รอ')) {
            return <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>รอดำเนินการ</Badge>
        }
        if (lowerStatus.includes('fail') || lowerStatus.includes('ล้มเหลว')) {
            return <Badge variant='secondary' className='bg-red-100 text-red-800'>ล้มเหลว</Badge>
        }
        return <Badge variant='secondary'>{status || 'ไม่ทราบสถานะ'}</Badge>
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
                        <MessageSquare className='h-6 w-6' />
                        ประวัติสั่งซื้อ OTP
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        ดูประวัติการสั่งซื้อ OTP และตรวจสอบสถานะ
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                    placeholder='ค้นหาเลขออเดอร์, สินค้า, หรือประเทศ...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>
                        รายการสั่งซื้อ OTP ({filteredOrders.length} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    {filteredOrders.length === 0 ? (
                        <div className='text-center py-12 text-gray-500'>
                            <MessageSquare className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>ไม่พบประวัติการสั่งซื้อ OTP</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>เลขออเดอร์</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สินค้า</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ประเทศ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สถานะ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>OTP</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>วันที่</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.orderId} className='hover:bg-gray-50'>
                                            <td className='px-4 py-3 text-sm font-mono text-gray-900'>{order.orderId}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{order.product}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{order.location}</td>
                                            <td className='px-4 py-3'>{getStatusBadge(order.status)}</td>
                                            <td className='px-4 py-3 text-sm font-mono text-gray-600 max-w-xs truncate'>
                                                {order.sms || '-'}
                                            </td>
                                            <td className='px-4 py-3 text-sm text-gray-600 flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString('th-TH') : '-'}
                                            </td>
                                            <td className='px-4 py-3'>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => handleCheckStatus(order.orderId)}
                                                    disabled={checkingOrder === order.orderId}
                                                >
                                                    {checkingOrder === order.orderId ? (
                                                        <>
                                                            <RefreshCw className='h-3 w-3 mr-1 animate-spin' />
                                                            กำลังตรวจสอบ...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RefreshCw className='h-3 w-3 mr-1' />
                                                            ตรวจสอบสถานะ
                                                        </>
                                                    )}
                                                </Button>
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

