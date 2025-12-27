'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProducts, type Product } from '@/lib/api'
import ProductCard from '@/components/ProductCard/ProductCard'

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts()
        setProducts(data.slice(0, 5))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">สินค้าแนะนำ</h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 animate-pulse rounded mb-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">สินค้าแนะนำ</h2>
          <Link
            href="/shop"
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium transition-colors"
          >
            <span>ดูทั้งหมด</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
