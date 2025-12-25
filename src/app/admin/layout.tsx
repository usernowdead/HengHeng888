"use client"

import React, { useState } from 'react'
import AdminProtected from '@/components/auth/AdminProtected'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, 
    Users, 
    ShoppingCart, 
    Wallet, 
    BarChart3,
    Home,
    Package,
    FolderTree,
    Box,
    Star,
    Percent,
    Bell,
    Settings,
    History,
    AlertCircle,
    Menu,
    X,
    Film,
    Gamepad2,
    Store,
    CreditCard,
    Key,
    Database,
    FileCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { 
            section: 'ภาพรวม',
            items: [
                { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        { 
            section: 'ข้อมูลร้าน / หน้าเว็บ',
            items: [
                { href: '/admin/website-settings', label: 'ตั้งค่าเว็บไซต์', icon: Settings },
                { href: '/admin/shop-services', label: 'จัดการบริการร้านค้า', icon: Store },
                { href: '/admin/movies', label: 'จัดการหนังแนะนำ', icon: Film },
            ]
        },
        { 
            section: 'API Settings',
            items: [
                { href: '/admin/api-keys', label: 'ตั้งค่า API KEY', icon: Key },
            ]
        },
        { 
            section: 'Middle Pay API',
            items: [
                { href: '/admin/api-games', label: 'API เกม (เติมเกม)', icon: Gamepad2 },
            ]
        },
        { 
            section: 'Gafiwshop API',
            items: [
                { href: '/admin/api-products', label: 'API สินค้า (แอพพรีเมี่ยม)', icon: Package },
                { href: '/admin/api-otp', label: 'API OTP', icon: Box },
                { href: '/admin/gafiw-history', label: 'ประวัติการสั่งซื้อ', icon: History },
                { href: '/admin/gafiw-claims', label: 'จัดการเคลม', icon: AlertCircle },
            ]
        },
        { 
            section: 'Peamsub24hr API',
            items: [
                { href: '/admin/premium-provider', label: 'จัดการผู้ให้บริการแอพพรีเมี่ยม', icon: Star },
            ]
        },
        { 
            section: 'Payment Settings',
            items: [
                { href: '/admin/payment-methods', label: 'จัดการช่องทางการชำระเงิน', icon: CreditCard },
                { href: '/admin/auto-topup', label: 'ตั้งค่าเติมเงินออโต้', icon: Wallet },
            ]
        },
        { 
            section: 'ข้อมูลการใช้งาน',
            items: [
                { href: '/admin/orders', label: 'ประวัติการสั่งซื้อ', icon: ShoppingCart },
                { href: '/admin/topup-history', label: 'ประวัติการเติมเงิน', icon: Wallet },
                { href: '/admin/bank-topup-history', label: 'ประวัติเติมเงินธนาคาร', icon: FileCheck },
                { href: '/admin/otp-order-history', label: 'ประวัติสั่งซื้อ OTP', icon: ShoppingCart },
            ]
        },
        { 
            section: 'ผู้ใช้ / ระบบ',
            items: [
                { href: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
                { href: '/admin/balance', label: 'จัดการยอดเงิน', icon: Wallet },
            ]
        },
    ]

    return (
        <AdminProtected>
            <div className='min-h-screen bg-gray-50 flex'>
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shrink-0 transform transition-transform duration-200 ease-in-out',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}>
                    <div className='h-full flex flex-col'>
                        {/* Sidebar Header */}
                        <div className='h-16 border-b border-gray-200 flex items-center justify-between px-6'>
                            <Link href='/' className='flex items-center gap-2.5'>
                                <div className='w-7 h-7 bg-gray-900 rounded flex items-center justify-center'>
                                    <LayoutDashboard className='h-4 w-4 text-white' />
                                </div>
                                <span className='text-sm font-semibold text-gray-900'>Admin</span>
                            </Link>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='lg:hidden h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </div>

                        {/* Sidebar Menu */}
                        <div className='flex-1 overflow-y-auto py-4'>
                            <nav className='space-y-8 px-3'>
                                {navItems.map((section, sectionIdx) => (
                                    <div key={sectionIdx}>
                                        <h4 className='text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 px-3'>
                                            {section.section}
                                        </h4>
                                        <div className='space-y-0.5'>
                                            {section.items.map((item) => {
                                                const Icon = item.icon
                                                const isActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                                                            isActive
                                                                ? 'bg-gray-100 text-gray-900 font-medium'
                                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        <Icon className={cn(
                                                            'h-4 w-4 shrink-0',
                                                            isActive ? 'text-gray-900' : 'text-gray-400'
                                                        )} />
                                                        <span className='truncate'>{item.label}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Sidebar Footer */}
                        <div className='h-12 border-t border-gray-200 flex items-center justify-center'>
                            <Link 
                                href='/'
                                className='flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors'
                            >
                                <Home className='h-3.5 w-3.5' />
                                <span>กลับหน้าแรก</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-1 flex flex-col min-w-0'>
                    {/* Header */}
                    <header className='bg-white border-b border-gray-200 sticky top-0 z-30'>
                        <div className='px-6 py-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='lg:hidden h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        <Menu className='h-5 w-5' />
                                    </Button>
                                    <div>
                                        <h1 className='text-lg font-semibold text-gray-900'>
                                            {navItems.flatMap(s => s.items).find(item => item.href === pathname)?.label || 'Dashboard'}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className='flex-1 overflow-y-auto bg-gray-50'>
                        <div className='p-6 max-w-7xl mx-auto w-full'>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminProtected>
    )
}

