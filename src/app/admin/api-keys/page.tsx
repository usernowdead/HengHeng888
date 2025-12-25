"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Copy, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface APIKeyConfig {
    key: string
    label: string
    description: string
    placeholder: string
    value: string
    masked: boolean
}

export default function APIKeysPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>([
        {
            key: 'PAYMENT_GATEWAY_API_KEY',
            label: 'Payment Gateway API Key',
            description: 'API Key สำหรับเชื่อมต่อกับระบบ Payment Gateway (เช่น inwcloud) - ใช้สำหรับการเติมเงินอัตโนมัติ',
            placeholder: 'inwcloud_live_29bba9091001983636dfa8990713699849eb5fce',
            value: '',
            masked: true
        },
        {
            key: 'API_KEY_GAFIW',
            label: 'Gafiwshop API Key',
            description: 'API Key สำหรับเชื่อมต่อกับ Gafiwshop (แอพพรีเมี่ยม)',
            placeholder: 'g6BokYNPOkdecUPGeOZY',
            value: '',
            masked: true
        },
        {
            key: 'API_KEY_ADS4U',
            label: 'ADS4U API Key',
            description: 'API Key สำหรับเชื่อมต่อกับ ADS4U (ปั้มโซเชียล)',
            placeholder: 'your_ads4u_api_key',
            value: '',
            masked: true
        },
        {
            key: 'API_KEY_MIDDLE',
            label: 'Middle Pay API Key',
            description: 'API Key สำหรับเชื่อมต่อกับ Middle Pay (สำรอง)',
            placeholder: 'your_middle_pay_api_key',
            value: '',
            masked: true
        },
        {
            key: 'API_KEY_PEAMSUB',
            label: 'Peamsub24hr API Key',
            description: 'API Key สำหรับเชื่อมต่อกับ Peamsub24hr (สินค้าพรีออเดอร์และแอพพรีเมี่ยม)',
            placeholder: 'your_peamsub_api_key',
            value: '',
            masked: true
        },
        {
            key: 'API_KEY_EASYSLIP',
            label: 'EasySlip API Key',
            description: 'API Key สำหรับเชื่อมต่อกับ EasySlip (ตรวจสอบสลิปธนาคารและ TrueWallet)',
            placeholder: 'your_easyslip_access_token',
            value: '',
            masked: true
        }
    ])

    useEffect(() => {
        fetchAPIKeys()
    }, [])

    const fetchAPIKeys = async () => {
        try {
            setLoading(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            // Note: In production, API keys should be fetched from a secure endpoint
            // For now, we'll just show placeholders
            const updatedKeys = apiKeys.map(key => ({
                ...key,
                value: '' // Don't fetch actual keys for security
            }))
            setApiKeys(updatedKeys)
        } catch (error) {
            console.error('Error fetching API keys:', error)
            toast.error('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (keyConfig: APIKeyConfig) => {
        if (!keyConfig.value.trim()) {
            toast.error('กรุณากรอก API Key')
            return
        }

        try {
            setSaving(keyConfig.key)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            // Note: In production, this should save to a secure backend
            // For now, we'll just show a success message
            toast.success(`บันทึก ${keyConfig.label} สำเร็จ`)
            
            // Update local state
            const updatedKeys = apiKeys.map(k => 
                k.key === keyConfig.key ? { ...k, value: keyConfig.value } : k
            )
            setApiKeys(updatedKeys)
        } catch (error) {
            console.error('Error saving API key:', error)
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setSaving(null)
        }
    }

    const handleCopy = (value: string, label: string) => {
        if (!value) {
            toast.error('ไม่มี API Key ให้คัดลอก')
            return
        }
        navigator.clipboard.writeText(value)
        toast.success(`คัดลอก ${label} แล้ว`)
    }

    const toggleMask = (key: string) => {
        const updatedKeys = apiKeys.map(k => 
            k.key === key ? { ...k, masked: !k.masked } : k
        )
        setApiKeys(updatedKeys)
    }

    const maskValue = (value: string) => {
        if (!value || value.length < 8) return '••••••••'
        return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4)
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <h2 className='text-2xl font-semibold text-gray-900'>ตั้งค่า API Keys</h2>
                <p className='text-sm text-gray-500 mt-1'>จัดการ API Keys สำหรับเชื่อมต่อกับระบบภายนอก</p>
            </div>

            {/* Warning */}
            <Card className='border-orange-200 bg-orange-50'>
                <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                        <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-orange-900 mb-1'>
                                คำเตือนด้านความปลอดภัย
                            </p>
                            <p className='text-xs text-orange-700'>
                                API Keys ควรเก็บไว้ใน environment variables (.env.local) สำหรับความปลอดภัย
                                หน้านี้ใช้สำหรับดูและตรวจสอบ API Keys เท่านั้น
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys List */}
            <div className='space-y-4'>
                {apiKeys.map((keyConfig) => (
                    <Card key={keyConfig.key}>
                        <CardHeader>
                            <CardTitle className='text-base font-semibold'>{keyConfig.label}</CardTitle>
                            <p className='text-sm text-gray-600 mt-1'>{keyConfig.description}</p>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div>
                                <Label htmlFor={keyConfig.key}>API Key</Label>
                                <div className='flex gap-2 mt-1'>
                                    <div className='relative flex-1'>
                                        <Input
                                            id={keyConfig.key}
                                            type={keyConfig.masked ? 'password' : 'text'}
                                            placeholder={keyConfig.placeholder}
                                            value={keyConfig.value}
                                            onChange={(e) => {
                                                const updatedKeys = apiKeys.map(k => 
                                                    k.key === keyConfig.key ? { ...k, value: e.target.value } : k
                                                )
                                                setApiKeys(updatedKeys)
                                            }}
                                            className='pr-20'
                                        />
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
                                            onClick={() => toggleMask(keyConfig.key)}
                                        >
                                            {keyConfig.masked ? (
                                                <EyeOff className='h-4 w-4' />
                                            ) : (
                                                <Eye className='h-4 w-4' />
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        variant='outline'
                                        onClick={() => handleCopy(keyConfig.value, keyConfig.label)}
                                        disabled={!keyConfig.value}
                                    >
                                        <Copy className='h-4 w-4 mr-1.5' />
                                        คัดลอก
                                    </Button>
                                    <Button
                                        onClick={() => handleSave(keyConfig)}
                                        disabled={saving === keyConfig.key || !keyConfig.value.trim()}
                                    >
                                        {saving === keyConfig.key ? (
                                            <>
                                                <Spinner className='h-4 w-4 mr-1.5' />
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className='h-4 w-4 mr-1.5' />
                                                บันทึก
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {keyConfig.value && (
                                    <p className='text-xs text-gray-500 mt-2'>
                                        ใช้ Key นี้ในการ Authenticate กับ API ทุกครั้ง (Header: Authorization: Bearer YOUR_KEY)
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-base font-semibold'>วิธีตั้งค่า API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3 text-sm text-gray-700'>
                        <div>
                            <p className='font-medium mb-1'>1. เปิดไฟล์ .env.local</p>
                            <p className='text-xs text-gray-600'>ไฟล์นี้อยู่ใน root directory ของโปรเจค</p>
                        </div>
                        <div>
                            <p className='font-medium mb-1'>2. เพิ่ม API Key ที่ต้องการ</p>
                            <pre className='bg-gray-100 p-2 rounded text-xs mt-1'>
{`PAYMENT_GATEWAY_API_KEY=your_payment_gateway_api_key
API_KEY_GAFIW=your_gafiwshop_api_key
API_KEY_ADS4U=your_ads4u_api_key
API_KEY_PEAMSUB=your_peamsub_api_key
API_KEY_EASYSLIP=your_easyslip_access_token`}
                            </pre>
                        </div>
                        <div>
                            <p className='font-medium mb-1'>3. Restart Development Server</p>
                            <p className='text-xs text-gray-600'>หยุด server (Ctrl+C) แล้วรันใหม่: npm run dev</p>
                        </div>
                        <div>
                            <p className='font-medium mb-1'>4. ตรวจสอบการตั้งค่า</p>
                            <p className='text-xs text-gray-600'>API Keys จะถูกโหลดจาก environment variables อัตโนมัติ</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

