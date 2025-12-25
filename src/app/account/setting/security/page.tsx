"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StripedPattern } from "@/components/magicui/striped-pattern"
import { BoxIcon, CalendarIcon, HouseIcon, KeyIcon, LogOutIcon, MailIcon, PanelsTopLeftIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Shield,
    Key,
    Smartphone,
    Mail,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Save,
    Trash2,
    User,
    QrCode,
    Copy,
    Scan,
    Monitor
} from 'lucide-react';
import { QRScanner } from '@/components/qr-scanner';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Protected from '@/components/auth/Protected';

export default function SecurityPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // 2FA states
    const [twoFactorData, setTwoFactorData] = useState({
        secret: '',
        qrCodeUrl: '',
        otpauth_url: '',
        token: ''
    });
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
    const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [scannedSessionId, setScannedSessionId] = useState<string | null>(null);
    const [showQrConfirmDialog, setShowQrConfirmDialog] = useState(false);
    const [qrConfirmData, setQrConfirmData] = useState({
        sessionId: '',
        twoFactorToken: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupTwoFactor = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
            });

            const data = await response.json();

            if (data.success) {
                setTwoFactorData({
                    secret: data.data.secret,
                    qrCodeUrl: data.data.qrCodeUrl,
                    otpauth_url: data.data.otpauth_url,
                    token: ''
                });
                setShowTwoFactorSetup(true);
                toast.success('สร้าง QR Code สำเร็จ');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการตั้งค่า 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTwoFactor = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    secret: twoFactorData.secret,
                    token: twoFactorData.token
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowTwoFactorSetup(false);
                setTwoFactorData({ secret: '', qrCodeUrl: '', otpauth_url: '', token: '' });
                toast.success('เปิดใช้งาน 2FA สำเร็จ');
                // Refresh user data
                window.location.reload();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการยืนยัน 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableTwoFactor = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
            });

            const data = await response.json();

            if (data.success) {
                setShowTwoFactorDisable(false);
                toast.success('ปิดใช้งาน 2FA สำเร็จ');
                // Refresh user data
                window.location.reload();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการปิดใช้งาน 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleCopySecret = () => {
        navigator.clipboard.writeText(twoFactorData.secret);
        toast.success('คัดลอก Secret สำเร็จ');
    };

    const handleLogoutAllDevices = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth/logout-all', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success('ออกจากระบบทุกอุปกรณ์สำเร็จ');
                setShowLogoutDialog(false);
                // Force logout current session
                localStorage.removeItem('auth_token');
                window.location.href = '/';
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
        } finally {
            setLoading(false);
        }
    };

    // QR Scanner functions
    const handleQrScan = async (qrData: string) => {
        try {
            const response = await fetch('/api/auth/qr/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ qrData })
            });

            const data = await response.json();

            if (data.success) {
                setScannedSessionId(data.sessionId);
                setQrConfirmData({ sessionId: data.sessionId, twoFactorToken: '' });
                setShowQrScanner(false);
                setShowQrConfirmDialog(true);
                toast.success('QR Code สแกนสำเร็จ');
            } else {
                toast.error(data.message || 'QR Code ไม่ถูกต้องหรือหมดอายุ');
            }
        } catch (error) {
            console.error('QR scan error:', error);
            toast.error('เกิดข้อผิดพลาดในการสแกน QR Code');
        }
    };

    const handleQrVerify = async () => {
        setLoading(true);

        try {
            const requestBody: any = {
                sessionId: qrConfirmData.sessionId
            };

            // Include 2FA token if user has 2FA enabled
            if (user?.twoFactorEnabled) {
                if (!qrConfirmData.twoFactorToken) {
                    toast.error('กรุณาป้อนรหัส 2FA');
                    return;
                }
                requestBody.twoFactorToken = qrConfirmData.twoFactorToken;
            }

            const response = await fetch('/api/auth/qr/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('เข้าสู่ระบบสำเร็จ! อุปกรณ์อื่นได้เข้าสู่ระบบแล้ว');
                setShowQrConfirmDialog(false);
                setQrConfirmData({ sessionId: '', twoFactorToken: '' });
            } else {
                toast.error(data.message || 'การยืนยันล้มเหลว');
            }
        } catch (error) {
            console.error('QR verify error:', error);
            toast.error('เกิดข้อผิดพลาดในการยืนยัน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Protected>
            <main className='min-h-screen'>
                <div className='border-b'>
                    <div className='w-full p-3'>
                        <h1 className="text-lg font-medium">ความปลอดภัยของบัญชี</h1>
                        <p className="text-muted-foreground text-xs">
                            จัดการการตั้งค่าความปลอดภัยและข้อมูลส่วนตัวของคุณ
                        </p>
                    </div>
                </div>
                <div className="border-b">
                    <div className='w-full p-3 space-y-3'>
                        <div>
                            <h1 className="flex items-center gap-2 text-base font-medium">
                                <Shield className="h-5 w-5" />
                                สถานะความปลอดภัย
                            </h1>
                            <p className='text-xs text-muted-foreground'>
                                ตรวจสอบระดับความปลอดภัยของบัญชีของคุณ
                            </p>
                        </div>
                        <div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-3 p-3 border rounded-md">

                                    <div>
                                        <p className="font-medium text-sm">รหัสผ่าน</p>
                                        <p className="text-xs text-muted-foreground">ตั้งค่าแล้ว</p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 p-3 border rounded-md ${user?.twoFactorEnabled ? '' : 'opacity-50 select-none relative'}`}>
                                    {user?.twoFactorEnabled ? (
                                        <>
                                            <div>
                                                <p className="font-medium text-sm">การยืนยันตัวตน 2 ชั้น</p>
                                                <p className="text-xs text-muted-foreground">เปิดใช้งานแล้ว</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <StripedPattern className='opacity-50' />
                                            <div className='relative'>
                                                <p className="font-medium text-sm">การยืนยันตัวตน 2 ชั้น</p>
                                                <p className="text-xs text-muted-foreground">ยังไม่ได้ตั้งค่า</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 p-3 border rounded-md">

                                    <div>
                                        <p className="font-medium text-sm">อีเมล</p>
                                        <p className="text-xs text-muted-foreground">ยืนยันแล้ว</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="border-b">
                    <div className='w-full p-3 space-y-3'>
                        <Tabs defaultValue="tab-1">
                            <ScrollArea>
                                <TabsList className="mb-3 w-full">
                                    <TabsTrigger value="tab-1">
                                        <KeyIcon
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        เปลี่ยนรหัสผ่าน
                                    </TabsTrigger>
                                    <TabsTrigger className="group" value="tab-2">
                                        <UserIcon
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        ข้อมูลบัญชี
                                        <Badge
                                            className="ms-1.5 min-w-5 bg-primary/15 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                                            variant="secondary"
                                        >
                                            3
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger className="group" value="tab-3">
                                        <Smartphone
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        2FA
                                        {user?.twoFactorEnabled && (
                                            <Badge
                                                variant="secondary"
                                            >
                                                เปิดใช้งานแล้ว
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger className="group" value="tab-5">
                                        <Scan
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        QR เข้าสู่ระบบ
                                        <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
                                            New
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger className="group" value="tab-4">
                                        <LogOutIcon
                                            aria-hidden="true"
                                            className="-ms-0.5 me-1.5 opacity-60"
                                            size={16}
                                        />
                                        การจัดการเซสชัน
                                        <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
                                            New
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            <TabsContent value="tab-1">
                                <div className='space-y-3'>
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-medium">
                                            <Key className="h-5 w-5" />
                                            เปลี่ยนรหัสผ่าน
                                        </h2>
                                        <p className='text-xs text-muted-foreground'>
                                            เปลี่ยนรหัสผ่านเพื่อเพิ่มความปลอดภัยให้กับบัญชีของคุณ
                                        </p>
                                    </div>
                                    <div>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className='font-normal' htmlFor="current-password">รหัสผ่านปัจจุบัน</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current-password"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        placeholder="กรุณาป้อนรหัสผ่านปัจจุบัน"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            currentPassword: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className='font-normal' htmlFor="new-password">รหัสผ่านใหม่</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="new-password"
                                                        type={showNewPassword ? "text" : "password"}
                                                        placeholder="กรุณาป้อนรหัสผ่านใหม่"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            newPassword: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className='font-normal' htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirm-password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="กรุณายืนยันรหัสผ่านใหม่"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            confirmPassword: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button className='w-full cursor-pointer' type="submit" disabled={loading}>
                                                    <Save className="h-4 w-4" />
                                                    {loading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <div className='space-y-3'>
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-medium">
                                            <User className="h-5 w-5" />
                                            ข้อมูลบัญชี
                                        </h2>
                                        <p className='text-xs text-muted-foreground'>
                                            ข้อมูลพื้นฐานของบัญชีของคุณ
                                        </p>
                                    </div>
                                    <div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className='rounded-md border p-2 flex items-start gap-2'>
                                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800 '>
                                                    <UserIcon className='w-6 h-6' />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">ชื่อผู้ใช้งาน</Label>
                                                    <p className="text-sm text-black">{user?.username}</p>
                                                </div>
                                            </div>
                                            <div className='rounded-md border p-2 flex items-start gap-2'>
                                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800 '>
                                                    <MailIcon className='w-6 h-6' />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">อีเมล</Label>
                                                    <p className="text-sm text-black">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className='rounded-md border p-2 flex items-start gap-2'>
                                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800 '>
                                                    <ShieldCheckIcon className='w-6 h-6' />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">ระดับผู้ใช้</Label>
                                                    <Badge variant={user?.role === 1 ? "default" : "secondary"} className="text-sm text-black">
                                                        {user?.role === 1 ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className='rounded-md border p-2 flex items-start gap-2'>
                                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800 '>
                                                    <CalendarIcon className='w-6 h-6' />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">วันที่สร้างบัญชี</Label>
                                                    <p className="text-sm text-black">
                                                        {user?.time ? new Date(user.time).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-3">
                                <div className='space-y-3'>
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-medium">
                                            <Smartphone className="h-5 w-5" />
                                            การยืนยันตัวตน 2 ชั้น (2FA)
                                        </h2>
                                        <p className='text-xs text-muted-foreground'>
                                            เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วย Google Authenticator
                                        </p>
                                    </div>
                                    <div>
                                        {user?.twoFactorEnabled ? (
                                            <div className="space-y-4">
                                                <Alert>
                                                    <CheckCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        การยืนยันตัวตน 2 ชั้นเปิดใช้งานแล้ว
                                                    </AlertDescription>
                                                </Alert>
                                                <div className="flex gap-2">
                                                    <Button
                                                        className='w-full cursor-pointer'
                                                        variant="destructive"
                                                        onClick={() => setShowTwoFactorDisable(true)}
                                                        disabled={loading}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        ปิดใช้งาน 2FA
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Alert>
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        การยืนยันตัวตน 2 ชั้นยังไม่ได้เปิดใช้งาน
                                                    </AlertDescription>
                                                </Alert>
                                                <div className="flex gap-2">
                                                    <Button
                                                        className='w-full cursor-pointer'
                                                        onClick={handleSetupTwoFactor}
                                                        disabled={loading}
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                        เปิดใช้งาน 2FA
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-4">
                                <div className='space-y-3'>
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-medium">
                                            <Smartphone className="h-5 w-5" />
                                            การจัดการเซสชัน
                                        </h2>
                                        <p className='text-xs text-muted-foreground'>
                                            จัดการอุปกรณ์ที่เข้าสู่ระบบด้วยบัญชีนี้
                                        </p>
                                    </div>
                                    <div>
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                การออกจากระบบทุกอุปกรณ์จะทำให้คุณต้องเข้าสู่ระบบใหม่ในทุกที่
                                            </AlertDescription>
                                        </Alert>

                                        <div className="mt-4">
                                            <Button
                                                variant="destructive"
                                                className='w-full cursor-pointer'
                                                onClick={() => setShowLogoutDialog(true)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                ออกจากระบบทุกอุปกรณ์
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-5">
                                <div className='space-y-3'>
                                    <div>
                                        <h2 className="flex items-center gap-2 text-base font-medium">
                                            <Scan className="h-5 w-5" />
                                            QR เข้าสู่ระบบ
                                        </h2>
                                        <p className='text-xs text-muted-foreground'>
                                            สแกน QR Code เพื่ออนุญาตให้อุปกรณ์อื่นเข้าสู่ระบบ
                                        </p>
                                    </div>
                                    <div>
                                        {!showQrScanner ? (
                                            <div className="space-y-4">
                                                <div className="text-center py-8 space-y-4">
                                                    <Monitor className="w-16 h-16 mx-auto text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">พร้อมสแกน QR Code</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            เปิดกล้องเพื่อสแกน QR Code จากอุปกรณ์อื่น
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        className='flex-1 cursor-pointer'
                                                        onClick={() => setShowQrScanner(true)}
                                                    >
                                                        <Scan className="w-4 h-4 mr-2" />
                                                        เปิดสแกนเนอร์
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <QRScanner
                                                onScanSuccess={handleQrScan}
                                                onClose={() => setShowQrScanner(false)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* 2FA Setup Dialog */}
                <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>เปิดใช้งาน 2FA</DialogTitle>
                            <DialogDescription>
                                สแกน QR Code นี้ด้วยแอพ Google Authenticator หรือแอพ 2FA อื่นๆ
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {twoFactorData.qrCodeUrl && (
                                <div className="flex justify-center">
                                    <img
                                        src={twoFactorData.qrCodeUrl}
                                        alt="2FA QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Secret Key (สำรอง)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={twoFactorData.secret}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopySecret}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>รหัส 6 หลักจากแอพ</Label>
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        value={twoFactorData.token}
                                        onChange={(e) => setTwoFactorData({
                                            ...twoFactorData,
                                            token: e.target.value.replace(/\D/g, '').slice(0, 6)
                                        })}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowTwoFactorSetup(false);
                                            setTwoFactorData({ secret: '', qrCodeUrl: '', otpauth_url: '', token: '' });
                                        }}
                                        disabled={loading}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" disabled={loading || twoFactorData.token.length !== 6}>
                                        {loading ? 'กำลังเปิดใช้งาน...' : 'เปิดใช้งาน 2FA'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 2FA Disable Dialog */}
                <Dialog open={showTwoFactorDisable} onOpenChange={setShowTwoFactorDisable}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>ปิดใช้งาน 2FA</DialogTitle>
                            <DialogDescription>
                                คุณต้องการปิดใช้งานการยืนยันตัวตน 2 ชั้นหรือไม่? การดำเนินการนี้จะทำให้บัญชีของคุณมีความเสี่ยงมากขึ้น
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowTwoFactorDisable(false)}
                                disabled={loading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDisableTwoFactor}
                                disabled={loading}
                            >
                                {loading ? 'กำลังปิดใช้งาน...' : 'ปิดใช้งาน 2FA'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Logout Confirmation Dialog */}
                <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>ยืนยันการออกจากระบบ</DialogTitle>
                            <DialogDescription>
                                คุณต้องการออกจากระบบทุกอุปกรณ์หรือไม่? การดำเนินการนี้จะทำให้คุณต้องเข้าสู่ระบบใหม่ในทุกอุปกรณ์ที่ใช้งานบัญชีนี้
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutDialog(false)}
                                disabled={loading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogoutAllDevices}
                                disabled={loading}
                            >
                                {loading ? 'กำลังออกจากระบบ...' : 'ยืนยันการออกจากระบบ'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* QR Login Confirmation Dialog */}
                <Dialog open={showQrConfirmDialog} onOpenChange={setShowQrConfirmDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                ยืนยันการเข้าสู่ระบบ
                            </DialogTitle>
                            <DialogDescription>
                                อุปกรณ์อื่นต้องการเข้าสู่ระบบด้วยบัญชีนี้
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium">อุปกรณ์ใหม่</p>
                                        <p className="text-sm text-muted-foreground">
                                            Chrome บน Windows • {new Date().toLocaleTimeString('th-TH')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 2FA Input if enabled */}
                            {user?.twoFactorEnabled && (
                                <div className="space-y-2">
                                    <Label className='font-normal flex items-center gap-2'>
                                        <Shield className="w-4 h-4" />
                                        รหัส 2FA (6 หลัก)
                                    </Label>
                                    <input
                                        type="text"
                                        value={qrConfirmData.twoFactorToken}
                                        onChange={(e) => setQrConfirmData(prev => ({
                                            ...prev,
                                            twoFactorToken: e.target.value.replace(/\D/g, '').slice(0, 6)
                                        }))}
                                        className="w-full p-2 border rounded-md text-center text-lg font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        ป้อนรหัสจากแอพ Google Authenticator
                                    </p>
                                </div>
                            )}

                            <div className="text-sm text-muted-foreground">
                                <p>ตรวจสอบให้แน่ใจว่าคุณรู้จักอุปกรณ์นี้</p>
                                <p>การยืนยันนี้จะอนุญาตให้อุปกรณ์เข้าถึงบัญชีของคุณ</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowQrConfirmDialog(false);
                                    setQrConfirmData({ sessionId: '', twoFactorToken: '' });
                                }}
                                disabled={loading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleQrVerify}
                                disabled={loading || (user?.twoFactorEnabled && qrConfirmData.twoFactorToken.length !== 6)}
                            >
                                {loading ? 'กำลังยืนยัน...' : 'อนุญาตเข้าสู่ระบบ'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </Protected>
    );
}