"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, User, CreditCard, Star, TrendingUp, Users, UserPlus, Mail, MessageSquare, MoreHorizontal, FileText, Wrench, Code, Home, ShoppingBag, Package, ChevronDown, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext'
import SignInAndSignUp from './signinandsignup/SignInAndSignUp'
import SearchNav from './SearchNav'

export default function NavBarComponents() {
    const { isAuth, user, logout } = useAuth()
    const { settings } = useWebsiteSettings()

    return (
        <nav className='border-b bg-white sticky top-0 z-50 w-full relative'>
            <div className='w-full max-w-[480px] mx-auto px-2 sm:px-3 py-2'>
                <div className='w-full flex items-center justify-between'>
                    {/* Logo */}
                    <div className='shrink-0'>
                        <Link href={'/'} className='flex items-center gap-2'>
                            {settings?.logoUrl && (
                                <img 
                                    src={settings.logoUrl} 
                                    alt={settings.websiteName || 'Logo'} 
                                    className='h-6 w-auto object-contain'
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            )}
                            <h2 className='text-xs sm:text-sm md:text-base font-semibold leading-tight whitespace-nowrap'>
                                <span suppressHydrationWarning>
                                    {settings?.websiteName || 'Payplearn'}
                                </span>
                            </h2>
                        </Link>
                    </div>

                    {/* Menu - Centered */}
                    <div className='flex items-center gap-0 flex-1 justify-center'>
                        <Button variant={'ghost'} size="sm" className='h-8 px-1 sm:px-1.5 shrink-0'>
                            <Link href={'/store'} className="flex items-center gap-0.5 sm:gap-1">
                                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className='text-[10px] sm:text-xs font-medium'>ร้านค้า</span>
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={'ghost'} size="sm" className='h-8 px-1 sm:px-1.5 cursor-pointer shrink-0'>
                                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                    <span className='text-[10px] sm:text-xs font-medium ml-0.5 sm:ml-1'>บริการ</span>
                                    <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href='/premium' className="flex items-center">
                                            <Star className="mr-2 h-4 w-4" />
                                            แอพพรีเมี่ยม
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href='/topupgame' className="flex items-center">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            เติมเกม
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href='/social' className="flex items-center">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            ปั้มโซเชียล
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href='/otp' className="flex items-center">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            OTP
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    โค้ดสั่งซื้อ
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Wrench className="mr-2 h-4 w-4" />
                                    เครื่องมือ
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                    <Code className="mr-2 h-4 w-4" />
                                    Open API
                                    <DropdownMenuShortcut>Closed</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant={'ghost'} size="sm" className='h-8 px-1 sm:px-1.5 shrink-0'>
                            <Link href={'/topup'} className="flex items-center gap-0.5 sm:gap-1">
                                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className='text-[10px] sm:text-xs font-medium'>เติมเงิน</span>
                            </Link>
                        </Button>
                    </div>

                    {/* Right Section - Search & User Menu */}
                    <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
                        {/* Search Button */}
                        <div className='shrink-0'>
                            <SearchNav />
                        </div>
                        {/* User Menu */}
                        <div className='shrink-0'>
                            {isAuth ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="cursor-pointer flex items-center gap-0.5 sm:gap-1 h-8 px-1 sm:px-1.5 border-0 shadow-none bg-transparent hover:bg-gray-100/50 focus-visible:ring-0 focus-visible:border-0">
                                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                            <p className='text-[10px] sm:text-xs font-medium max-w-[50px] sm:max-w-[70px] line-clamp-1 hidden sm:inline'>{user?.username}</p>
                                            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 hidden sm:inline" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuGroup>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <Link href="/account" className="flex items-center">
                                                        <User className="mr-2 h-4 w-4" />
                                                        โปรไฟล์
                                                    </Link>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem>
                                                            <Link href={'/account/setting'} className="flex items-center">
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                ตั้งค่า
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Link href={'/account/setting/security'} className="flex items-center">
                                                                <Wrench className="mr-2 h-4 w-4" />
                                                                ความปลอดภัย
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        </DropdownMenuGroup>
                                        <DropdownMenuGroup>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <Link href="/account" className="flex items-center">
                                                        <User className="mr-2 h-4 w-4" />
                                                        ประวัติการทำรายการ
                                                    </Link>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem>
                                                            <Link href={'/account/history/premium'} className="flex items-center">
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                แอพพรีเมี่ยม
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Link href={'/account/history/topup'} className="flex items-center">
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                เติมเกม
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Link href={'/account/history/social'} className="flex items-center">
                                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                                ปั้มโซเชียล
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        </DropdownMenuGroup>
                                        {user?.role === 1 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href='/admin' className="flex items-center">
                                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                                        ระบบจัดการหลังบ้าน
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={logout}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            ออกจากระบบ
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <SignInAndSignUp />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}