import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (in production, use database)
let banners: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newBanner = {
      id: Date.now().toString(),
      ...body,
      is_active: true,
      display_order: banners.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    banners.push(newBanner)
    
    return NextResponse.json({
      success: true,
      id: newBanner.id,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}


