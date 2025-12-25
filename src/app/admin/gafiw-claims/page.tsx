"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Send, CheckCircle2, Clock, XCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Claim {
    claim_id: string
    order_id: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    estimated_response?: string
}

export default function GafiwClaimsPage() {
    const [orderId, setOrderId] = useState('')
    const [reason, setReason] = useState('')
    const [contact, setContact] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleSubmitClaim = async () => {
        if (!orderId.trim()) {
            toast.error('กรุณากรอกเลขออเดอร์')
            return
        }

        if (!reason.trim()) {
            toast.error('กรุณากรอกสาเหตุการเคลม')
            return
        }

        try {
            setSubmitting(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const response = await fetch('/api/v1/admin/gafiw-claim', 
                createAuthFetchOptions({
                    method: 'POST',
                    body: JSON.stringify({
                        order_id: orderId.trim(),
                        reason: reason.trim(),
                        contact: contact.trim() || undefined
                    })
                }, token)
            )

            const data = await response.json()
            if (data.success) {
                toast.success(data.message || 'แจ้งเคลมสำเร็จ')
                setDialogOpen(false)
                setOrderId('')
                setReason('')
                setContact('')
            } else {
                toast.error(data.message || 'การแจ้งเคลมล้มเหลว')
            }
        } catch (error) {
            console.error('Error submitting claim:', error)
            toast.error('เกิดข้อผิดพลาดในการแจ้งเคลม')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant='default' className='bg-green-100 text-green-800'>
                        <CheckCircle2 className='h-3 w-3 mr-1' />
                        อนุมัติแล้ว
                    </Badge>
                )
            case 'rejected':
                return (
                    <Badge variant='secondary' className='bg-red-100 text-red-800'>
                        <XCircle className='h-3 w-3 mr-1' />
                        ปฏิเสธ
                    </Badge>
                )
            case 'pending':
            default:
                return (
                    <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
                        <Clock className='h-3 w-3 mr-1' />
                        รอตรวจสอบ
                    </Badge>
                )
        }
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
                        <AlertCircle className='h-6 w-6' />
                        จัดการเคลม Gafiwshop
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        แจ้งเคลมออเดอร์ที่มีปัญหากับ Gafiwshop
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Send className='h-4 w-4 mr-2' />
                            แจ้งเคลมใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-[calc(100vw-2rem)] sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>แจ้งเคลมออเดอร์</DialogTitle>
                        </DialogHeader>
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='orderId'>
                                    เลขออเดอร์ <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id='orderId'
                                    placeholder='กรอกเลขออเดอร์ที่ต้องการเคลม'
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='reason'>
                                    สาเหตุการเคลม <span className='text-red-500'>*</span>
                                </Label>
                                <Textarea
                                    id='reason'
                                    placeholder='อธิบายสาเหตุที่ต้องการเคลม เช่น สินค้าไม่ทำงาน, ได้รับสินค้าผิด, ฯลฯ'
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='contact'>
                                    ช่องทางติดต่อ (ไม่บังคับ)
                                </Label>
                                <Input
                                    id='contact'
                                    placeholder='อีเมล, เบอร์โทร, หรือ Line ID'
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                            </div>

                            <div className='flex gap-2 pt-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => setDialogOpen(false)}
                                    className='flex-1'
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    onClick={handleSubmitClaim}
                                    disabled={submitting || !orderId.trim() || !reason.trim()}
                                    className='flex-1'
                                >
                                    {submitting ? 'กำลังส่ง...' : 'ส่งเคลม'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Info Card */}
            <Card className='border-blue-200 bg-blue-50'>
                <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                        <Info className='h-5 w-5 text-blue-600 mt-0.5' />
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-blue-900 mb-1'>
                                วิธีแจ้งเคลม
                            </p>
                            <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                                <li>กรอกเลขออเดอร์ที่ต้องการเคลม</li>
                                <li>อธิบายสาเหตุการเคลมให้ชัดเจน</li>
                                <li>ระบบจะส่งเคลมไปยัง Gafiwshop อัตโนมัติ</li>
                                <li>สามารถตรวจสอบสถานะได้ในประวัติเคลม</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Claims List */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>
                        ประวัติการเคลม
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-12 text-gray-500'>
                        <AlertCircle className='h-12 w-12 mx-auto mb-2 opacity-50' />
                        <p>ยังไม่มีการเคลม</p>
                        <p className='text-xs mt-1'>คลิกปุ่ม "แจ้งเคลมใหม่" เพื่อเริ่มต้น</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
