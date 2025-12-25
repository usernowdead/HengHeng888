"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, RefreshCw, Search, AlertCircle, CheckCircle2, XCircle, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface Game {
    name: string
    key: string
    items: {
        name: string
        sku: string
        price: string
    }[]
    inputs: {
        key: string
        title: string
        type: string
        placeholder: string
        options?: {
            label: string
            value: string
        }[]
    }[]
}

export default function ApiGamesPage() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [lastSync, setLastSync] = useState<Date | null>(null)

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = async () => {
        try {
            setLoading(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const response = await fetch('/api/v1/topup', 
                createAuthFetchOptions({}, token)
            )

            const data = await response.json()
            if (Array.isArray(data)) {
                setGames(data)
                setLastSync(new Date())
            } else if (data.success && Array.isArray(data.games)) {
                setGames(data.games)
                setLastSync(new Date())
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูลเกมได้')
            }
        } catch (error) {
            console.error('Error fetching games:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchGames()
        setRefreshing(false)
        toast.success('อัปเดตข้อมูลเกมสำเร็จ')
    }

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatPrice = (price: string) => {
        const numPrice = parseFloat(price) || 0
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(numPrice)
    }

    const getMinPrice = (game: Game) => {
        if (!game.items || game.items.length === 0) return 0
        return Math.min(...game.items.map(item => parseFloat(item.price) || 0))
    }

    const getMaxPrice = (game: Game) => {
        if (!game.items || game.items.length === 0) return 0
        return Math.max(...game.items.map(item => parseFloat(item.price) || 0))
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
                        <Gamepad2 className='h-6 w-6' />
                        API เกม (Top-up Games)
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        จัดการเกมสำหรับเติมเงิน - เกมทั้งหมดจาก API
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
                                ข้อมูลเกมจาก Top-up API
                            </p>
                            <p className='text-xs text-blue-700'>
                                เกมทั้งหมดจะถูกดึงมาจาก Top-up API อัตโนมัติ 
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
                        <CardTitle className='text-sm font-medium text-gray-600'>เกมทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-gray-900'>{games.length}</span>
                            <span className='text-sm text-gray-500'>เกม</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>แพ็คเกจทั้งหมด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-green-600'>
                                {games.reduce((sum, game) => sum + (game.items?.length || 0), 0)}
                            </span>
                            <span className='text-sm text-gray-500'>แพ็คเกจ</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-sm font-medium text-gray-600'>เกมที่พบ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-3xl font-bold text-blue-600'>
                                {filteredGames.length}
                            </span>
                            <span className='text-sm text-gray-500'>เกม</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                    placeholder='ค้นหาเกม...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Games List */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>
                        รายการเกม ({filteredGames.length} เกม)
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    {filteredGames.length === 0 ? (
                        <div className='text-center py-12 text-gray-500'>
                            <Gamepad2 className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>ไม่พบเกม</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ชื่อเกม</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Key</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>แพ็คเกจ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ราคา</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Inputs</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {filteredGames.map((game, index) => {
                                        const minPrice = getMinPrice(game)
                                        const maxPrice = getMaxPrice(game)
                                        const packageCount = game.items?.length || 0
                                        const hasInputs = game.inputs && game.inputs.length > 0

                                        return (
                                            <tr key={game.key || index} className='hover:bg-gray-50'>
                                                <td className='px-4 py-3 text-sm font-medium text-gray-900'>{game.name}</td>
                                                <td className='px-4 py-3 text-sm text-gray-600 font-mono'>{game.key}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>
                                                    <Badge variant='outline' className='bg-blue-50 text-blue-700'>
                                                        <Package className='h-3 w-3 mr-1' />
                                                        {packageCount} แพ็คเกจ
                                                    </Badge>
                                                </td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>
                                                    {minPrice === maxPrice ? (
                                                        formatPrice(minPrice.toString())
                                                    ) : (
                                                        <span>
                                                            {formatPrice(minPrice.toString())} - {formatPrice(maxPrice.toString())}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>
                                                    {hasInputs ? (
                                                        <Badge variant='secondary' className='bg-green-100 text-green-800'>
                                                            <CheckCircle2 className='h-3 w-3 mr-1' />
                                                            {game.inputs.length} inputs
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant='secondary' className='bg-gray-100 text-gray-600'>
                                                            ไม่มี
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    {packageCount > 0 ? (
                                                        <Badge variant='default' className='bg-green-100 text-green-800'>
                                                            <CheckCircle2 className='h-3 w-3 mr-1' />
                                                            พร้อมใช้งาน
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant='secondary' className='bg-red-100 text-red-800'>
                                                            <XCircle className='h-3 w-3 mr-1' />
                                                            ไม่มีแพ็คเกจ
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

