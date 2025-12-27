'use client'

import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/lib/api'

interface ProductGridProps {
  category?: string
}

export default function ProductGrid({ category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getProducts(category)
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-48" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        ไม่พบสินค้าในหมวดหมู่นี้
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative w-full h-32 bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://via.placeholder.com/240x128?text=${encodeURIComponent(product.name)}`
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                📱
              </div>
            )}
            {product.is_premium && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                PREMIUM
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                ฿{product.price.toLocaleString()}
              </span>
              {product.platform && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.platform}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


