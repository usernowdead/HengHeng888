"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from '../ui/button'
import { LogInIcon, User, UserPlusIcon, Mail, Lock, Eye, EyeOff, Check, X, Shield, QrCode, Smartphone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group'
import { Label } from '../ui/label'
import Turnstile from '../auth/Turnstile'

export default function SignInAndSignUp() {
    const { login } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Password visibility states
    const [showSignInPassword, setShowSignInPassword] = useState(false)
    const [showSignUpPassword, setShowSignUpPassword] = useState(false)
    const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false)

    // Form states
    const [signUpPassword, setSignUpPassword] = useState("")
    const [signUpData, setSignUpData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    })
    const [signInData, setSignInData] = useState({
        identifier: '',
        password: ''
    })

    // 2FA states
    const [twoFactorData, setTwoFactorData] = useState({
        userId: '',
        token: ''
    })
    const [showTwoFactor, setShowTwoFactor] = useState(false)
    const [activeTab, setActiveTab] = useState("tab-1")

    // Turnstile states
    const [loginTurnstileToken, setLoginTurnstileToken] = useState('')
    const [registerTurnstileToken, setRegisterTurnstileToken] = useState('')

    // QR Login states
    const [qrLoginData, setQrLoginData] = useState({
        sessionId: '',
        qrCode: '',
        expiresAt: '',
        status: 'idle' as 'idle' | 'generating' | 'waiting' | 'success' | 'expired' | 'error'
    })
    const [qrStatusInterval, setQrStatusInterval] = useState<NodeJS.Timeout | null>(null)

    // Turnstile callback functions
    const handleLoginTurnstileVerify = (token: string) => {
        setLoginTurnstileToken(token)
    }

    const handleRegisterTurnstileVerify = (token: string) => {
        setRegisterTurnstileToken(token)
    }

    const handleTurnstileError = () => {
        toast.error('การยืนยันไม่สำเร็จ กรุณาลองใหม่')
    }

    const handleTurnstileExpired = () => {
        // Reset token when expired
        if (activeTab === "tab-1") {
            setLoginTurnstileToken('')
        } else if (activeTab === "tab-2") {
            setRegisterTurnstileToken('')
        }
    }

    // Update active tab when 2FA state changes
    useEffect(() => {
        if (showTwoFactor) {
            setActiveTab("tab-3")
        } else if (activeTab === "tab-3") {
            setActiveTab("tab-1")
        }
    }, [showTwoFactor, activeTab])

    // Reset turnstile tokens when switching tabs
    useEffect(() => {
        if (activeTab === "tab-1") {
            setLoginTurnstileToken('')
        } else if (activeTab === "tab-2") {
            setRegisterTurnstileToken('')
        }
    }, [activeTab])

    const checkStrength = (pass: string) => {
        const requirements = [
            { regex: /.{8,}/, text: "อย่างน้อย 8 ตัวอักษร" },
            { regex: /[0-9]/, text: "อย่างน้อย 1 ตัวเลข" },
            { regex: /[a-z]/, text: "อย่างน้อย 1 ตัวอักษรพิมพ์เล็ก" },
            { regex: /[A-Z]/, text: "อย่างน้อย 1 ตัวอักษรพิมพ์ใหญ่" },
        ];

        return requirements.map((req) => ({
            met: req.regex.test(pass),
            text: req.text,
        }));
    };

    const strength = checkStrength(signUpPassword);

    const strengthScore = useMemo(() => {
        return strength.filter((req) => req.met).length;
    }, [strength]);

    const getStrengthColor = (score: number) => {
        if (score === 0) return "bg-border";
        if (score <= 1) return "bg-red-500";
        if (score <= 2) return "bg-orange-500";
        if (score === 3) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return "กรุณาป้อนรหัสผ่าน";
        if (score <= 2) return "รหัสผ่านอ่อน";
        if (score === 3) return "รหัสผ่านปานกลาง";
        return "รหัสผ่านแข็งแรง";
    };

    const verifyTurnstileToken = async (token: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/verify-turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token
                }),
            })

            const data = await response.json()
            return data.success
        } catch (error) {
            console.error('Turnstile verification error:', error)
            return false
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate Turnstile
        if (!loginTurnstileToken) {
            toast.error('กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์')
            return
        }

        setLoading(true)

        try {
            // Verify turnstile token first
            const isValidToken = await verifyTurnstileToken(loginTurnstileToken)
            if (!isValidToken) {
                toast.error('การยืนยันไม่สำเร็จ กรุณาลองใหม่')
                setLoginTurnstileToken('') // Reset token
                return
            }

            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for httpOnly token storage
                body: JSON.stringify({
                    ...signInData,
                    turnstileToken: loginTurnstileToken
                }),
            })

            const data = await response.json()

            if (data.success) {
                if (data.data.requiresTwoFactor) {
                    // Show 2FA input
                    setTwoFactorData({ userId: data.data.userId, token: '' })
                    setShowTwoFactor(true)
                    toast.info('กรุณาป้อนรหัส 2FA เพื่อเข้าสู่ระบบ')
                } else {
                    await login(data.data.token, data.data.user)
                    toast.success(data.message)
                    setLoginTurnstileToken('') // Reset token
                    router.push('/')
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        } finally {
            setLoading(false)
        }
    }

    const handleTwoFactorVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate 2FA token
        if (twoFactorData.token.length !== 6 || !/^\d{6}$/.test(twoFactorData.token)) {
            toast.error('กรุณาป้อนรหัส 2FA 6 หลัก')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/v1/auth/login/verify-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for httpOnly token storage
                body: JSON.stringify(twoFactorData),
            })

            const data = await response.json()

            if (data.success) {
                await login(data.data.token, data.data.user)
                toast.success(data.message)
                setShowTwoFactor(false)
                setTwoFactorData({ userId: '', token: '' })
                router.push('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการยืนยัน 2FA')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (signUpData.password !== signUpData.confirmPassword) {
            toast.error('รหัสผ่านไม่ตรงกัน')
            return
        }

        // Validate Turnstile
        if (!registerTurnstileToken) {
            toast.error('กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์')
            return
        }

        setLoading(true)

        try {
            // Verify turnstile token first
            const isValidToken = await verifyTurnstileToken(registerTurnstileToken)
            if (!isValidToken) {
                toast.error('การยืนยันไม่สำเร็จ กรุณาลองใหม่')
                setRegisterTurnstileToken('') // Reset token
                return
            }

            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for httpOnly token storage
                body: JSON.stringify({
                    ...signUpData,
                    turnstileToken: registerTurnstileToken
                }),
            })

            const data = await response.json()

            if (data.success) {
                await login(data.data.token, data.data.user)
                toast.success(data.message)
                setRegisterTurnstileToken('') // Reset token
                router.push('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก')
        } finally {
            setLoading(false)
        }
    }

    // QR Login functions
    const handleGenerateQR = async () => {
        setQrLoginData(prev => ({ ...prev, status: 'generating' }))

        try {
            const response = await fetch('/api/auth/qr/generate', {
                method: 'POST'
            })

            const data = await response.json()

            if (data.success) {
                setQrLoginData({
                    sessionId: data.sessionId,
                    qrCode: data.qrCode,
                    expiresAt: data.expiresAt,
                    status: 'waiting'
                })

                // Start polling for status
                startQrStatusPolling(data.sessionId)
            } else {
                toast.error(data.message || 'เกิดข้อผิดพลาดในการสร้าง QR Code')
                setQrLoginData(prev => ({ ...prev, status: 'error' }))
            }
        } catch (error) {
            console.error('QR generate error:', error)
            toast.error('เกิดข้อผิดพลาดในการสร้าง QR Code')
            setQrLoginData(prev => ({ ...prev, status: 'error' }))
        }
    }

    const startQrStatusPolling = (sessionId: string) => {
        // Clear any existing interval
        if (qrStatusInterval) {
            clearInterval(qrStatusInterval)
        }

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/auth/qr/status/${sessionId}`)
                const data = await response.json()

                if (data.success) {
                    if (data.status === 'verified' && data.token && data.user) {
                        // Login successful
                        setQrLoginData(prev => ({ ...prev, status: 'success' }))
                        await login(data.token, data.user)
                        toast.success('เข้าสู่ระบบสำเร็จ')
                        router.push('/')
                        clearInterval(interval)
                    } else if (data.status === 'expired') {
                        // QR expired
                        setQrLoginData(prev => ({ ...prev, status: 'expired' }))
                        toast.error('QR Code หมดอายุ กรุณาสร้างใหม่')
                        clearInterval(interval)
                    }
                    // For 'scanned' status, continue polling
                }
            } catch (error) {
                console.error('QR status check error:', error)
            }
        }, 2000) // Check every 2 seconds

        setQrStatusInterval(interval)

        // Auto expire after QR expires
        const expiresAt = new Date(qrLoginData.expiresAt)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()

        setTimeout(() => {
            if (qrLoginData.status === 'waiting') {
                setQrLoginData(prev => ({ ...prev, status: 'expired' }))
                clearInterval(interval)
            }
        }, timeUntilExpiry)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (qrStatusInterval) {
                clearInterval(qrStatusInterval)
            }
        }
    }, [qrStatusInterval])

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant={'default'} size="sm" className='font-normal cursor-pointer h-8 px-1.5 sm:px-2 md:px-3 flex items-center gap-0.5 sm:gap-1'>
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className='text-[10px] sm:text-xs font-medium whitespace-nowrap hidden sm:inline'>เข้าสู่ระบบ</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className='w-[95vw] max-w-sm p-4 sm:p-6 overflow-auto'>
                    <DialogTitle className="sr-only">เข้าสู่ระบบ / สมัครสมาชิก</DialogTitle>
                    <div>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <ScrollArea>
                                <TabsList className={`-space-x-px w-full mb-3 h-auto bg-background p-0 shadow-xs rtl:space-x-reverse ${showTwoFactor ? 'hidden' : ''}`}>
                                    <TabsTrigger
                                        className="relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                                        value="tab-1"
                                    >
                                        <LogInIcon
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        เข้าสู่ระบบ
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                                        value="tab-4"
                                    >
                                        <QrCode
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        QR เข้าสู่ระบบ
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                                        value="tab-2"
                                    >
                                        <UserPlusIcon
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        สมัครสมาชิก
                                    </TabsTrigger>
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            <TabsContent value="tab-1">
                                <div>
                                    <h4 className='text-base font-medium text-center'>
                                        เข้าสู่ระบบ
                                    </h4>
                                    <p className='text-xs text-muted-foreground text-center'>
                                        กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                                    </p>
                                </div>
                                <div>
                                    <form className='space-y-3' onSubmit={handleLogin}>
                                        <div className='space-y-1'>
                                            <Label>ชื่อผู้ใช้งานหรืออีเมล</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <User className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type='text'
                                                    placeholder='ชื่อผู้ใช้งานหรืออีเมล'
                                                    value={signInData.identifier}
                                                    onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                                                    required
                                                />
                                            </InputGroup>
                                        </div>
                                        <div className='space-y-1'>
                                            <Label>รหัสผ่าน</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <Lock className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type={showSignInPassword ? 'text' : 'password'}
                                                    placeholder='รหัสผ่าน'
                                                    value={signInData.password}
                                                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                                    required
                                                />
                                                <InputGroupButton
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                                                >
                                                    {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </InputGroupButton>
                                            </InputGroup>
                                        </div>
                                        {activeTab === "tab-1" && (
                                            <div className='space-y-1'>
                                                <Turnstile
                                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                                    onVerify={handleLoginTurnstileVerify}
                                                    onError={handleTurnstileError}
                                                    onExpired={handleTurnstileExpired}
                                                />
                                            </div>
                                        )}
                                        <div className='space-y-1'>
                                            <Button
                                                variant={'default'}
                                                className='w-full cursor-pointer font-normal'
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                            </Button>
                                        </div>
                                        <div className='space-y-1'>
                                            <p className='text-xs text-muted-foreground text-center'>
                                                ยังไม่มีบัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-4">
                                <div>
                                    <h4 className='text-base font-medium text-center'>
                                        เข้าสู่ระบบด้วย QR Code
                                    </h4>
                                    <p className='text-xs text-muted-foreground text-center'>
                                        สแกน QR Code จากอุปกรณ์อื่นที่เข้าสู่ระบบไว้แล้ว
                                    </p>
                                </div>
                                <div className='space-y-4'>
                                    {qrLoginData.status === 'idle' && (
                                        <div className='text-center space-y-4'>
                                            <Smartphone className='w-16 h-16 mx-auto text-muted-foreground' />
                                            <p className='text-sm text-muted-foreground'>
                                                เริ่มการเข้าสู่ระบบด้วย QR Code
                                            </p>
                                            <Button
                                                onClick={handleGenerateQR}
                                                className='w-full'
                                            >
                                                <QrCode className="w-4 h-4 mr-2" />
                                                สร้าง QR Code
                                            </Button>
                                        </div>
                                    )}

                                    {(qrLoginData.status === 'generating' || qrLoginData.status === 'waiting') && (
                                        <div className='text-center space-y-4'>
                                            {qrLoginData.qrCode && (
                                                <div className='flex justify-center'>
                                                    <img
                                                        src={qrLoginData.qrCode}
                                                        alt="QR Code for login"
                                                        className='w-48 h-48'
                                                    />
                                                </div>
                                            )}

                                            <div className='space-y-2'>
                                                <p className='text-sm font-medium'>
                                                    สแกน QR Code นี้ด้วยอุปกรณ์อื่น
                                                </p>
                                                <p className='text-xs text-muted-foreground'>
                                                    {qrLoginData.status === 'waiting' ? 'กำลังรอการสแกน...' : 'กำลังสร้าง QR Code...'}
                                                </p>

                                                {qrLoginData.expiresAt && (
                                                    <p className='text-xs text-orange-600'>
                                                        หมดอายุใน: {Math.max(0, Math.floor((new Date(qrLoginData.expiresAt).getTime() - Date.now()) / 1000))} วินาที
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setQrLoginData({
                                                        sessionId: '',
                                                        qrCode: '',
                                                        expiresAt: '',
                                                        status: 'idle'
                                                    })
                                                    if (qrStatusInterval) {
                                                        clearInterval(qrStatusInterval)
                                                    }
                                                }}
                                                className='w-full'
                                            >
                                                ยกเลิก
                                            </Button>
                                        </div>
                                    )}

                                    {qrLoginData.status === 'expired' && (
                                        <div className='text-center space-y-4'>
                                            <X className='w-16 h-16 mx-auto text-red-500' />
                                            <p className='text-sm text-red-600'>
                                                QR Code หมดอายุแล้ว
                                            </p>
                                            <Button
                                                onClick={handleGenerateQR}
                                                className='w-full'
                                            >
                                                <QrCode className="w-4 h-4 mr-2" />
                                                สร้าง QR Code ใหม่
                                            </Button>
                                        </div>
                                    )}

                                    {qrLoginData.status === 'error' && (
                                        <div className='text-center space-y-4'>
                                            <X className='w-16 h-16 mx-auto text-red-500' />
                                            <p className='text-sm text-red-600'>
                                                เกิดข้อผิดพลาดในการสร้าง QR Code
                                            </p>
                                            <Button
                                                onClick={handleGenerateQR}
                                                className='w-full'
                                            >
                                                ลองใหม่
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-3">
                                <div>
                                    <h4 className='text-base font-medium text-center'>
                                        ยืนยันรหัส 2FA
                                    </h4>
                                    <p className='text-xs text-muted-foreground text-center'>
                                        กรุณาป้อนรหัส 6 หลักจากแอพ Google Authenticator หรือ Authenticator ที่คุณใช้
                                    </p>
                                </div>
                                <div className='mt-3'>
                                    <form className='space-y-3' onSubmit={handleTwoFactorVerify}>
                                        <div className='space-y-1'>
                                            <Label>รหัส 2FA</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <Shield className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type='text'
                                                    placeholder='000000'
                                                    value={twoFactorData.token}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '') // Only allow digits
                                                        if (value.length <= 6) {
                                                            setTwoFactorData({ ...twoFactorData, token: value })
                                                        }
                                                    }}
                                                    maxLength={6}
                                                    pattern='\d{6}'
                                                    inputMode='numeric'
                                                    required
                                                />
                                            </InputGroup>
                                        </div>
                                        <div className='space-y-1'>
                                            <Button
                                                variant={'default'}
                                                className='w-full cursor-pointer font-normal'
                                                type="submit"
                                                disabled={loading || twoFactorData.token.length !== 6}
                                            >
                                                {loading ? 'กำลังยืนยัน...' : 'ยืนยันรหัส 2FA'}
                                            </Button>
                                        </div>
                                        <div className='space-y-1'>
                                            <Button
                                                variant={'ghost'}
                                                className='w-full cursor-pointer font-normal'
                                                type="button"
                                                onClick={() => {
                                                    setShowTwoFactor(false)
                                                    setTwoFactorData({ userId: '', token: '' })
                                                    setActiveTab("tab-1")
                                                    // Reset sign in form as well
                                                    setSignInData({ identifier: '', password: '' })
                                                }}
                                            >
                                                ยกเลิก
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <div>
                                    <h4 className='text-base font-medium text-center'>
                                        สมัครสมาชิก
                                    </h4>
                                    <p className='text-xs text-muted-foreground text-center'>
                                        กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
                                    </p>
                                </div>
                                <div>
                                    <form className='space-y-3' onSubmit={handleRegister}>
                                        <div className='space-y-1'>
                                            <Label>อีเมล</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <Mail className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type='email'
                                                    placeholder='อีเมล'
                                                    value={signUpData.email}
                                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                                    required
                                                />
                                            </InputGroup>
                                        </div>
                                        <div className='space-y-1'>
                                            <Label>ชื่อผู้ใช้งาน</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <User className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type='text'
                                                    placeholder='ชื่อผู้ใช้งาน'
                                                    value={signUpData.username}
                                                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                                                    required
                                                />
                                            </InputGroup>
                                        </div>
                                        <div className='space-y-1'>
                                            <Label>รหัสผ่าน</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <Lock className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type={showSignUpPassword ? 'text' : 'password'}
                                                    placeholder='รหัสผ่าน'
                                                    value={signUpData.password}
                                                    onChange={(e) => {
                                                        setSignUpData({ ...signUpData, password: e.target.value })
                                                        setSignUpPassword(e.target.value)
                                                    }}
                                                    required
                                                />
                                                <InputGroupButton
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                                >
                                                    {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </InputGroupButton>
                                            </InputGroup>

                                            {/* Password strength indicator */}
                                            {signUpPassword && (
                                                <div className="space-y-2 mt-2">
                                                    <div
                                                        aria-label="ความแข็งแรงของรหัสผ่าน"
                                                        aria-valuemax={4}
                                                        aria-valuemin={0}
                                                        aria-valuenow={strengthScore}
                                                        className="h-1 w-full overflow-hidden rounded-full bg-border"
                                                        role="progressbar"
                                                        tabIndex={-1}
                                                    >
                                                        <div
                                                            className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                                                            style={{ width: `${(strengthScore / 4) * 100}%` }}
                                                        />
                                                    </div>

                                                    {/* Password strength description */}
                                                    <p className="font-medium text-foreground text-sm">
                                                        {getStrengthText(strengthScore)}. ต้องประกอบด้วย:
                                                    </p>

                                                    {/* Password requirements list */}
                                                    <ul aria-label="ข้อกำหนดรหัสผ่าน" className="space-y-1.5">
                                                        {strength.map((req, index) => (
                                                            <li className="flex items-center gap-2" key={req.text}>
                                                                {req.met ? (
                                                                    <Check
                                                                        aria-hidden="true"
                                                                        className="text-emerald-500"
                                                                        size={16}
                                                                    />
                                                                ) : (
                                                                    <X
                                                                        aria-hidden="true"
                                                                        className="text-muted-foreground/80"
                                                                        size={16}
                                                                    />
                                                                )}
                                                                <span
                                                                    className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                                                                >
                                                                    {req.text}
                                                                    <span className="sr-only">
                                                                        {req.met ? " - ตรงตามข้อกำหนด" : " - ไม่ตรงตามข้อกำหนด"}
                                                                    </span>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className='space-y-1'>
                                            <Label>ยืนยันรหัสผ่าน</Label>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <Lock className="size-4" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                                                    placeholder='ยืนยันรหัสผ่าน'
                                                    value={signUpData.confirmPassword}
                                                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                                    required
                                                />
                                                <InputGroupButton
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                                                >
                                                    {showSignUpConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </InputGroupButton>
                                            </InputGroup>
                                        </div>
                                        {activeTab === "tab-2" && (
                                            <div className='space-y-1'>
                                                <Turnstile
                                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                                    onVerify={handleRegisterTurnstileVerify}
                                                    onError={handleTurnstileError}
                                                    onExpired={handleTurnstileExpired}
                                                />
                                            </div>
                                        )}
                                        <div className='space-y-1'>
                                            <Button
                                                variant={'default'}
                                                className='w-full cursor-pointer font-normal'
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                                            </Button>
                                        </div>
                                        <div className='space-y-1'>
                                            <p className='text-xs text-muted-foreground text-center'>
                                                กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}