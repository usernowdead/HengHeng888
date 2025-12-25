"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CreditCard, Save, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface PaymentMethod {
  key: string
  name: string
  description: string
  enabled: boolean
}

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      key: 'promptpay',
      name: 'PromptPay QR Code',
      description: 'สแกน QR Code เพื่อชำระเงิน',
      enabled: true
    },
    {
      key: 'truewallet',
      name: 'อังเปา ทรูมันนี่',
      description: 'ลิงก์ซองของขวัญ TrueWallet',
      enabled: true
    }
  ])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { createAuthFetchOptions } = await import('@/lib/api-helpers')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const response = await fetch('/api/v1/admin/website-settings', 
        createAuthFetchOptions({}, token)
      )

      if (response.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบใหม่ (Session หมดอายุ)')
        if (typeof window !== 'undefined') {
          window.location.href = '/signin'
        }
        return
      }

      const data = await response.json()
      if (data.success) {
        const settings = data.settings || data.data || {}
        
        // Load payment method settings
        setPaymentMethods(prev => prev.map(method => ({
          ...method,
          enabled: settings[`payment_method_${method.key}_enabled`] !== 'false'
        })))
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: string, enabled: boolean) => {
    setPaymentMethods(prev => prev.map(method => 
      method.key === key ? { ...method, enabled } : method
    ))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { createAuthFetchOptions } = await import('@/lib/api-helpers')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      // Build settings object
      const settingsToUpdate: Record<string, string> = {}
      paymentMethods.forEach(method => {
        settingsToUpdate[`payment_method_${method.key}_enabled`] = method.enabled.toString()
      })

      const response = await fetch('/api/v1/admin/website-settings', {
        ...createAuthFetchOptions({
          method: 'POST',
          body: JSON.stringify(settingsToUpdate)
        }, token)
      })

      const data = await response.json()
      
      if (response.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบใหม่ (Session หมดอายุ)')
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/signin'
        }
        return
      }

      if (data.success) {
        toast.success('บันทึกการตั้งค่าสำเร็จ')
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการบันทึก')
      }
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
            <CreditCard className='h-6 w-6' />
            จัดการช่องทางการชำระเงิน
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            เปิดหรือปิดการแสดงช่องทางการชำระเงินบนหน้าเติมเงิน
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
                การจัดการช่องทางการชำระเงิน
              </p>
              <p className='text-xs text-blue-700'>
                คุณสามารถเปิดหรือปิดการแสดงช่องทางการชำระเงินแต่ละช่องทางได้ 
                เช่น ถ้าวันไหน True Wallet ปิดปรับปรุง ก็สามารถซ่อนช่องทางนั้นได้
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className='space-y-4'>
        {paymentMethods.map((method) => (
          <Card key={method.key}>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>{method.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm text-gray-600'>{method.description}</p>
                  <p className='text-xs text-gray-500'>
                    {method.enabled 
                      ? '✅ ช่องทางนี้กำลังแสดงบนหน้าเติมเงิน' 
                      : '❌ ช่องทางนี้ถูกซ่อนจากหน้าเติมเงิน'}
                  </p>
                </div>
                <div className='ml-4'>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={(checked) => handleToggle(method.key, checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Card */}
      <Card className='border-orange-200 bg-orange-50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-orange-900 mb-1'>
                คำเตือน
              </p>
              <p className='text-xs text-orange-700'>
                ควรมีช่องทางการชำระเงินอย่างน้อย 1 ช่องทางที่เปิดอยู่ 
                ถ้าปิดทั้งหมด ผู้ใช้จะไม่สามารถเติมเงินได้
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

