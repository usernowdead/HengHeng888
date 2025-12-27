import { NextRequest, NextResponse } from 'next/server'

// Mock products data
const mockProducts = [
  {
    id: '1',
    category_id: 'movie-cat',
    name: 'Netflix Premium',
    slug: 'netflix-premium',
    description: 'แอพดูหนังและซีรี่ส์คุณภาพสูง รองรับ 4K UHD',
    price: 299,
    image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=240&h=240&fit=crop',
    platform: 'iOS',
    version: '12.0.0',
    is_premium: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    category_id: 'movie-cat',
    name: 'Disney+ Hotstar',
    slug: 'disney-hotstar',
    description: 'ดูหนัง Disney, Marvel, Star Wars และอีกมากมาย',
    price: 199,
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=240&h=240&fit=crop',
    platform: 'Android',
    version: '2.5.1',
    is_premium: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    category_id: 'top-up-cat',
    name: 'Garena Shells',
    slug: 'garena-shells',
    description: 'เติมเงิน Garena สำหรับเกม Free Fire, ROV',
    price: 100,
    image_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=240&h=240&fit=crop',
    platform: 'Web',
    version: null,
    is_premium: false,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    category_id: 'movie-cat',
    name: 'YouTube Premium',
    slug: 'youtube-premium',
    description: 'ดู YouTube แบบไม่มีโฆษณา ฟังในพื้นหลัง',
    price: 159,
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=240&h=240&fit=crop',
    platform: 'iOS',
    version: '18.0.0',
    is_premium: true,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Category mapping
const categoryMap: Record<string, string> = {
  'movie': 'movie-cat',
  'top-up': 'top-up-cat',
  'apps': 'apps-cat',
  'games': 'games-cat',
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')

  let filteredProducts = mockProducts

  if (category && categoryMap[category]) {
    filteredProducts = mockProducts.filter(
      (p) => p.category_id === categoryMap[category]
    )
  }

  return NextResponse.json(filteredProducts)
}


