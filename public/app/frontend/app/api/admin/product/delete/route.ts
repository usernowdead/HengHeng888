import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (in production, use database)
let products: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    products = products.filter((p) => p.id !== id)
    
    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}


