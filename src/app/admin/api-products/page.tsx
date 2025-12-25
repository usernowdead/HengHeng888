"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, RefreshCw, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface PremiumProduct {
    id: number
    name: string
    description: string | null
    price: number
    stock: number
}

export default function ApiProductsPage() {
    const [products, setProducts] = useState<PremiumProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastSync, setLastSync] = useState<Date | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const response = await fetch('/api/v1/premium', 
                createAuthFetchOptions({}, token)
            )

            const data = await response.json()
            if (data.success) {
                setProducts(data.services || [])
                setLastSync(new Date())
            } else {
                console.error('Failed to load products:', data.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้')
                // Only show error in admin page if it's a critical error
                if (data.message && !data.message.includes('API')) {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            // Silently fail - don't show error toast to avoid spam
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchProducts()
        setRefreshing(false)
        toast.success('อัปเดตข้อมูลสินค้าสำเร็จ')
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                        <Package className='h-6 w-6' />
                        API สินค้า (Gafiwshop)
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        จัดการสินค้าจาก Gafiwshop API - แอพพรีเมี่ยมทั้งหมด
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูล'}
                </Button>
            </div>

            {/* Info Card */}
            <Card className='border-blue-200 bg-blue-50'>
                <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                        <AlertCircle className='h-5 w-5 text-blue-600 mt-0.5' />
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-blue-900 mb-1'>
                                ข้อมูลสินค้าจาก Gafiwshop API
                            </p>
                            <p className='text-xs text-blue-700'>
                                สินค้าทั้งหมดจะถูกดึงมาจาก Gafiwshop API อัตโนมัติ 
                                {lastSync && ` อัปเดตล่าสุด: ${lastSync.toLocaleString('th-TH')}`}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>สินค้าทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>{products.length}</span>
                            <span className='text-sm text-gray-500'>รายการ</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>สินค้าพร้อมจำหน่าย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-green-600'>
                                {products.filter(p => p.stock > 0).length}
                            </span>
                            <span className='text-sm text-gray-500'>รายการ</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>สินค้าหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-red-600'>
                                {products.filter(p => p.stock === 0).length}
                            </span>
                            <span className='text-sm text-gray-500'>รายการ</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                    placeholder='ค้นหาสินค้า...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Products List */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>
                        รายการสินค้า ({filteredProducts.length} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    {filteredProducts.length === 0 ? (
                        <div className='text-center py-12 text-gray-500'>
                            <Package className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>ไม่พบสินค้า</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ID</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ชื่อสินค้า</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>คำอธิบาย</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ราคา</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สต็อก</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className='hover:bg-gray-50'>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{product.id}</td>
                                            <td className='px-4 py-3 text-sm font-medium text-gray-900'>{product.name}</td>
                                            <td className='px-4 py-3 text-sm text-gray-600 max-w-md truncate'>
                                                {product.description || '-'}
                                            </td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{formatPrice(product.price)}</td>
                                            <td className='px-4 py-3 text-sm text-gray-900'>{product.stock}</td>
                                            <td className='px-4 py-3'>
                                                {product.stock > 0 ? (
                                                    <Badge variant='default' className='bg-green-100 text-green-800'>
                                                        <CheckCircle2 className='h-3 w-3 mr-1' />
                                                        พร้อมจำหน่าย
                                                    </Badge>
                                                ) : (
                                                    <Badge variant='secondary' className='bg-red-100 text-red-800'>
                                                        <XCircle className='h-3 w-3 mr-1' />
                                                        หมด
                                                    </Badge>
                                                )}
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

