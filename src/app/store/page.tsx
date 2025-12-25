"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ShopServicesData {
  sectionTitle: string
  sectionSubtitle: string
  socialImage: string
  premiumImage: string
  topupImage: string
}

export default function page() {
  const [servicesData, setServicesData] = useState<ShopServicesData>({
    sectionTitle: 'บริการร้านค้าของเรา',
    sectionSubtitle: 'บริการร้านค้าของเราทั้งหมด',
    socialImage: '',
    premiumImage: '',
    topupImage: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServicesData()
  }, [])

  const fetchServicesData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/website-settings')
      const data = await response.json()
      
      if (data.success && data.data) {
        const settings = data.data as Record<string, any>
        setServicesData({
          sectionTitle: settings['shop_services_title'] || 'บริการร้านค้าของเรา',
          sectionSubtitle: settings['shop_services_subtitle'] || 'บริการร้านค้าของเราทั้งหมด',
          socialImage: settings['shop_services_social_image'] || '',
          premiumImage: settings['shop_services_premium_image'] || '',
          topupImage: settings['shop_services_topup_image'] || '',
        })
      }
    } catch (error) {
      console.error('Error fetching services data:', error)
    } finally {
      setLoading(false)
    }
  }

  const serviceCategories = [
    {
      key: 'social',
      href: '/social',
      name: 'บริการปั้มโซเชียลมีเดีย',
      nameEn: 'Social Media',
      image: servicesData.socialImage,
    },
    {
      key: 'premium',
      href: '/premium',
      name: 'บริการแอพพรีเมี่ยม',
      nameEn: 'Premium App',
      image: servicesData.premiumImage,
    },
    {
      key: 'topup',
      href: '/topupgame',
      name: 'บริการเติมเงินเกม',
      nameEn: 'Topup Game',
      image: servicesData.topupImage,
    },
  ]

  if (loading) {
    return (
      <main className='min-h-screen'>
        <section>
          <div className='w-full min-h-screen p-3 flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
              <p className='mt-2 text-sm text-gray-500'>กำลังโหลด...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className='min-h-screen'>
      <section>
        <div className='w-full min-h-screen p-3'>
          <div>
            <h1 className="text-lg font-medium">{servicesData.sectionTitle}</h1>
            <p className="text-muted-foreground text-xs">
              {servicesData.sectionSubtitle}
            </p>
          </div>
          <div className='mt-5 grid grid-cols-1 gap-3'>
            {serviceCategories.map((category) => (
              <Link key={category.key} href={category.href}>
                <div className='w-full border flex justify-center items-center select-none cursor-pointer p-4 rounded-md hover:bg-zinc-50 h-28 relative overflow-hidden'>
                  {category.image && (
                    <div className='absolute inset-0 opacity-10'>
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className='object-cover'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className='text-center relative z-10'>
                    {category.image && (
                      <div className='mb-2 flex justify-center'>
                        <div className='relative w-12 h-12 rounded overflow-hidden'>
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className='object-contain'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <h3 className='font-medium text-base'>
                      {category.name}
                    </h3>
                    <p className='text-muted-foreground text-xs mt-1'>
                      {category.nameEn}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
