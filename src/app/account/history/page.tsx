"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Protected from '@/components/auth/Protected';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Gamepad2, Users, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const { user } = useAuth();

    const historyItems = [
        {
            id: 'deposit',
            title: 'ประวัติการเติมเงิน',
            description: 'ตรวจสอบรายการเติมเงินทั้งหมด',
            icon: Wallet,
            href: '/account/history/deposit',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'topup',
            title: 'ประวัติการเติมเกม',
            description: 'ตรวจสอบรายการเติมเกมทั้งหมด',
            icon: Gamepad2,
            href: '/account/history/topup',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: 'premium',
            title: 'ประวัติแอพพรีเมี่ยม',
            description: 'ตรวจสอบรายการซื้อแอพพรีเมี่ยม',
            icon: CreditCard,
            href: '/account/history/premium',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            id: 'social',
            title: 'ประวัติปั๊มโซเชียล',
            description: 'ตรวจสอบรายการปั๊มโซเชียล',
            icon: Users,
            href: '/account/history/social',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <Protected>
            <main className='min-h-screen bg-gray-50'>
                <div className='w-full max-w-[480px] mx-auto bg-white min-h-screen'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 bg-white border-b'>
                        <div className='px-4 py-4'>
                            <h1 className="text-xl font-semibold text-gray-900">ประวัติการทำรายการ</h1>
                            <p className="text-xs text-gray-500 mt-1">
                                ตรวจสอบประวัติการทำรายการทั้งหมด
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='px-4 py-4'>
                        <div className="space-y-3">
                            {historyItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.id} href={item.href}>
                                        <Card className='border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group'>
                                            <CardContent className='p-4'>
                                                <div className='flex items-center justify-between'>
                                                    <div className='flex items-center gap-3 flex-1'>
                                                        <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center transition-colors group-hover:scale-105`}>
                                                            <Icon className={`h-6 w-6 ${item.color}`} />
                                                        </div>
                                                        <div className='flex-1 min-w-0'>
                                                            <p className='text-sm font-medium text-gray-900 group-hover:text-gray-700'>
                                                                {item.title}
                                                            </p>
                                                            <p className='text-xs text-gray-500 mt-0.5 line-clamp-1'>
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className='h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0' />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </Protected>
    );
}

