"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Search } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Label } from '../ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SocialService, SocialServiceGrid, SocialServiceDialog } from '../social'
import { toast } from 'sonner'

interface ApiResponse {
    success: boolean;
    services: SocialService[];
    count: number;
}


export default function ServicePupSocial() {
    const [services, setServices] = useState<SocialService[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedService, setSelectedService] = useState<SocialService | null>(null)
    const [showDialog, setShowDialog] = useState(false)

    useEffect(() => {
        fetchSocialServices()
    }, [])

    const fetchSocialServices = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/v1/social/recommend')
            
            if (!response.ok) {
                // Handle 401 Unauthorized (API Key issue)
                if (response.status === 401) {
                    console.warn('⚠️ [ServicePupSocial] API Key ไม่ถูกต้องหรือหมดอายุ (401 Unauthorized)')
                    setServices([])
                    setLoading(false)
                    return
                }
                
                // If server error, return empty array instead of throwing
                if (response.status >= 500) {
                    console.warn('⚠️ [ServicePupSocial] Server error, returning empty services')
                    setServices([])
                    setLoading(false)
                    return
                }
                
                // For other errors, just log and return empty
                console.warn('⚠️ [ServicePupSocial] HTTP error! status:', response.status)
                setServices([])
                setLoading(false)
                return
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [ServicePupSocial] Response is not JSON:', text.substring(0, 200));
                setServices([]);
                setLoading(false);
                return;
            }
            
            const data = await response.json()

            if (Array.isArray(data)) {
                console.log('✅ [ServicePupSocial] Loaded', data.length, 'services')
                setServices(data)
            } else if (data && data.error) {
                console.warn('⚠️ [ServicePupSocial] API error:', data.error)
                setServices([])
            } else {
                console.warn('⚠️ [ServicePupSocial] Invalid response format:', data)
                setServices([])
            }
        } catch (error) {
            console.warn('⚠️ [ServicePupSocial] Error fetching services:', error)
            setServices([])
        } finally {
            setLoading(false)
        }
    }

    // Get unique categories
    const categories = Array.from(new Set(services.map(service => service.category)))

    // Filter services based on search and category
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getCategoryIcon = (category: string) => {
        const categoryLower = category.toLowerCase()
        if (categoryLower.includes('instagram')) return '/icons/instagram.png'
        if (categoryLower.includes('facebook')) return '/icons/facebook.png'
        if (categoryLower.includes('tiktok')) return '/icons/tiktok.png'
        if (categoryLower.includes('twitter')) return '/icons/twitter.png'
        if (categoryLower.includes('youtube')) return '/icons/youtube.png'
        if (categoryLower.includes('linkedin')) return '/icons/LinkedIn.png'
        if (categoryLower.includes('telegram')) return '/icons/telegram.png'
        return '/icons/shopee.png' // default icon
    }

    const handleServiceClick = (service: SocialService) => {
        setSelectedService(service)
        setShowDialog(true)
    }
    return (
        <>
            <section>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <h3 className='text-base font-medium'>
                            บริการปั้มโซเชียลมิเดีย
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                            บริการปั้มโซเชียลมิเดีย
                        </p>
                    </div>
                <div className='px-3 py-3'>
                    <div className='flex items-end space-x-2'>
                        <div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="เลือก โซเชียลมิเดีย" />
                                </SelectTrigger>
                                <SelectContent className='max-h-[250px] overflow-y-auto'>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            <div className="flex items-center gap-2">
                                                <img 
                                                    src={getCategoryIcon(category)} 
                                                    className='w-4 h-4 select-none' 
                                                    alt={category}
                                                    draggable={false}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        return false;
                                                    }}
                                                    onDragStart={(e) => {
                                                        e.preventDefault();
                                                        return false;
                                                    }}
                                                />
                                                {category}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Input
                                type='text'
                                placeholder='ค้นหาบริการ'
                                className='w-full'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant='secondary' disabled={loading}>
                            <Search />
                        </Button>
                    </div>
                </div>
                <Separator />
                <SocialServiceGrid
                    services={filteredServices}
                    loading={loading}
                    onServiceClick={handleServiceClick}
                    showViewAllButton={true}
                    viewAllHref='/social'
                    viewAllText='ดูทั้งหมด'
                />

                </div>
            </section>

            <SocialServiceDialog
                service={selectedService}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </>
    )
}