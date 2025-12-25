"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
    const sections = [
        {
            id: 1,
            title: 'ความสำคัญของความเป็นส่วนตัว',
            content: 'เรามุ่งมั่นในการปกป้องความเป็นส่วนตัวและข้อมูลส่วนบุคคลของผู้ใช้ทุกคน นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้งานเว็บไซต์และบริการของเรา'
        },
        {
            id: 2,
            title: 'ข้อมูลที่เราเก็บรวบรวม',
            content: [
                { subtitle: 'ข้อมูลที่คุณให้เราโดยตรง', items: [
                    'ข้อมูลการลงทะเบียน: ชื่อผู้ใช้ อีเมล ที่อยู่ และข้อมูลติดต่อ',
                    'ข้อมูลการชำระเงิน: ข้อมูลบัตรเครดิตหรือวิธีการชำระเงินอื่นๆ (ไม่เก็บข้อมูลบัตรเต็มรูปแบบ)',
                    'ข้อมูลโปรไฟล์: รูปภาพส่วนตัวและข้อมูลอื่นๆ ที่คุณเลือกแบ่งปัน',
                    'ข้อมูลการสื่อสาร: ข้อความ แชท และการโต้ตอบกับฝ่ายบริการลูกค้า'
                ]},
                { subtitle: 'ข้อมูลที่เราเก็บรวบรวมโดยอัตโนมัติ', items: [
                    'ข้อมูลการใช้งาน: หน้าเว็บที่เข้าชม เวลาที่ใช้งาน และการกระทำต่างๆ',
                    'ข้อมูลอุปกรณ์: ที่อยู่ IP ประเภทอุปกรณ์ และระบบปฏิบัติการ',
                    'คุกกี้และเทคโนโลยีติดตาม: ใช้เพื่อปรับปรุงประสบการณ์การใช้งาน',
                    'ข้อมูลตำแหน่ง: ในกรณีที่คุณอนุญาตให้เข้าถึงข้อมูลตำแหน่ง'
                ]}
            ]
        },
        {
            id: 3,
            title: 'วัตถุประสงค์ในการใช้ข้อมูล',
            content: [
                'ให้บริการและดำเนินการตามคำสั่งซื้อของคุณ',
                'จัดการบัญชีผู้ใช้และให้การสนับสนุนด้านเทคนิค',
                'ปรับปรุงและพัฒนาบริการของเรา',
                'ส่งการแจ้งเตือนเกี่ยวกับบริการและโปรโมชั่น',
                'ป้องกันการฉ้อโกงและรักษาความปลอดภัย',
                'ปฏิบัติตามกฎหมายและข้อกำหนดทางกฎหมาย',
                'วิเคราะห์พฤติกรรมการใช้งานเพื่อปรับปรุงประสบการณ์ผู้ใช้'
            ]
        },
        {
            id: 4,
            title: 'การแบ่งปันข้อมูล',
            content: 'เราไม่ขายหรือเช่าข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม ยกเว้นในกรณี: พันธมิตรทางธุรกิจ, ผู้ให้บริการชำระเงิน, ผู้ให้บริการเทคนิค, ตามกฎหมาย, และการป้องกันการฉ้อโกงหรือภัยคุกคามต่อความปลอดภัย'
        },
        {
            id: 5,
            title: 'การรักษาความปลอดภัยของข้อมูล',
            content: [
                'การเข้ารหัสข้อมูล SSL/TLS สำหรับการส่งข้อมูล',
                'การควบคุมการเข้าถึงข้อมูลอย่างเข้มงวด',
                'การสำรองข้อมูลเป็นประจำ',
                'การตรวจสอบและอัปเดตระบบรักษาความปลอดภัย',
                'การฝึกอบรมพนักงานเรื่องความปลอดภัยของข้อมูล'
            ]
        },
        {
            id: 6,
            title: 'สิทธิของเจ้าของข้อมูล',
            content: [
                'สิทธิในการเข้าถึง: ขอรับสำเนาข้อมูลส่วนบุคคลที่เราเก็บรักษา',
                'สิทธิในการแก้ไข: ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วน',
                'สิทธิในการลบ: ขอลบข้อมูลส่วนบุคคลในบางกรณี',
                'สิทธิในการจำกัดการใช้: ขอจำกัดการใช้ข้อมูลชั่วคราว',
                'สิทธิในการโอนย้าย: ขอรับข้อมูลในรูปแบบที่เครื่องอ่านได้',
                'สิทธิในการคัดค้าน: คัดค้านการใช้ข้อมูลเพื่อวัตถุประสงค์ทางการตลาด'
            ]
        }
    ]

    return (
        <main className='min-h-screen bg-gray-50'>
            <div className='w-full max-w-[480px] mx-auto bg-white min-h-screen'>
                {/* Header */}
                <div className='sticky top-0 z-10 bg-white border-b'>
                    <div className='px-4 py-4'>
                        <h1 className='text-xl font-semibold text-gray-900'>
                            Privacy Policy
                        </h1>
                        <p className='text-xs text-gray-500 mt-1'>
                            นโยบายความเป็นส่วนตัว
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className='px-4 py-4 space-y-4'>
                    {sections.map((section) => {
                        return (
                            <Card key={section.id} className='border-gray-200'>
                                <CardContent className='p-4'>
                                    <div>
                                        <h2 className='text-sm font-semibold text-gray-900 mb-2'>
                                            {section.id}. {section.title}
                                        </h2>
                                            
                                            {typeof section.content === 'string' ? (
                                                <p className='text-xs text-gray-600 leading-relaxed'>
                                                    {section.content}
                                                </p>
                                            ) : Array.isArray(section.content) && section.content[0]?.subtitle ? (
                                                <div className='space-y-3'>
                                                    {section.content.map((sub, idx) => (
                                                        <div key={idx}>
                                                            <h3 className='text-xs font-medium text-gray-800 mb-1.5'>
                                                                {section.id}.{idx + 1} {sub.subtitle}
                                                            </h3>
                                                            <ul className='space-y-1.5 list-disc list-inside'>
                                                                {sub.items.map((item, itemIdx) => (
                                                                    <li key={itemIdx} className='text-xs text-gray-600 leading-relaxed'>
                                                                        {item}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <ul className='space-y-1.5 list-disc list-inside'>
                                                    {section.content.map((item, idx) => (
                                                        <li key={idx} className='text-xs text-gray-600 leading-relaxed'>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {/* Contact Section */}
                    <Card className='border-blue-200 bg-blue-50'>
                        <CardContent className='p-4'>
                            <h2 className='text-sm font-semibold text-gray-900 mb-3'>
                                ติดต่อเรา
                            </h2>
                            <p className='text-xs text-gray-600 mb-3'>
                                หากคุณมีคำถาม ข้อกังวล หรือต้องการใช้สิทธิ์เกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อเราได้ผ่านช่องทางต่อไปนี้:
                            </p>
                            <div className='space-y-2'>
                                <div className='text-xs text-gray-700'>
                                    <span>privacy@yourwebsite.com</span>
                                </div>
                                <div className='text-xs text-gray-700'>
                                    <span>02-XXX-XXXX</span>
                                </div>
                                <div className='text-xs text-gray-700'>
                                    <span>กรุงเทพมหานคร ประเทศไทย</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Note */}
                    <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                        <p className='text-[10px] text-gray-500 text-center leading-relaxed'>
                            <strong>วันที่แก้ไขล่าสุด:</strong> {new Date().toLocaleDateString('th-TH')}
                        </p>
                        <p className='text-[10px] text-gray-500 text-center mt-1.5'>
                            การใช้งานเว็บไซต์นี้ต่อไปถือว่าคุณได้อ่านและยอมรับนโยบายความเป็นส่วนตัวนี้
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
