"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Wallet, Save, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface AutoTopupSettings {
    enabled: boolean
    minBalance: number
    topupAmount: number
    paymentGateway: string
    apiKey: string
}

export default function AutoTopupPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<AutoTopupSettings>({
        enabled: false,
        minBalance: 100,
        topupAmount: 500,
        paymentGateway: 'inwcloud',
        apiKey: ''
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) return

            // TODO: Replace with actual API endpoint
            // For now, load from localStorage or use defaults
            const savedSettings = localStorage.getItem('auto_topup_settings')
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings))
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem('auth_token')
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบ')
                return
            }

            // TODO: Replace with actual API endpoint
            // For now, save to localStorage
            localStorage.setItem('auto_topup_settings', JSON.stringify(settings))
            
            toast.success('บันทึกการตั้งค่าสำเร็จ')
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setSaving(false)
        }
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
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
                        <Wallet className='h-6 w-6' />
                        ตั้งค่าเติมเงินออโต้
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        ตั้งค่าระบบเติมเงินอัตโนมัติเมื่อยอดเงิน Gafiwshop ต่ำกว่าที่กำหนด
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className='h-4 w-4 mr-2' />
                    {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </Button>
            </div>

            {/* Info Card */}
            <Card className='border-blue-200 bg-blue-50'>
                <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                        <Info className='h-5 w-5 text-blue-600 mt-0.5' />
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-blue-900 mb-1'>
                                ระบบเติมเงินอัตโนมัติ
                            </p>
                            <p className='text-xs text-blue-700'>
                                เมื่อเปิดใช้งาน ระบบจะตรวจสอบยอดเงิน Gafiwshop อัตโนมัติ 
                                และเติมเงินเมื่อยอดเงินต่ำกว่าที่กำหนด
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Form */}
            <Card>
                <CardHeader>
                    <CardTitle>การตั้งค่าเติมเงินออโต้</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* Enable/Disable */}
                    <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='enabled' className='text-base font-medium'>
                                เปิดใช้งานเติมเงินออโต้
                            </Label>
                            <p className='text-sm text-gray-500'>
                                เปิดหรือปิดระบบเติมเงินอัตโนมัติ
                            </p>
                        </div>
                        <Switch
                            id='enabled'
                            checked={settings.enabled}
                            onCheckedChange={(checked) => 
                                setSettings({ ...settings, enabled: checked })
                            }
                        />
                    </div>

                    {settings.enabled && (
                        <>
                            {/* Min Balance */}
                            <div className='space-y-2'>
                                <Label htmlFor='minBalance'>
                                    ยอดเงินขั้นต่ำ (บาท) <span className='text-red-500'>*</span>
                                </Label>
                                <p className='text-xs text-gray-500'>
                                    เมื่อยอดเงิน Gafiwshop ต่ำกว่าจำนวนนี้ ระบบจะเติมเงินอัตโนมัติ
                                </p>
                                <Input
                                    id='minBalance'
                                    type='number'
                                    min='0'
                                    step='1'
                                    value={settings.minBalance}
                                    onChange={(e) => 
                                        setSettings({ ...settings, minBalance: parseFloat(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            {/* Topup Amount */}
                            <div className='space-y-2'>
                                <Label htmlFor='topupAmount'>
                                    จำนวนเงินที่เติม (บาท) <span className='text-red-500'>*</span>
                                </Label>
                                <p className='text-xs text-gray-500'>
                                    จำนวนเงินที่จะเติมเมื่อยอดเงินต่ำกว่าที่กำหนด
                                </p>
                                <Input
                                    id='topupAmount'
                                    type='number'
                                    min='0'
                                    step='1'
                                    value={settings.topupAmount}
                                    onChange={(e) => 
                                        setSettings({ ...settings, topupAmount: parseFloat(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            {/* Payment Gateway */}
                            <div className='space-y-2'>
                                <Label htmlFor='paymentGateway'>
                                    Payment Gateway <span className='text-red-500'>*</span>
                                </Label>
                                <p className='text-xs text-gray-500'>
                                    เลือกช่องทางการชำระเงินสำหรับเติมเงินอัตโนมัติ
                                </p>
                                <select
                                    id='paymentGateway'
                                    value={settings.paymentGateway}
                                    onChange={(e) => 
                                        setSettings({ ...settings, paymentGateway: e.target.value })
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                >
                                    <option value='inwcloud'>Inwcloud</option>
                                    <option value='middlepay'>Middle Pay</option>
                                </select>
                            </div>

                            {/* API Key */}
                            <div className='space-y-2'>
                                <Label htmlFor='apiKey'>
                                    API Key <span className='text-red-500'>*</span>
                                </Label>
                                <p className='text-xs text-gray-500'>
                                    API Key สำหรับ Payment Gateway ที่เลือก
                                </p>
                                <Input
                                    id='apiKey'
                                    type='password'
                                    value={settings.apiKey}
                                    onChange={(e) => 
                                        setSettings({ ...settings, apiKey: e.target.value })
                                    }
                                    placeholder='กรอก API Key'
                                />
                            </div>

                            {/* Warning */}
                            <Card className='border-orange-200 bg-orange-50'>
                                <CardContent className='pt-6'>
                                    <div className='flex items-start gap-3'>
                                        <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium text-orange-900 mb-1'>
                                                คำเตือน
                                            </p>
                                            <p className='text-xs text-orange-700'>
                                                ระบบจะเติมเงินอัตโนมัติเมื่อยอดเงินต่ำกว่า {settings.minBalance} บาท 
                                                โดยจะเติมจำนวน {settings.topupAmount} บาท 
                                                กรุณาตรวจสอบให้แน่ใจว่ามี API Key ที่ถูกต้องและมีเงินในบัญชี Payment Gateway เพียงพอ
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

