import { NextResponse } from 'next/server'

// Mock banners data
const mockBanners = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=480&h=192&fit=crop',
    title: 'โปรโมชั่นพิเศษ',
    description: 'ส่วนลดสูงสุด 50% สำหรับแอปพรีเมี่ยม',
    link_url: '#',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=480&h=192&fit=crop',
    title: 'แอพดูหนังใหม่',
    description: 'ดูหนังล่าสุดก่อนใคร พร้อมเสียงพากย์ไทย',
    link_url: '#',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(mockBanners)
}


