"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Box, RefreshCw, Search, AlertCircle, CheckCircle2, XCircle, Globe2 } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'

interface OtpLocation {
    name: string
    stock: number
    price: number
    priceVip: number
    img?: string
    locationImg?: string
}

interface OtpProduct {
    id: string
    name: string
    locations: OtpLocation[]
    img?: string
}

export default function ApiOtpPage() {
    const [products, setProducts] = useState<OtpProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastSync, setLastSync] = useState<Date | null>(null)
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const response = await fetch('/api/v1/otp/products', 
                createAuthFetchOptions({}, token)
            )

            const data = await response.json()
            if (data.success) {
                setProducts(data.products || [])
                setLastSync(new Date())
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูล OTP ได้')
            }
        } catch (error) {
            console.error('Error fetching OTP products:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchProducts()
        setRefreshing(false)
        toast.success('อัปเดตข้อมูล OTP สำเร็จ')
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.locations.some(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price)
    }

    const totalLocations = products.reduce((sum, p) => sum + p.locations.length, 0)
    const totalStock = products.reduce((sum, p) => 
        sum + p.locations.reduce((locSum, loc) => locSum + loc.stock, 0), 0
    )

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
                        <Box className='h-6 w-6' />
                        API OTP (Gafiwshop)
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        จัดการสินค้า OTP จาก Gafiwshop API
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
                                ข้อมูล OTP จาก Gafiwshop API
                            </p>
                            <p className='text-xs text-blue-700'>
                                สินค้า OTP ทั้งหมดจะถูกดึงมาจาก Gafiwshop API อัตโนมัติ 
                                {lastSync && ` อัปเดตล่าสุด: ${lastSync.toLocaleString('th-TH')}`}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>โปรดักต์ทั้งหมด</CardTitle>
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
                        <CardTitle className='text-sm font-medium text-gray-600'>ประเทศทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>{totalLocations}</span>
                            <span className='text-sm text-gray-500'>ประเทศ</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>สต็อกรวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-green-600'>{totalStock.toLocaleString()}</span>
                            <span className='text-sm text-gray-500'>เบอร์</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>พร้อมจำหน่าย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-green-600'>
                                {products.filter(p => p.locations.some(loc => loc.stock > 0)).length}
                            </span>
                            <span className='text-sm text-gray-500'>โปรดักต์</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                    placeholder='ค้นหาโปรดักต์หรือประเทศ...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Products List */}
            <div className='space-y-4'>
                {filteredProducts.length === 0 ? (
                    <Card>
                        <CardContent className='text-center py-12 text-gray-500'>
                            <Box className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>ไม่พบสินค้า OTP</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredProducts.map((product) => (
                        <Card key={product.id} className='overflow-hidden'>
                            <CardHeader 
                                className='cursor-pointer hover:bg-gray-50 transition-colors'
                                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        {product.img && (
                                            <Image
                                                src={product.img}
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className='w-10 h-10 object-contain rounded'
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        )}
                                        <div>
                                            <CardTitle className='text-base font-semibold'>{product.name}</CardTitle>
                                            <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                                                <Globe2 className='h-3 w-3' />
                                                {product.locations.length} ประเทศ
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={product.locations.some(loc => loc.stock > 0) ? 'default' : 'secondary'}>
                                        {product.locations.some(loc => loc.stock > 0) ? 'พร้อมจำหน่าย' : 'หมด'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            {expandedProduct === product.id && (
                                <CardContent className='pt-0'>
                                    <div className='border-t pt-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                                            {product.locations.map((location, idx) => (
                                                <div
                                                    key={idx}
                                                    className='p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                                                >
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <span className='text-sm font-medium'>{location.name}</span>
                                                        {location.stock > 0 ? (
                                                            <Badge variant='default' className='bg-green-100 text-green-800 text-xs'>
                                                                <CheckCircle2 className='h-3 w-3 mr-1' />
                                                                {location.stock}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant='secondary' className='bg-red-100 text-red-800 text-xs'>
                                                                <XCircle className='h-3 w-3 mr-1' />
                                                                หมด
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className='text-xs text-gray-600 space-y-1'>
                                                        <div>
                                                            <span className='font-medium'>ราคา:</span>{' '}
                                                            {formatPrice(location.priceVip > 0 ? location.priceVip : location.price)}
                                                        </div>
                                                        {location.priceVip > 0 && location.priceVip !== location.price && (
                                                            <div>
                                                                <span className='font-medium'>ราคา VIP:</span>{' '}
                                                                {formatPrice(location.priceVip)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

