import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function notfound() {
    return (
        <main className='min-h-screen flex justify-center items-center'>
            <div>
                <h1 className='text-2xl font-semibold text-center'>
                    404 ไม่พบหน้าเว็บที่คุณค้นหา
                </h1>
                <p className='text-sm text-center text-muted-foreground'>
                    หน้าเว็บที่คุณค้นหาไม่พบ กรุณาลองอีกครั้ง
                </p>
                <div className='flex justify-center mt-3'>
                    <Button variant={'default'} className='cursor-pointer'>
                        <Link href={'/'}>
                            กลับหน้าหลัก
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}