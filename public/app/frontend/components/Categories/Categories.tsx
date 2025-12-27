'use client'

import Link from 'next/link'

interface Category {
  name: string
  slug: string
  icon?: string
}

const categories: Category[] = [
  { name: 'แอพดูหนัง', slug: 'movie', icon: '🎬' },
  { name: 'เติมเงิน', slug: 'top-up', icon: '💳' },
  { name: 'แอปพลิเคชัน', slug: 'apps', icon: '📱' },
  { name: 'เกมส์', slug: 'games', icon: '🎮' },
]

export default function Categories() {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h2 className="text-lg font-bold mb-3 text-gray-800">หมวดหมู่</h2>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}`}
            className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-3xl mb-2">{category.icon}</span>
            <span className="text-xs text-center text-gray-700 font-medium">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}


