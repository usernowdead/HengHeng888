"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save, Image as ImageIcon, Eye, AlertCircle, Info, Store } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import Image from 'next/image'

interface ServiceCategory {
  key: string
  name: string
  nameEn: string
  imageUrl: string
}

export default function ShopServicesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [previewImages, setPreviewImages] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    sectionTitle: 'บริการร้านค้าของเรา',
    sectionSubtitle: 'บริการร้านค้าของเราทั้งหมด',
    socialImage: '',
    premiumImage: '',
    topupImage: '',
  })

  const categories: ServiceCategory[] = [
    {
      key: 'social',
      name: 'บริการปั้มโซเชียลมีเดีย',
      nameEn: 'Social Media',
    },
    {
      key: 'premium',
      name: 'บริการแอพพรีเมี่ยม',
      nameEn: 'Premium App',
    },
    {
      key: 'topup',
      name: 'บริการเติมเงินเกม',
      nameEn: 'Topup Game',
    },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoadingData(true)
      const { createAuthFetchOptions } = await import('@/lib/api-helpers')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const response = await fetch('/api/v1/admin/website-settings', 
        createAuthFetchOptions({}, token)
      )

      const data = await response.json()
      if (data.success) {
        const settings = data.settings || data.data || {}
        setFormData({
          sectionTitle: settings['shop_services_title'] || 'บริการร้านค้าของเรา',
          sectionSubtitle: settings['shop_services_subtitle'] || 'บริการร้านค้าของเราทั้งหมด',
          socialImage: settings['shop_services_social_image'] || '',
          premiumImage: settings['shop_services_premium_image'] || '',
          topupImage: settings['shop_services_topup_image'] || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { createAuthFetchOptions } = await import('@/lib/api-helpers')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const settingsToUpdate = {
        shop_services_title: formData.sectionTitle,
        shop_services_subtitle: formData.sectionSubtitle,
        shop_services_social_image: formData.socialImage,
        shop_services_premium_image: formData.premiumImage,
        shop_services_topup_image: formData.topupImage,
      }

      const response = await fetch('/api/v1/admin/website-settings', 
        createAuthFetchOptions({
          method: 'POST',
          body: JSON.stringify(settingsToUpdate)
        }, token)
      )

      const data = await response.json()
      if (data.success) {
        toast.success('บันทึกการตั้งค่าสำเร็จ')
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setLoading(false)
    }
  }

  const togglePreview = (key: string) => {
    setPreviewImages(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getImageUrl = (key: string) => {
    switch (key) {
      case 'social':
        return formData.socialImage
      case 'premium':
        return formData.premiumImage
      case 'topup':
        return formData.topupImage
      default:
        return ''
    }
  }

  const setImageUrl = (key: string, url: string) => {
    switch (key) {
      case 'social':
        setFormData(prev => ({ ...prev, socialImage: url }))
        break
      case 'premium':
        setFormData(prev => ({ ...prev, premiumImage: url }))
        break
      case 'topup':
        setFormData(prev => ({ ...prev, topupImage: url }))
        break
    }
  }

  if (loadingData) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-2 text-sm text-gray-500'>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
          <Store className='h-6 w-6' />
          จัดการบริการร้านค้า
        </h2>
        <p className='text-sm text-gray-500 mt-1'>
          ตั้งค่าหัวข้อและภาพสำหรับบริการร้านค้าแต่ละหมวด
        </p>
      </div>

      {/* Info Card */}
      <Card className='border-blue-200 bg-blue-50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-blue-900 mb-1'>
                คำแนะนำ
              </p>
              <p className='text-xs text-blue-700'>
                คุณสามารถตั้งค่าหัวข้อและภาพสำหรับแต่ละหมวดบริการได้ ภาพจะแสดงบนหน้า /store
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Title & Subtitle */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            หัวข้อส่วนบริการร้านค้า
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='sectionTitle'>หัวข้อหลัก</Label>
            <Input
              id='sectionTitle'
              value={formData.sectionTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder='บริการร้านค้าของเรา'
              className='mt-1'
            />
          </div>
          <div>
            <Label htmlFor='sectionSubtitle'>คำอธิบาย</Label>
            <Input
              id='sectionSubtitle'
              value={formData.sectionSubtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              placeholder='บริการร้านค้าของเราทั้งหมด'
              className='mt-1'
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Categories */}
      <div className='space-y-4'>
        {categories.map((category) => {
          const imageUrl = getImageUrl(category.key)
          const showPreview = previewImages[category.key]

          return (
            <Card key={category.key}>
              <CardHeader>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <ImageIcon className='h-4 w-4' />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor={`${category.key}Image`}>
                    URL ภาพสำหรับ {category.name}
                  </Label>
                  <div className='flex gap-2 mt-1'>
                    <Input
                      id={`${category.key}Image`}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(category.key, e.target.value)}
                      placeholder='https://example.com/image.jpg'
                      className='flex-1'
                    />
                    {imageUrl && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => togglePreview(category.key)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                  {showPreview && imageUrl && (
                    <div className='mt-3 p-3 border rounded-lg bg-gray-50'>
                      <p className='text-xs text-gray-500 mb-2'>ตัวอย่างภาพ:</p>
                      <div className='relative w-full h-48 rounded overflow-hidden border'>
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className='object-contain'
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className='text-xs text-gray-500'>
                  <p>• ชื่อไทย: {category.name}</p>
                  <p>• ชื่ออังกฤษ: {category.nameEn}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      <div className='flex justify-end gap-3'>
        <Button
          onClick={handleSave}
          disabled={loading}
          className='min-w-[120px]'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' />
              บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

