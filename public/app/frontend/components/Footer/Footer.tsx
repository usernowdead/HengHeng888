'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Logo and Description */}
          <div className="text-center">
            <div className="flex items-baseline justify-center mb-3">
              <span className="text-xl font-bold text-blue-600">SAFE</span>
              <span className="text-xl font-bold text-green-600">ZONE</span>
            </div>
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              ร้านค้าดิจิทัลสำหรับสินค้าและบริการคุณภาพสูง
              ปลอดภัย รวดเร็ว และเชื่อถือได้
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/shop" className="text-gray-600 hover:text-gray-900 transition-colors">
              ร้านค้า
            </Link>
            <Link href="/top-up" className="text-gray-600 hover:text-gray-900 transition-colors">
              เติมเงิน
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
              Admin
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} SAFE ZONE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
