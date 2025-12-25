"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save, Globe, Image as ImageIcon, Eye, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import Image from 'next/image'

export default function WebsiteSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [previewImages, setPreviewImages] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    websiteName: 'Oho568',
    logoUrl: '',
    announcement: '',
    shopDescription: '',
    slide1: '',
    slide2: '',
    slide3: '',
    slide4: '',
    movieSectionTitle: 'แนะนำหนังน่าดู',
    movieSectionSubtitle: 'หนังใหม่ที่น่าสนใจ',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
  })

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
      if (data.success && data.data) {
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { createAuthFetchOptions } = await import('@/lib/api-helpers')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const response = await fetch('/api/v1/admin/website-settings', 
        createAuthFetchOptions({
          method: 'POST',
          body: JSON.stringify(formData)
        }, token)
      )

      const data = await response.json()
      if (data.success) {
        toast.success('บันทึกการตั้งค่าสำเร็จ')
        await fetchSettings()
        // Refresh website settings context
        window.location.reload()
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
    setPreviewImages(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const ImagePreview = ({ src, alt }: { src: string; alt: string }) => {
    if (!src) return null
    return (
      <div className='mt-2 border rounded-lg overflow-hidden bg-gray-50'>
        <img 
          src={src} 
          alt={alt}
          className='w-full h-auto max-h-48 object-contain'
          onError={(e) => {
            e.currentTarget.src = '/bannerginlystore2.png'
          }}
        />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
            <Globe className='h-6 w-6' />
            จัดการเว็บไซต์
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            ตั้งค่ารูปภาพ สี และเนื้อหาเว็บไซต์ทั้งหมด
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className='h-4 w-4 mr-2' />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className='border-blue-200 bg-blue-50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-blue-900 mb-1'>
                คำแนะนำการใช้งาน
              </p>
              <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                <li>รูปภาพทั้งหมดต้องเป็น URL ที่เข้าถึงได้ (https://)</li>
                <li>คำอธิบายร้านค้าจะแสดงที่หน้าบ้านด้านล่าง</li>
                <li>ประกาศจะแสดงที่ด้านบนของหน้าเว็บ</li>
                <li>สีจะถูกใช้ในปุ่มและลิงค์ต่างๆ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              ข้อมูลพื้นฐาน
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='websiteName'>
                ชื่อเว็บไซต์ <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-2'>แสดงที่ Navbar และ Title ของเว็บ</p>
              <Input
                id='websiteName'
                value={formData.websiteName}
                onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                placeholder='เช่น Oho568'
                required
              />
            </div>

            <div>
              <Label htmlFor='logoUrl'>
                Logo (ลิงค์รูปภาพ) <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-2'>แสดงที่ Navbar ด้านซ้ายบน</p>
              <div className='space-y-2'>
                <Input
                  id='logoUrl'
                  type='url'
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder='https://example.com/logo.png'
                  required
                />
                {formData.logoUrl && (
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => togglePreview('logo')}
                    >
                      <Eye className='h-3 w-3 mr-1' />
                      {previewImages.logo ? 'ซ่อน' : 'ดู'} ตัวอย่าง
                    </Button>
                  </div>
                )}
                {previewImages.logo && <ImagePreview src={formData.logoUrl} alt='Logo' />}
              </div>
            </div>

            <div>
              <Label htmlFor='announcement'>
                ประกาศ / โปรโมชัน <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-2'>แสดงที่ด้านบนสุดของหน้าเว็บ (แถบแจ้งเตือน)</p>
              <Textarea
                id='announcement'
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                placeholder='เช่น ประกาศโปรโมชัน หรือข้อความแจ้งเตือน...'
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor='shopDescription'>
                คำอธิบายร้านค้า <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-2'>แสดงที่หน้าบ้านด้านล่าง (ส่วน Contact Us)</p>
              <Textarea
                id='shopDescription'
                value={formData.shopDescription}
                onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                placeholder='อธิบายร้านค้าของคุณ...'
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Banner Images */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ImageIcon className='h-5 w-5' />
              รูปภาพ Banner (หน้าแรก)
            </CardTitle>
            <p className='text-sm text-gray-500 mt-1'>
              รูปภาพที่แสดงใน Carousel ด้านบนสุดของหน้าแรก (สไลด์อัตโนมัติ)
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor={`slide${num}`}>
                    Banner {num} <span className='text-red-500'>*</span>
                  </Label>
                  {formData[`slide${num}` as keyof typeof formData] && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => togglePreview(`slide${num}`)}
                    >
                      <Eye className='h-3 w-3 mr-1' />
                      {previewImages[`slide${num}`] ? 'ซ่อน' : 'ดู'} ตัวอย่าง
                    </Button>
                  )}
                </div>
                <Input
                  id={`slide${num}`}
                  type='url'
                  value={formData[`slide${num}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [`slide${num}`]: e.target.value })}
                  placeholder={`https://example.com/banner${num}.jpg`}
                  required
                />
                {previewImages[`slide${num}`] && (
                  <ImagePreview 
                    src={formData[`slide${num}` as keyof typeof formData] as string} 
                    alt={`Banner ${num}`} 
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Movie Recommendations Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ImageIcon className='h-5 w-5' />
              ส่วนหนังแนะนำ (หน้าแรก)
            </CardTitle>
            <p className='text-sm text-gray-500 mt-1'>
              ตั้งค่าหัวข้อและคำอธิบายสำหรับส่วน "แนะนำหนังน่าดู" บนหน้าแรก
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='movieSectionTitle'>
                หัวข้อส่วนหนังแนะนำ <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-1'>หัวข้อที่แสดงด้านบนของส่วนหนัง (เช่น "แนะนำหนังน่าดู")</p>
              <Input
                id='movieSectionTitle'
                value={formData.movieSectionTitle || 'แนะนำหนังน่าดู'}
                onChange={(e) => setFormData({ ...formData, movieSectionTitle: e.target.value })}
                placeholder='แนะนำหนังน่าดู'
                required
              />
            </div>

            <div>
              <Label htmlFor='movieSectionSubtitle'>
                คำอธิบายส่วนหนัง <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mb-1'>คำอธิบายสั้นๆ ด้านล่างหัวข้อ (เช่น "หนังใหม่ที่น่าสนใจ")</p>
              <Input
                id='movieSectionSubtitle'
                value={formData.movieSectionSubtitle || 'หนังใหม่ที่น่าสนใจ'}
                onChange={(e) => setFormData({ ...formData, movieSectionSubtitle: e.target.value })}
                placeholder='หนังใหม่ที่น่าสนใจ'
                required
              />
            </div>

            <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-2'>
                <Info className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-xs font-medium text-blue-900 mb-0.5'>
                    หมายเหตุ
                  </p>
                  <p className='text-[10px] text-blue-700 leading-relaxed'>
                    สำหรับจัดการรายการหนังที่แสดง ให้ไปที่หน้า <strong>"จัดการหนังแนะนำ"</strong> ในเมนูด้านซ้าย
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Colors */}
        <Card>
          <CardHeader>
            <CardTitle>สีของเว็บไซต์</CardTitle>
            <p className='text-sm text-gray-500 mt-1'>
              สีที่ใช้ในปุ่ม ลิงค์ และองค์ประกอบต่างๆ ของเว็บไซต์
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='primaryColor'>
                สีหลัก <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500'>ใช้ในปุ่มหลักและลิงค์สำคัญ</p>
              <div className='flex items-center gap-3'>
                <Input
                  id='primaryColor'
                  type='color'
                  value={formData.primaryColor || '#3b82f6'}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className='h-12 w-24 cursor-pointer'
                />
                <Input
                  type='text'
                  value={formData.primaryColor || '#3b82f6'}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder='#3b82f6'
                  className='flex-1 font-mono text-sm'
                />
                <div 
                  className='w-12 h-12 rounded border border-gray-300'
                  style={{ backgroundColor: formData.primaryColor || '#3b82f6' }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='secondaryColor'>
                สีรอง <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500'>ใช้ในปุ่มรองและองค์ประกอบเสริม</p>
              <div className='flex items-center gap-3'>
                <Input
                  id='secondaryColor'
                  type='color'
                  value={formData.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className='h-12 w-24 cursor-pointer'
                />
                <Input
                  type='text'
                  value={formData.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder='#8b5cf6'
                  className='flex-1 font-mono text-sm'
                />
                <div 
                  className='w-12 h-12 rounded border border-gray-300'
                  style={{ backgroundColor: formData.secondaryColor || '#8b5cf6' }}
                />
              </div>
            </div>

            {/* Color Preview */}
            <div className='mt-4 p-4 border rounded-lg bg-gray-50'>
              <p className='text-xs font-medium text-gray-700 mb-3'>ตัวอย่างการใช้งานสี:</p>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  className='px-4 py-2 rounded-md text-sm font-medium text-white'
                  style={{ backgroundColor: formData.primaryColor || '#3b82f6' }}
                >
                  ปุ่มหลัก
                </button>
                <button
                  type='button'
                  className='px-4 py-2 rounded-md text-sm font-medium text-white'
                  style={{ backgroundColor: formData.secondaryColor || '#8b5cf6' }}
                >
                  ปุ่มรอง
                </button>
                <a
                  href='#'
                  className='px-4 py-2 rounded-md text-sm font-medium underline'
                  style={{ color: formData.primaryColor || '#3b82f6' }}
                  onClick={(e) => e.preventDefault()}
                >
                  ลิงค์
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
