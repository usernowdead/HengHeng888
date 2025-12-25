"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Search, Package, Gamepad2, Users, ChevronRight } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner';

interface PremiumService {
    name: string;
    id: number;
    description: string | null;
    price: number;
    stock: number;
}

interface TopupGame {
    name: string;
    key: string;
    items: {
        name: string;
        sku: string;
        price: string;
    }[];
    inputs: {
        key: string;
        title: string;
        type: string;
        placeholder: string;
        options?: {
            label: string;
            value: string;
        }[];
    }[];
}

interface SocialService {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
}

interface SearchResults {
    premium: PremiumService[];
    topup: TopupGame[];
    social: SocialService[];
}

export default function SearchNav() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResults>({
        premium: [],
        topup: [],
        social: []
    })
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults({ premium: [], topup: [], social: [] })
            setHasSearched(false)
            return
        }

        setLoading(true)
        setHasSearched(true)

        try {
            const [premiumRes, topupRes, socialRes] = await Promise.all([
                fetch('/api/v1/premium').then(r => r.json()),
                fetch('/api/v1/topup').then(r => r.json()),
                fetch('/api/v1/social').then(r => r.json())
            ])

            const premiumData = premiumRes?.services || []
            const topupData = Array.isArray(topupRes) ? topupRes : []
            const socialData = Array.isArray(socialRes?.services) ? socialRes.services : []

            const queryLower = query.toLowerCase()

            const filteredPremium = premiumData.filter((service: PremiumService) =>
                service.name.toLowerCase().includes(queryLower) ||
                (service.description && service.description.toLowerCase().includes(queryLower))
            ).slice(0, 3)

            const filteredTopup = topupData.filter((game: TopupGame) =>
                game.name.toLowerCase().includes(queryLower)
            ).slice(0, 3)

            const filteredSocial = socialData.filter((service: SocialService) => {
                const nameMatch = service.name.toLowerCase().includes(queryLower)
                const categoryMatch = service.category.toLowerCase().includes(queryLower)

                console.log(`Service ${service.service}:`, {
                    name: service.name,
                    category: service.category,
                    nameMatch,
                    categoryMatch,
                    matches: nameMatch || categoryMatch
                })

                return nameMatch || categoryMatch
            }).slice(0, 3)

            console.log('Filtered Social Results:', filteredSocial)

            setSearchResults({
                premium: filteredPremium,
                topup: filteredTopup,
                social: filteredSocial
            })

        } catch (error) {
            console.error('Search error:', error)
            toast.error('เกิดข้อผิดพลาดในการค้นหา')
            setSearchResults({ premium: [], topup: [], social: [] })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleSearch(searchQuery)
        }, 300)

        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(numPrice || 0)
    }

    const renderPremiumResults = () => (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium flex items-center gap-2'>
                    <Package className="w-4 h-4" />
                    แอพพรีเมี่ยม
                </p>
                {searchResults.premium.length > 0 && (
                    <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                        <Link href="/premium">
                            ดูทั้งหมด <ChevronRight className="w-3 h-3" />
                        </Link>
                    </Button>
                )}
            </div>
            {searchResults.premium.length > 0 ? (
                <div className='space-y-2'>
                    {searchResults.premium.map((service) => (
                        <div key={service.id} className='border p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'>
                            <div className="flex items-start gap-3">
                                <img
                                    src="/image-product-app-p.png"
                                    className='w-12 h-12 rounded-md border shrink-0'
                                    alt={service.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-1">
                                        {service.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className='text-xs'>
                                            ฿ {service.price.toFixed(2)}
                                        </Badge>
                                        {service.stock > 0 && (
                                            <Badge variant="outline" className='text-xs'>
                                                สต็อก: {service.stock}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : hasSearched && !loading ? (
                <p className="text-sm text-muted-foreground">ไม่พบแอพพรีเมี่ยมที่ตรงกับ "{searchQuery}"</p>
            ) : null}
        </div>
    )

    const renderTopupResults = () => (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium flex items-center gap-2'>
                    <Gamepad2 className="w-4 h-4" />
                    เติมเกม
                </p>
                {searchResults.topup.length > 0 && (
                    <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                        <Link href="/topupgame">
                            ดูทั้งหมด <ChevronRight className="w-3 h-3" />
                        </Link>
                    </Button>
                )}
            </div>
            {searchResults.topup.length > 0 ? (
                <div className='space-y-2'>
                    {searchResults.topup.map((game) => {
                        const minPrice = Math.min(...game.items.map(item => parseFloat(item.price) || 0))
                        const maxPrice = Math.max(...game.items.map(item => parseFloat(item.price) || 0))

                        return (
                            <div key={game.key} className='border p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'>
                                <div className="flex items-start gap-3">
                                    <img
                                        src="/image-product-g.png"
                                        className='w-12 h-12 rounded-md border shrink-0'
                                        alt={game.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-1">
                                            {game.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className='text-xs'>
                                                {game.items.length} แพ็คเกจ
                                            </Badge>
                                            <Badge variant="secondary" className='text-xs'>
                                                ฿ {minPrice.toFixed(2)} {minPrice !== maxPrice ? `- ฿ ${maxPrice.toFixed(2)}` : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : hasSearched && !loading ? (
                <p className="text-sm text-muted-foreground">ไม่พบเกมที่ตรงกับ "{searchQuery}"</p>
            ) : null}
        </div>
    )

    const renderSocialResults = () => (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-medium flex items-center gap-2'>
                    <Users className="w-4 h-4" />
                    ปั้มโซเชียลมิเดีย
                </p>
                {searchResults.social.length > 0 && (
                    <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                        <Link href="/social">
                            ดูทั้งหมด <ChevronRight className="w-3 h-3" />
                        </Link>
                    </Button>
                )}
            </div>
            {searchResults.social.length > 0 ? (
                <div className='space-y-2'>
                    {searchResults.social.map((service) => (
                        <div key={service.service} className='border p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'>
                            <div className="flex items-start gap-3">
                                <img
                                    src="/image-product-s.png"
                                    className='w-12 h-12 rounded-md border shrink-0'
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-1">
                                        {service.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className='text-xs w-40 text-start line-clamp-1'>
                                            {service.category}
                                        </Badge>
                                        <Badge variant="secondary" className='text-xs'>
                                            ฿ {parseFloat(service.rate).toFixed(2)} / 1,000
                                        </Badge>
                                        {service.refill && (
                                            <Badge variant="outline" className='text-xs'>
                                                Refill
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Min: {service.min} - Max: {service.max}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : hasSearched && !loading ? (
                <p className="text-sm text-muted-foreground">ไม่พบบริการปั้มโซเชียลที่ตรงกับ "{searchQuery}"</p>
            ) : null}
        </div>
    )

    const totalResults = searchResults.premium.length + searchResults.topup.length + searchResults.social.length

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'} size="sm" className='cursor-pointer h-8 w-8 sm:h-9 sm:w-9 p-0 min-w-8 sm:min-w-9 border-0 shadow-none bg-transparent hover:bg-gray-100/50 focus-visible:ring-0 focus-visible:border-0'>
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogTitle className="sr-only">ค้นหาสินค้าและบริการ</DialogTitle>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>ค้นหาสินค้าและบริการ</Label>
                        <Input
                            type='text'
                            placeholder='ค้นหาแอพพรีเมี่ยม, เติมเกม, ปั้มโซเชียล...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {loading && (
                        <div className="text-center py-4 flex justify-center">
                            <Spinner />
                        </div>
                    )}

                    {hasSearched && !loading && totalResults === 0 && searchQuery.trim() && (
                        <div className="text-center py-8">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">ไม่พบผลการค้นหาสำหรับ "{searchQuery}"</p>
                            <p className="text-sm text-muted-foreground mt-1">ลองใช้คำค้นหาอื่น</p>
                        </div>
                    )}

                    {totalResults > 0 && (
                        <div className="space-y-6">
                            {renderPremiumResults()}
                            <Separator />
                            {renderTopupResults()}
                            <Separator />
                            {renderSocialResults()}
                        </div>
                    )}

                    {!hasSearched && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">พิมพ์เพื่อเริ่มค้นหาสินค้าและบริการ</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}