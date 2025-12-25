"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Protected from '@/components/auth/Protected';
import { Badge } from "@/components/ui/badge";
import {
    UserIcon,
    MailIcon,
    ShieldCheckIcon,
    CalendarIcon,
    Smartphone,
    CheckCircle,
    AlertTriangle
} from "lucide-react";
import { Label } from '@/components/ui/label';

export default function AccountPage() {
    const { user } = useAuth();

    return (
        <Protected>
            <main className='min-h-screen'>
                <div className='border-b'>
                    <div className='w-full p-3'>
                        <h1 className="text-lg font-medium">ข้อมูลบัญชี</h1>
                        <p className="text-muted-foreground text-xs">
                            ข้อมูลบัญชีและการตั้งค่าพื้นฐานของคุณ
                        </p>
                    </div>
                </div>

                <div className="border-b">
                    <div className='w-full p-3 space-y-3'>
                        <div>
                            <h1 className="flex items-center gap-2 text-base font-medium">
                                <UserIcon className="h-5 w-5" />
                                ข้อมูลบัญชี
                            </h1>
                            <p className='text-xs text-muted-foreground'>
                                ข้อมูลพื้นฐานของบัญชีและสถานะความปลอดภัย
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className='rounded-md border p-3 flex items-start gap-3'>
                                <div className='relative'>
                                    {user?.profile ? (
                                        <>
                                            <img
                                                src={user.profile}
                                                alt="โปรไฟล์"
                                                className="w-12 h-12 rounded-full object-cover border"
                                                onError={(e) => {
                                                    const img = e.currentTarget as HTMLImageElement;
                                                    const fallback = img.nextElementSibling as HTMLElement;
                                                    img.style.display = 'none';
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className='bg-zinc-100 p-2 rounded-full text-zinc-800 w-12 h-12 hidden items-center justify-center'>
                                                <UserIcon className='w-5 h-5' />
                                            </div>
                                        </>
                                    ) : (
                                        <div className='bg-zinc-100 p-2 rounded-full text-zinc-800 w-12 h-12 flex items-center justify-center'>
                                            <UserIcon className='w-5 h-5' />
                                        </div>
                                    )}
                                </div>
                                <div className='flex-1'>
                                    <Label className="text-xs font-medium text-gray-500">ชื่อผู้ใช้งาน</Label>
                                    <p className="text-sm font-medium text-black">{user?.username}</p>
                                </div>
                            </div>

                            <div className='rounded-md border p-3 flex items-start gap-3'>
                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800'>
                                    <MailIcon className='w-5 h-5' />
                                </div>
                                <div className='flex-1'>
                                    <Label className="text-xs font-medium text-gray-500">อีเมล</Label>
                                    <p className="text-sm font-medium text-black">{user?.email}</p>
                                </div>
                            </div>

                            <div className='rounded-md border p-3 flex items-start gap-3'>
                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800'>
                                    <ShieldCheckIcon className='w-5 h-5' />
                                </div>
                                <div className='flex-1'>
                                    <Label className="text-xs font-medium text-gray-500">ระดับผู้ใช้</Label>
                                    <Badge variant={user?.role === 1 ? "default" : "secondary"} className="text-sm">
                                        {user?.role === 1 ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                                    </Badge>
                                </div>
                            </div>

                            <div className='rounded-md border p-3 flex items-start gap-3'>
                                <div className='bg-zinc-100 p-2 rounded-md text-zinc-800'>
                                    <CalendarIcon className='w-5 h-5' />
                                </div>
                                <div className='flex-1'>
                                    <Label className="text-xs font-medium text-gray-500">วันที่สร้างบัญชี</Label>
                                    <p className="text-sm font-medium text-black" suppressHydrationWarning>
                                        {user?.time ? new Date(user.time).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'ไม่ระบุ'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b">
                    <div className='w-full p-3 space-y-3'>
                        <div>
                            <h1 className="flex items-center gap-2 text-base font-medium">
                                <Smartphone className="h-5 w-5" />
                                สถานะความปลอดภัย
                            </h1>
                            <p className='text-xs text-muted-foreground'>
                                ตรวจสอบระดับความปลอดภัยของบัญชีของคุณ
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-3 p-3 border rounded-md">
                                <div className='bg-green-100 p-2 rounded-md text-green-800'>
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">รหัสผ่าน</p>
                                    <p className="text-xs text-muted-foreground">ตั้งค่าแล้ว</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 border rounded-md ${user?.twoFactorEnabled ? '' : 'opacity-50'}`}>
                                {user?.twoFactorEnabled ? (
                                    <>
                                        <div className='bg-green-100 p-2 rounded-md text-green-800'>
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">การยืนยันตัวตน 2 ชั้น</p>
                                            <p className="text-xs text-muted-foreground">เปิดใช้งานแล้ว</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='bg-orange-100 p-2 rounded-md text-orange-800'>
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">การยืนยันตัวตน 2 ชั้น</p>
                                            <p className="text-xs text-muted-foreground">ยังไม่ได้ตั้งค่า</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-md">
                                <div className='bg-green-100 p-2 rounded-md text-green-800'>
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">อีเมล</p>
                                    <p className="text-xs text-muted-foreground">ยืนยันแล้ว</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Protected>
    )
}