"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function TermsOfServicePage() {
    const sections = [
        {
            id: 1,
            title: 'ยอมรับข้อกำหนดและเงื่อนไข',
            content: 'ยินดีต้อนรับสู่เว็บไซต์ของเรา ข้อกำหนดและเงื่อนไขนี้มีผลบังคับใช้กับการใช้งานเว็บไซต์และบริการทั้งหมดของเรา รวมถึงการให้บริการเติมเกม (Top-up Game) และบริการ Pup Social โดยการเข้าถึงหรือใช้งานเว็บไซต์ของเรา คุณตกลงที่จะผูกพันตามข้อกำหนดเหล่านี้'
        },
        {
            id: 2,
            title: 'การใช้งานบริการ',
            content: [
                { subtitle: 'คุณสมบัติการใช้งาน', items: [
                    'คุณต้องมีอายุอย่างน้อย 18 ปี หรือได้รับความยินยอมจากผู้ปกครอง',
                    'ให้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน',
                    'รักษาความลับของบัญชีและรหัสผ่าน',
                    'ไม่ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย',
                    'ไม่พยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต'
                ]},
                { subtitle: 'การสั่งซื้อและการชำระเงิน', items: [
                    'การสั่งซื้อบริการจะสมบูรณ์เมื่อได้รับการชำระเงินครบถ้วน',
                    'เราใช้ระบบชำระเงินที่ปลอดภัย',
                    'รองรับวิธีการชำระเงินต่างๆ รวมถึงบัตรเครดิต บัตรเดบิต และกระเป๋าเงินอิเล็กทรอนิกส์'
                ]}
            ]
        },
        {
            id: 3,
            title: 'นโยบายการคืนเงินและการยกเลิก',
            content: [
                { subtitle: 'การคืนเงิน', items: [
                    'เราไม่สามารถคืนเงินได้ในกรณีที่บริการได้ถูกส่งมอบเรียบร้อยแล้ว',
                    'การสั่งซื้อเกิดจากความผิดพลาดของผู้ใช้',
                    'การยกเลิกหลังจากที่บริการได้เริ่มดำเนินการแล้ว'
                ]},
                { subtitle: 'การยกเลิกบริการ', items: [
                    'คุณสามารถยกเลิกบริการได้ตลอดเวลา',
                    'บริการที่ได้ชำระเงินแล้วจะไม่สามารถคืนเงินได้',
                    'ยกเว้นในกรณีที่เราเป็นฝ่ายผิด'
                ]}
            ]
        },
        {
            id: 4,
            title: 'สิทธิในทรัพย์สินทางปัญญา',
            content: 'เว็บไซต์และเนื้อหาทั้งหมดเป็นกรรมสิทธิ์ของเรา คุณไม่ได้รับอนุญาตให้คัดลอก ทำซ้ำ แจกจ่าย หรือสร้างงานอนุพันธ์โดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษร เครื่องหมายการค้าและโลโก้เป็นกรรมสิทธิ์ของเราและพันธมิตร'
        },
        {
            id: 5,
            title: 'ข้อจำกัดความรับผิดชอบ',
            content: 'เราไม่รับผิดชอบต่อความเสียหายทางตรง ทางอ้อม หรือพิเศษที่เกิดจากการใช้งานบริการ รวมถึงการสูญเสียข้อมูล การหยุดชะงักของธุรกิจ หรือความเสียหายอื่นๆ เราไม่รับประกันว่าบริการจะปราศจากข้อผิดพลาดหรือไม่หยุดชะงัก'
        },
        {
            id: 6,
            title: 'การรักษาความปลอดภัย',
            content: 'เรามุ่งมั่นในการรักษาความปลอดภัยของข้อมูลผู้ใช้ อย่างไรก็ตาม คุณตระหนักว่าการส่งข้อมูลทางอินเทอร์เน็ตไม่สามารถรับประกันความปลอดภัยได้ 100% คุณมีหน้าที่ในการรักษาความปลอดภัยของบัญชีและรหัสผ่านของคุณเอง'
        },
        {
            id: 7,
            title: 'กฎหมายที่ใช้บังคับ',
            content: 'ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้กฎหมายของประเทศไทย ทุกข้อพิพาทจะอยู่ภายใต้เขตอำนาจของศาลไทย'
        }
    ]

    return (
        <main className='min-h-screen bg-gray-50'>
            <div className='w-full max-w-[480px] mx-auto bg-white min-h-screen'>
                {/* Header */}
                <div className='sticky top-0 z-10 bg-white border-b'>
                    <div className='px-4 py-4'>
                        <h1 className='text-xl font-semibold text-gray-900'>
                            Terms of Service
                        </h1>
                        <p className='text-xs text-gray-500 mt-1'>
                            ข้อกำหนดและเงื่อนไขการใช้งาน
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
                                            ) : (
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
                            <p className='text-xs text-gray-600'>
                                หากคุณมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขนี้ สามารถติดต่อเราผ่านทางอีเมลหรือช่องทางอื่นๆ ที่ระบุบนเว็บไซต์
                            </p>
                        </CardContent>
                    </Card>

                    {/* Footer Note */}
                    <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                        <p className='text-[10px] text-gray-500 text-center leading-relaxed'>
                            <strong>วันที่แก้ไขล่าสุด:</strong> {new Date().toLocaleDateString('th-TH')}
                        </p>
                        <p className='text-[10px] text-gray-500 text-center mt-1.5'>
                            การใช้งานเว็บไซต์นี้ต่อไปถือว่าคุณได้อ่าน ยอมรับ และตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขทั้งหมด
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
