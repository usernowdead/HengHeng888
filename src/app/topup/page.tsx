"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Wallet, CreditCard, AlertCircle, CheckCircle, QrCode, X, Clock, Gift, RefreshCw, Copy, ChevronUp, FileCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Protected from '@/components/auth/Protected'
import { SlipVerificationDialog } from '@/components/topup/SlipVerificationDialog'

interface PaymentData {
    transactionId: string
    amount: string
    expiresAt: number
    internalTransactionId: string
    paymentMethod: 'promptpay' | 'truewallet'
    // PromptPay fields
    qrUrl?: string
    payload?: string
    // TrueWallet fields
    voucherUrl?: string
    voucherCode?: string
}

export default function TopupPage() {
    const { user, isAuth, validateToken } = useAuth()
    const { settings } = useWebsiteSettings()
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null)
    const [checkingPayment, setCheckingPayment] = useState(false)
    const [presetAmounts] = useState([50, 100, 200, 300, 400, 500])
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'truewallet' | null>(null)
    const [giftLink, setGiftLink] = useState('') // สำหรับลิงค์ซองของขวัญ TrueWallet
    const [refreshingBalance, setRefreshingBalance] = useState(false)
    const [isExpanded, setIsExpanded] = useState(true)
    const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<{
        promptpay: boolean
        truewallet: boolean
    }>({
        promptpay: true,
        truewallet: true
    })
    const [showSlipVerification, setShowSlipVerification] = useState(false)

    useEffect(() => {
        // Cleanup polling on unmount
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval)
            }
        }
    }, [pollInterval])

    useEffect(() => {
        // Fetch payment method settings from API (not directly from Prisma)
        const fetchPaymentMethodSettings = async () => {
            console.log('🔍 [Topup] Starting to fetch payment method settings...')
            try {
                const response = await fetch('/api/v1/website-settings', {
                    cache: 'no-store', // Prevent caching
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                })
                
                console.log('📡 [Topup] API Response status:', response.status)
                
                if (!response.ok) {
                    console.error('❌ [Topup] API Response not OK:', response.status, response.statusText)
                    return
                }
                
                const data = await response.json()
                console.log('📦 [Topup] API Response data:', data)
                
                if (data.success && data.data) {
                    const settings = data.data as Record<string, any>
                    // Handle both boolean and string values
                    const promptpayValue = settings['payment_method_promptpay_enabled']
                    const truewalletValue = settings['payment_method_truewallet_enabled']
                    
                    const promptpayEnabled = promptpayValue !== false && promptpayValue !== 'false'
                    const truewalletEnabled = truewalletValue !== false && truewalletValue !== 'false'
                    
                    console.log('✅ [Topup] Payment method settings loaded:', {
                        promptpay: promptpayEnabled,
                        truewallet: truewalletEnabled,
                        rawSettings: {
                            promptpay: settings['payment_method_promptpay_enabled'],
                            truewallet: settings['payment_method_truewallet_enabled']
                        },
                        allSettings: Object.keys(settings).filter(k => k.includes('payment_method'))
                    })
                    
                    setEnabledPaymentMethods({
                        promptpay: promptpayEnabled,
                        truewallet: truewalletEnabled
                    })
                    
                    console.log('✅ [Topup] State updated:', {
                        promptpay: promptpayEnabled,
                        truewallet: truewalletEnabled
                    })
                } else {
                    console.warn('⚠️ [Topup] Failed to fetch payment method settings:', data)
                    console.warn('⚠️ [Topup] Using defaults (both enabled)')
                }
            } catch (error) {
                console.error('❌ [Topup] Error fetching payment method settings:', error)
                console.error('❌ [Topup] Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                })
                // Use defaults if error (both enabled by default)
            }
        }
        
        fetchPaymentMethodSettings()
    }, [])

    // Debug: Log when enabledPaymentMethods changes
    useEffect(() => {
        console.log('🔄 [Topup] enabledPaymentMethods state changed:', enabledPaymentMethods)
    }, [enabledPaymentMethods])

    const startPaymentCheck = (transactionId: string) => {
        // Clear existing interval
        if (pollInterval) {
            clearInterval(pollInterval)
        }

        // Check payment status every 3 seconds
        const interval = setInterval(async () => {
            await checkPaymentStatus(transactionId)
        }, 3000)

        setPollInterval(interval)
        
        // Initial check
        checkPaymentStatus(transactionId)
    }

    const checkPaymentStatus = async (transactionId: string) => {
        try {
            setCheckingPayment(true)
            // Use helper function for backward compatibility (supports both cookie and localStorage)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers');
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const response = await fetch('/api/v1/topup/check', {
                ...createAuthFetchOptions({
                    method: 'POST',
                    body: JSON.stringify({
                        transactionId: transactionId
                    })
                }, token)
            })

            const data = await response.json()
            
            if (data.success) {
                if (data.status === 'success') {
                    // Payment successful
                    setPaymentStatus('success')
                    if (pollInterval) {
                        clearInterval(pollInterval)
                    }
                    toast.success('ชำระเงินสำเร็จ!')
                    if (validateToken) {
                        await validateToken()
                    }
                    // Redirect to success page after 2 seconds
                    setTimeout(() => {
                        router.push('/topup/success')
                    }, 2000)
                } else if (data.status === 'pending') {
                    setPaymentStatus('pending')
                    // Continue polling
                }
            } else {
                setPaymentStatus('error')
                if (pollInterval) {
                    clearInterval(pollInterval)
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error)
        } finally {
            setCheckingPayment(false)
        }
    }

    const handleClosePayment = () => {
        setShowPayment(false)
        setPaymentData(null)
        setPaymentStatus(null)
        setGiftLink('') // Reset gift link when closing
        if (pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
        }
    }

    // Reset gift link when switching payment method
    useEffect(() => {
        if (paymentMethod !== 'truewallet') {
            setGiftLink('')
        }
    }, [paymentMethod])

    const handleRefreshBalance = async () => {
        if (!validateToken) return
        setRefreshingBalance(true)
        try {
            await validateToken()
            toast.success('อัปเดตยอดเงินสำเร็จ')
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน')
        } finally {
            setRefreshingBalance(false)
        }
    }

    const handleCopyUsername = () => {
        if (user?.username) {
            navigator.clipboard.writeText(user.username)
            toast.success('คัดลอกชื่อผู้ใช้แล้ว')
        }
    }

    const handlePresetAmount = (preset: number) => {
        setAmount(preset.toString())
    }

    const handleSubmit = async () => {
        if (!isAuth) {
            toast.error('กรุณาเข้าสู่ระบบก่อน')
            router.push('/signin')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum < 50) {
            toast.error('จำนวนเงินขั้นต่ำ 50 บาท')
            return
        }

        if (amountNum > 50000) {
            toast.error('จำนวนเงินสูงสุด 50,000 บาท')
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบใหม่')
                router.push('/signin')
                return
            }

            if (!paymentMethod) {
                toast.error('กรุณาเลือกช่องทางการชำระเงิน')
                return
            }

            // Validate gift link if TrueWallet is selected
            if (paymentMethod === 'truewallet') {
                if (!giftLink || giftLink.trim() === '') {
                    toast.error('กรุณากรอกลิงก์ซองของขวัญ TrueWallet')
                    return
                }
                // Basic URL validation
                if (!giftLink.startsWith('http://') && !giftLink.startsWith('https://')) {
                    toast.error('กรุณากรอกลิงก์ที่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)')
                    return
                }
            }

            const response = await fetch('/api/v1/topup/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amountNum,
                    paymentMethod: paymentMethod, // 'promptpay' or 'truewallet'
                    giftLink: paymentMethod === 'truewallet' ? giftLink.trim() : undefined // ส่งลิงค์อังเปาเมื่อเลือก truewallet
                })
            })

            const data = await response.json()
            if (data.success && data.data) {
                // Show payment method (QR Code or Voucher Link)
                setPaymentData(data.data)
                setShowPayment(true)
                // Start polling for payment status
                startPaymentCheck(data.data.transactionId)
            } else {
                toast.error(data.message || 'เกิดข้อผิดพลาดในการสร้าง QR Code')
            }
        } catch (error) {
            console.error('Error creating topup:', error)
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setLoading(false)
        }
    }


    return (
        <Protected>
        <main className='min-h-screen bg-gray-50'>
            <section className='container mx-auto px-4 py-6 max-w-lg'>
                <div className='space-y-5'>
                    {/* Header */}
                    <div className='text-center'>
                        <h1 className='text-xl font-semibold text-gray-900 mb-1'>
                            เติมเงินเข้าสู่ระบบ
                        </h1>
                        <p className='text-xs text-gray-500'>
                            เติมเงินเพื่อสั่งซื้อสินค้าหรือบริการ
                        </p>
                    </div>

                    {/* กระเป๋าเงินสด */}
                    <div 
                        className='relative rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200'
                    >
                        <div className='relative p-3 pt-5'>
                            {/* Top Section */}
                            <div className='flex items-center justify-between mb-3'>
                                {/* Left: เครดิตทั้งหมด */}
                                <div className='flex items-center gap-1.5'>
                                    <button
                                        onClick={handleRefreshBalance}
                                        disabled={refreshingBalance}
                                        className='text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 active:scale-95'
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${refreshingBalance ? 'animate-spin' : ''}`} />
                                    </button>
                                    <span className='text-gray-700 text-xs font-semibold'>เครดิตทั้งหมด</span>
                                </div>

                                {/* Center: Expand/Collapse icon */}
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className='text-gray-700 hover:text-gray-900 transition-all active:scale-95'
                                >
                                    <ChevronUp className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
                                </button>

                                {/* Right: Username */}
                                <div className='flex items-center gap-1.5'>
                                    <span className='text-gray-700 text-xs font-medium'>ยูซเซอร์เนม : {user?.username || 'N/A'}</span>
                                    <button
                                        onClick={handleCopyUsername}
                                        className='text-gray-700 hover:text-gray-900 transition-colors active:scale-95'
                                        title='คัดลอกชื่อผู้ใช้'
                                    >
                                        <Copy className='h-3 w-3' />
                                    </button>
                                </div>
                            </div>

                            {/* Middle Section - Balance */}
                            {isExpanded && (
                                <div className='pt-1'>
                                    <div className='flex items-center justify-center'>
                                        <div className='text-center'>
                                            <p className='text-gray-900 text-2xl font-bold leading-tight'>
                                                {(user?.balance || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <Card className='border border-gray-200'>
                        <CardHeader className='pb-3 pt-4'>
                            <CardTitle className='text-base font-semibold text-gray-900 text-center'>
                                เลือกช่องทางการชำระเงิน
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-0'>
                            <div className='grid gap-3 grid-cols-3'>
                                {/* PromptPay QR Code */}
                                {enabledPaymentMethods.promptpay && (
                                <button
                                    onClick={() => setPaymentMethod('promptpay')}
                                    className={`p-4 border-2 rounded-lg transition-colors ${
                                        paymentMethod === 'promptpay'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className='flex flex-col items-center text-center space-y-2'>
                                        <div className="w-16 h-16 flex items-center justify-center">
                                            <Image
                                                src="https://richmanshop.com/img/pp.png"
                                                alt="PromptPay QR Code"
                                                width={64}
                                                height={64}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className='space-y-0.5'>
                                            <p className={`font-semibold text-sm ${
                                                paymentMethod === 'promptpay' ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                                PromptPay
                                            </p>
                                            <p className='text-[10px] text-gray-600'>
                                                สแกน QR Code
                                            </p>
                                            <p className='text-[10px] text-gray-500 mt-0.5'>
                                                ค่าธรรมเนียม 0 บาท
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                )}
                                
                                {/* TrueWallet Voucher (ซองอังเปา) */}
                                {enabledPaymentMethods.truewallet && (
                                <button
                                    onClick={() => setPaymentMethod('truewallet')}
                                    className={`p-4 border-2 rounded-lg transition-colors ${
                                        paymentMethod === 'truewallet'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className='flex flex-col items-center text-center space-y-2'>
                                        <div className="w-16 h-16 flex items-center justify-center">
                                            <Image
                                                src="https://playzaa.online/images/angpao.png"
                                                alt="ซองอังเปา ทรูมันนี่"
                                                width={64}
                                                height={64}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className='space-y-0.5'>
                                            <p className={`font-semibold text-sm ${
                                                paymentMethod === 'truewallet' ? 'text-red-900' : 'text-gray-900'
                                            }`}>
                                                อังเปา ทรูมันนี่
                                            </p>
                                            <p className='text-[10px] text-gray-600'>
                                                ลิงก์ซองของขวัญ
                                            </p>
                                            <p className='text-[10px] text-gray-500 mt-0.5'>
                                                ค่าธรรมเนียม 0 บาท
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                )}

                                {/* SLIP QRCODE */}
                                <button
                                    onClick={() => setShowSlipVerification(true)}
                                    className={`p-4 border-2 rounded-lg transition-colors ${
                                        showSlipVerification
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className='flex flex-col items-center text-center space-y-2'>
                                        <div className="w-16 h-16 flex items-center justify-center">
                                            <img
                                                src="https://apiportal.kasikornbank.com/bucket/SiteCollectionDocuments/assets/theme/img/type-img-04.png"
                                                alt="SLIP QRCODE"
                                                width={64}
                                                height={64}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className='space-y-0.5'>
                                            <p className={`font-semibold text-sm ${
                                                showSlipVerification ? 'text-green-900' : 'text-gray-900'
                                            }`}>
                                                SLIP QRCODE
                                            </p>
                                            <p className='text-[10px] text-gray-600'>
                                                ตรวจสอบสลิป
                                            </p>
                                            <p className='text-[10px] text-gray-500 mt-0.5'>
                                                ค่าธรรมเนียม 0 บาท
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            {!enabledPaymentMethods.promptpay && !enabledPaymentMethods.truewallet && (
                                <div className='text-center py-4 text-gray-500 text-sm'>
                                    ไม่มีช่องทางการชำระเงินที่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Topup Form */}
                    <Card className='border border-gray-200'>
                        <CardHeader className='pb-3 pt-4'>
                            <CardTitle className='text-base font-semibold'>เลือกจำนวนเงินที่ต้องการเติม</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4 pt-0'>
                            {/* Preset Amounts */}
                            <div>
                                <Label className='mb-2 block text-sm'>จำนวนเงินแนะนำ</Label>
                                <div className='grid grid-cols-3 gap-2'>
                                    {presetAmounts.map((preset) => (
                                        <Button
                                            key={preset}
                                            variant={amount === preset.toString() ? 'default' : 'outline'}
                                            onClick={() => handlePresetAmount(preset)}
                                            className='h-10 text-sm'
                                        >
                                            ฿{preset.toLocaleString()}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div>
                                <Label htmlFor='amount' className='text-sm'>หรือระบุจำนวนเงินเอง</Label>
                                <div className='relative mt-1'>
                                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm'>฿</span>
                                    <Input
                                        id='amount'
                                        type='number'
                                        placeholder='0'
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className='pl-8 h-10 text-base'
                                        min='50'
                                        max='50000'
                                        step='1'
                                    />
                                </div>
                                <p className='text-xs text-gray-500 mt-1.5'>
                                    จำนวนเงินขั้นต่ำ 50 บาท สูงสุด 50,000 บาท
                                </p>
                            </div>

                            {/* TrueWallet Gift Link Input */}
                            {paymentMethod === 'truewallet' && (
                                <div>
                                    <Label htmlFor='giftLink' className='text-sm'>
                                        ลิงก์ซองของขวัญ TrueWallet <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        id='giftLink'
                                        type='url'
                                        placeholder='https://gift.truemoney.com/campaign/?v=...'
                                        value={giftLink}
                                        onChange={(e) => setGiftLink(e.target.value)}
                                        className='h-10 text-sm mt-1'
                                    />
                                    <p className='text-[10px] text-gray-500 mt-1.5'>
                                        เปิดซองของขวัญในแอป TrueMoney → เลือก "แชร์ลิงก์" → คัดลอกลิงก์มาวางที่นี่
                                    </p>
                                </div>
                            )}

                            {/* Info */}
                            <div className='p-2.5 bg-blue-50 rounded-lg border border-blue-200'>
                                <div className='flex items-start gap-2'>
                                    <CreditCard className='h-4 w-4 text-blue-600 mt-0.5 shrink-0' />
                                    <div className='flex-1'>
                                        <p className='text-xs font-medium text-blue-900 mb-0.5'>
                                            วิธีการชำระเงิน
                                        </p>
                                        <p className='text-[10px] text-blue-700 leading-relaxed'>
                                            คุณจะถูกนำไปยังหน้า Payment Gateway เพื่อชำระเงิน
                                            หลังจากชำระเงินสำเร็จ ระบบจะเติมเงินให้คุณอัตโนมัติ
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    loading || 
                                    !amount || 
                                    parseFloat(amount) < 50 || 
                                    !paymentMethod ||
                                    (paymentMethod === 'truewallet' && (!giftLink || giftLink.trim() === ''))
                                }
                                className='w-full h-10 text-sm font-medium'
                                size='default'
                            >
                                {loading ? (
                                    <>
                                        <Spinner className='h-4 w-4 mr-2' />
                                        กำลังสร้างลิงก์ชำระเงิน...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className='h-4 w-4 mr-2' />
                                        ดำเนินการเติมเงิน
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Payment Dialog (QR Code or Voucher Link) */}
                    {showPayment && paymentData && (
                        <Dialog open={showPayment} onOpenChange={handleClosePayment}>
                            <DialogContent className='max-w-md'>
                                <DialogHeader>
                                    <DialogTitle className='flex items-center justify-between'>
                                        <span>
                                            {paymentData.paymentMethod === 'promptpay' 
                                                ? 'สแกน QR Code เพื่อชำระเงิน' 
                                                : 'ลิงก์ซองของขวัญ TrueWallet'}
                                        </span>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={handleClosePayment}
                                            className='h-8 w-8 p-0'
                                        >
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className='space-y-4'>
                                    {paymentData.paymentMethod === 'promptpay' && paymentData.qrUrl && (
                                        <>
                                            <div className='flex justify-center'>
                                                <div className='p-4 bg-white rounded-lg border-2 border-gray-200'>
                                                    <img
                                                        src={paymentData.qrUrl}
                                                        alt='PromptPay QR Code'
                                                        className='w-64 h-64'
                                                    />
                                                </div>
                                            </div>
                                            <div className='p-3 bg-blue-50 rounded-lg'>
                                                <p className='text-xs text-blue-700 text-center'>
                                                    เปิดแอปธนาคารหรือแอป PromptPay แล้วสแกน QR Code นี้
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    
                                    {paymentData.paymentMethod === 'truewallet' && paymentData.voucherUrl && (
                                        <>
                                            <div className='p-4 bg-orange-50 rounded-lg border-2 border-orange-200'>
                                                <div className='text-center space-y-3'>
                                                    <Gift className='h-12 w-12 mx-auto text-orange-600' />
                                                    <p className='text-sm text-gray-700'>
                                                        คลิกที่ลิงก์ด้านล่างเพื่อเปิดซองของขวัญ TrueWallet
                                                    </p>
                                                    <Button
                                                        onClick={() => window.open(paymentData.voucherUrl, '_blank')}
                                                        className='w-full bg-orange-600 hover:bg-orange-700'
                                                    >
                                                        <Gift className='h-4 w-4 mr-2' />
                                                        เปิดลิงก์ซองของขวัญ
                                                    </Button>
                                                    {paymentData.voucherCode && (
                                                        <div className='p-2 bg-white rounded border'>
                                                            <p className='text-xs text-gray-600 mb-1'>รหัสซองของขวัญ:</p>
                                                            <p className='font-mono text-sm font-semibold'>{paymentData.voucherCode}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    <div className='text-center space-y-2'>
                                        <p className='text-lg font-semibold text-gray-900'>
                                            ฿{parseFloat(paymentData.amount).toLocaleString()}
                                        </p>
                                        {paymentStatus === 'pending' && (
                                            <div className='flex items-center justify-center gap-2 text-orange-600'>
                                                <Clock className='h-4 w-4 animate-spin' />
                                                <span className='text-sm'>กำลังรอการชำระเงิน...</span>
                                            </div>
                                        )}
                                        {paymentStatus === 'success' && (
                                            <div className='flex items-center justify-center gap-2 text-green-600'>
                                                <CheckCircle className='h-4 w-4' />
                                                <span className='text-sm'>ชำระเงินสำเร็จ!</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Slip Verification Dialog */}
                    <SlipVerificationDialog
                        open={showSlipVerification}
                        onOpenChange={setShowSlipVerification}
                        transactionId={paymentData?.internalTransactionId || paymentData?.transactionId}
                        amount={paymentData ? parseFloat(paymentData.amount) : undefined}
                        onVerified={(data) => {
                            // If verification is successful and matches transaction, auto-check payment
                            if (paymentData && data.amount) {
                                const verifiedAmount = typeof data.amount === 'object' ? data.amount.amount : data.amount;
                                const expectedAmount = parseFloat(paymentData.amount);
                                
                                if (Math.abs(verifiedAmount - expectedAmount) < 0.01) {
                                    // Amount matches, trigger payment check
                                    if (paymentData.transactionId) {
                                        checkPaymentStatus(paymentData.transactionId);
                                    }
                                }
                            }
                        }}
                    />

                    {/* Important Notes */}
                    <Card className='border-orange-200 bg-orange-50'>
                        <CardContent className='pt-4 pb-4'>
                            <div className='flex items-start gap-2'>
                                <AlertCircle className='h-4 w-4 text-orange-600 mt-0.5 shrink-0' />
                                <div className='flex-1 space-y-1'>
                                    <p className='text-xs font-medium text-orange-900'>
                                        ข้อควรทราบ
                                    </p>
                                    <ul className='text-[10px] text-orange-700 space-y-0.5 list-disc list-inside'>
                                        <li>การเติมเงินจะใช้เวลา 1-5 นาที หลังจากชำระเงินสำเร็จ</li>
                                        <li>หากไม่ได้รับเงินภายใน 30 นาที กรุณาติดต่อฝ่ายสนับสนุน</li>
                                        <li>ยอดเงินที่เติมสามารถใช้ได้ทันทีหลังจากระบบอัปเดต</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
        </Protected>
    )
}
