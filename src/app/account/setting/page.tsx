"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Protected from '@/components/auth/Protected';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
    UserIcon,
    ImageIcon,
    Save,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

export default function SettingPage() {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        profile: user?.profile || ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!profileData.username.trim()) {
            toast.error('กรุณากรอกชื่อผู้ใช้งาน');
            return;
        }

        if (profileData.username.length < 3) {
            toast.error('ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร');
            return;
        }

        if (profileData.username.length > 30) {
            toast.error('ชื่อผู้ใช้งานต้องไม่เกิน 30 ตัวอักษร');
            return;
        }

        // Validate profile URL if provided
        if (profileData.profile.trim()) {
            try {
                const url = new URL(profileData.profile.trim());
                if (!['http:', 'https:'].includes(url.protocol)) {
                    toast.error('URL รูปโปรไฟล์ต้องเป็น HTTP หรือ HTTPS');
                    return;
                }
            } catch {
                toast.error('URL รูปโปรไฟล์ไม่ถูกต้อง');
                return;
            }
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    username: profileData.username.trim(),
                    profile: profileData.profile.trim() || null
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('อัปเดตข้อมูลส่วนตัวสำเร็จ');
                // Update user data in context
                if (user) {
                    const updatedUser = { ...user, ...data.data.user };
                    // Get current token and update user data
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        await login(token, updatedUser);
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return profileData.username !== (user?.username || '') ||
            profileData.profile !== (user?.profile || '');
    };

    return (
        <Protected>
            <main className='min-h-screen'>
                <div className='border-b'>
                    <div className='w-full p-3'>
                        <h1 className="text-lg font-medium">การตั้งค่า</h1>
                        <p className="text-muted-foreground text-xs">
                            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
                        </p>
                    </div>
                </div>

                <div className="border-b">
                    <div className='w-full p-3 space-y-3'>
                        <div>
                            <h1 className="flex items-center gap-2 text-base font-medium">
                                <UserIcon className="h-5 w-5" />
                                ข้อมูลส่วนตัว
                            </h1>
                            <p className='text-xs text-muted-foreground'>
                                แก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ
                            </p>
                        </div>

                        <div className='rounded-md border p-3'>
                            <div>
                                <h3 className="flex items-center gap-2 text-base font-medium">
                                    <UserIcon className="h-4 w-4" />
                                    แก้ไขข้อมูลส่วนตัว
                                </h3>
                                <p className='text-xs text-muted-foreground'>
                                    อัปเดตข้อมูลส่วนตัวของคุณ
                                </p>
                            </div>
                            <div className="space-y-3 mt-3">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className='rounded-md border p-3 flex items-start gap-3 bg-muted/50'>
                                        <div className='bg-zinc-100 p-2 rounded-md text-zinc-800'>
                                            <UserIcon className='w-4 h-4' />
                                        </div>
                                        <div className='flex-1'>
                                            <Label className="text-xs font-medium text-gray-500">ชื่อผู้ใช้งานปัจจุบัน</Label>
                                            <p className="text-sm font-medium text-black">{user?.username}</p>
                                        </div>
                                    </div>

                                    {user?.profile && (
                                        <div className='rounded-md border p-3 flex items-start gap-3 bg-muted/50'>
                                            <div className='bg-zinc-100 p-2 rounded-md text-zinc-800'>
                                                <ImageIcon className='w-4 h-4' />
                                            </div>
                                            <div className='flex-1'>
                                                <Label className="text-xs font-medium text-gray-500">รูปโปรไฟล์ปัจจุบัน</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <img
                                                        src={user.profile}
                                                        alt="Current profile"
                                                        className="w-8 h-8 rounded-full object-cover border"
                                                    />
                                                    <span className="text-xs text-muted-foreground truncate flex-1">
                                                        {user.profile}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">แก้ไขข้อมูล</h3>

                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className='font-normal' htmlFor="username">ชื่อผู้ใช้งาน *</Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="กรุณากรอกชื่อผู้ใช้งาน"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    username: e.target.value
                                                })}
                                                required
                                                maxLength={30}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                3-30 ตัวอักษร
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className='font-normal' htmlFor="profile">รูปโปรไฟล์ (URL)</Label>
                                            <Input
                                                id="profile"
                                                type="url"
                                                placeholder="https://example.com/avatar.jpg"
                                                value={profileData.profile}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    profile: e.target.value
                                                })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                URL รูปภาพสำหรับโปรไฟล์ (ไม่บังคับ)
                                            </p>
                                        </div>

                                        {profileData.profile && (
                                            <div className="space-y-2">
                                                <Label className='font-normal'>ตัวอย่างรูปโปรไฟล์</Label>
                                                <div className="flex items-center gap-3 p-3 border rounded-md">
                                                    <img
                                                        src={profileData.profile}
                                                        alt="Profile preview"
                                                        className="w-12 h-12 rounded-full object-cover border"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">รูปโปรไฟล์</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            ตัวอย่างการแสดงผล
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Separator />

                                        <div className="flex gap-2">
                                            <Button
                                                className='flex-1 cursor-pointer'
                                                type="submit"
                                                disabled={loading || !hasChanges()}
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                            </Button>
                                            {hasChanges() && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className='flex-1 cursor-pointer'
                                                    onClick={() => setProfileData({
                                                        username: user?.username || '',
                                                        profile: user?.profile || ''
                                                    })}
                                                    disabled={loading}
                                                >
                                                    ยกเลิกการเปลี่ยนแปลง
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {hasChanges() && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก กรุณากดบันทึกเพื่ออัปเดตข้อมูล
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </main>
        </Protected>
    );
}