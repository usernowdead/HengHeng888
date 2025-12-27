import React from 'react'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className='border-t bg-white'>
            <div className='w-full max-w-[480px] mx-auto px-4'>
                {/* Brand & Description */}
                <div className='py-4 text-center'>
                    <Link href={'/'} className='inline-block'>
                        <h2 className='text-base font-semibold mb-2' suppressHydrationWarning>
                            Payplearn
                        </h2>
                    </Link>
                    <p className='text-xs text-gray-600'>
                        บริการปั้มโซเชียลมิเดีย สินค้าแต่ละค่าย แอพพรีเมี่ยม เติมเงินเกม ครบทุกค่าย
                    </p>
                </div>

                {/* Bottom Section */}
                <div className='border-t border-gray-200 py-3'>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <p className='text-xs text-gray-500' suppressHydrationWarning>
                            ลิขสิทธิ์ © {currentYear} <span suppressHydrationWarning>Payplearn</span> สงวนลิขสิทธิ์ทุกประการ
                        </p>
                        <div className='flex items-center justify-center gap-2'>
                            <Link 
                                href='/privacy-policy' 
                                className='text-xs text-gray-600 hover:text-gray-900'
                            >
                                นโยบายความเป็นส่วนตัว
                            </Link>
                            <span className='text-gray-300'>•</span>
                            <Link 
                                href='/terms-of-service' 
                                className='text-xs text-gray-600 hover:text-gray-900'
                            >
                                เงื่อนไข
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
