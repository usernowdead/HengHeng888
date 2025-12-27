import { NextResponse } from 'next/server'

// Mock categories data
const mockCategories = [
  {
    id: 'movie-cat',
    name: 'แอพดูหนัง',
    slug: 'movie',
    description: 'แอปพลิเคชันดูหนังและซีรี่ส์',
    icon_url: null,
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'top-up-cat',
    name: 'เติมเงิน',
    slug: 'top-up',
    description: 'บริการเติมเงินเกมและแอปพลิเคชัน',
    icon_url: null,
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apps-cat',
    name: 'แอปพลิเคชัน',
    slug: 'apps',
    description: 'แอปพลิเคชันต่างๆ',
    icon_url: null,
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'games-cat',
    name: 'เกมส์',
    slug: 'games',
    description: 'เกมส์พรีเมี่ยม',
    icon_url: null,
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(mockCategories)
}


