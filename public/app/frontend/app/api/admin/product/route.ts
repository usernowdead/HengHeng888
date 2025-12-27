import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (in production, use database)
let products: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newProduct = {
      id: Date.now().toString(),
      ...body,
      price: parseFloat(body.price),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    products.push(newProduct)
    
    return NextResponse.json({
      success: true,
      id: newProduct.id,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}


