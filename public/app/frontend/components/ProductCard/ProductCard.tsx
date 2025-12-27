'use client'

import Link from 'next/link'
import { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const stock = stockHash % 25
  const isOutOfStock = stock === 0

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
        {/* Product Image */}
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div class="text-5xl font-bold text-gray-300">${product.name.charAt(0).toUpperCase()}</div>
                    </div>
                  `
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-5xl font-bold text-gray-300">{product.name.charAt(0).toUpperCase()}</div>
            </div>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-semibold text-sm bg-gray-900/90 px-4 py-2 rounded-lg">
                สินค้าหมด
              </span>
            </div>
          )}

          {product.is_premium && !isOutOfStock && (
            <div className="absolute top-2 right-2">
              <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
                PREMIUM
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-1.5">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-900">
                {product.price.toLocaleString()} ฿
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                คงเหลือ {stock} ชิ้น
              </p>
            </div>
            
            {product.platform && (
              <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                {product.platform}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault()
            }}
            className={`
              w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200
              flex items-center justify-center space-x-2
              ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>ดูรายละเอียด</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
