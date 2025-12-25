"use client"

import React, { useState, useEffect } from 'react'
import { ShoppingCart, Clock, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface Order {
    id: string
    userId: string
    productId: string
    type: 'premium' | 'topup_game' | 'social'
    state: 'pending' | 'completed' | 'failed' | 'processing'
    price: number
    transactionId?: string
    data?: string
    productMetadata?: any
    createdAt: string
    updatedAt: string
    user?: {
        id: string
        username: string
        email: string
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [totalRows, setTotalRows] = useState(0)

    useEffect(() => {
        fetchOrders()
    }, [currentPage, rowsPerPage, searchTerm])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: rowsPerPage.toString(),
            })
            if (searchTerm) params.append('search', searchTerm)

            const response = await fetch(`/api/v1/admin/orders?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (data.success) {
                setOrders(data.orders || [])
                setTotalRows(data.total || 0)
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูลได้')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const getReceivedItem = (order: Order): string => {
        if (order.data) {
            try {
                const parsed = JSON.parse(order.data)
                return parsed.order?.input?.uid || parsed.order?.data || 'N/A'
            } catch {
                return order.data
            }
        }
        if (order.productMetadata?.input?.uid) {
            return order.productMetadata.input.uid
        }
        return 'N/A'
    }

    const getProductName = (order: Order): string => {
        if (order.productMetadata?.productName) {
            return order.productMetadata.productName
        }
        if (order.productMetadata?.itemName) {
            return order.productMetadata.itemName
        }
        return order.productId
    }

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'completed':
                return 'สำเร็จ'
            case 'pending':
                return 'รอดำเนินการ'
            case 'processing':
                return 'กำลังดำเนินการ'
            case 'failed':
                return 'ล้มเหลว'
            default:
                return state
        }
    }

    const totalPages = Math.ceil(totalRows / rowsPerPage)
    const startRow = (currentPage - 1) * rowsPerPage + 1
    const endRow = Math.min(currentPage * rowsPerPage, totalRows)

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
                        <ShoppingCart className='h-6 w-6' />
                        ประวัติการสั่งซื้อ
                    </h2>
                </div>
                <Button variant='outline'>
                    ข้อมูลคำสั่งซื้อทั้งหมด
                </Button>
            </div>

            {/* Search and Filter */}
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-700'>แสดง</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                        }}
                        className='border border-gray-300 rounded-md px-2 py-1 text-sm'
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className='text-sm text-gray-700'>แถว</span>
                </div>
                <div className='flex-1 flex items-center gap-2'>
                    <span className='text-sm text-gray-700'>ค้นหา:</span>
                    <Input
                        type='text'
                        placeholder='ค้นหาด้วย username, email, order ID...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                        }}
                        className='max-w-md'
                    />
                </div>
            </div>

            {/* Orders Table */}
            <Card>
                <CardContent className='p-0'>
                    {loading ? (
                        <div className='flex items-center justify-center py-12'>
                            <Spinner />
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100'>
                                            ID
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100'>
                                            ชื่อผู้ใช้
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100'>
                                            ของที่ได้รับ
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100'>
                                            ชื่อสินค้า
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100'>
                                            วันที่
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className='px-4 py-8 text-center text-gray-500'>
                                                ไม่พบข้อมูล
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className='hover:bg-gray-50'>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{order.id}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>
                                                    <a 
                                                        href={`/admin/users?search=${order.user?.username || ''}`} 
                                                        className='text-blue-600 hover:underline'
                                                    >
                                                        {order.user?.username || 'Unknown'}
                                                    </a>
                                                </td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{getReceivedItem(order)}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{getProductName(order)}</td>
                                                <td className='px-4 py-3 text-sm text-gray-600 flex items-center gap-1'>
                                                    <Clock className='h-3 w-3' />
                                                    {new Date(order.createdAt).toLocaleString('th-TH', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && totalRows > 0 && (
                <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-700'>
                        แสดง {startRow} ถึง {endRow} จาก {totalRows} แถว
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ก่อนหน้า
                        </Button>
                        <span className='text-sm text-gray-700'>
                            หน้า {currentPage}/{totalPages}
                        </span>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            ถัดไป
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

