"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Protected from '@/components/auth/Protected';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    QrCode,
    Gift,
    ArrowLeft,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface DepositTransaction {
    id: string;
    transactionId: string;
    paymentMethod: 'promptpay' | 'truewallet' | 'unknown';
    paymentGateway: string;
    amount: number;
    status: 'pending' | 'success' | 'failed' | 'expired';
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    qrUrl: string | null;
    voucherUrl: string | null;
    voucherCode: string | null;
}

interface ApiResponse {
    success: boolean;
    data: {
        transactions: DepositTransaction[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export default function DepositHistoryPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<DepositTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchDepositHistory();
    }, [page]);

    const fetchDepositHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบ');
                return;
            }

            const response = await fetch(`/api/v1/topup/history?page=${page}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data: ApiResponse = await response.json();

            if (data.success) {
                setTransactions(data.data.transactions);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลได้');
            }
        } catch (error) {
            console.error('Error fetching deposit history:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        สำเร็จ
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        ล้มเหลว
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        <Clock className="w-3 h-3 mr-1" />
                        หมดอายุ
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        รอดำเนินการ
                    </Badge>
                );
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'promptpay':
                return 'PromptPay QR Code';
            case 'truewallet':
                return 'อังเปา ทรูมันนี่';
            default:
                return 'ไม่ระบุ';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('คัดลอกแล้ว');
    };

    if (loading && transactions.length === 0) {
        return (
            <Protected>
                <main className='min-h-screen bg-gray-50'>
                    <div className='w-full max-w-[480px] mx-auto bg-white min-h-screen'>
                        <div className='sticky top-0 z-10 bg-white border-b'>
                            <div className='px-4 py-4'>
                                <h1 className="text-xl font-semibold text-gray-900">ประวัติการเติมเงิน</h1>
                                <p className="text-xs text-gray-500 mt-1">กำลังโหลดข้อมูล...</p>
                            </div>
                        </div>
                        <div className='px-4 py-4'>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Card key={index} className="animate-pulse">
                                        <CardContent className="p-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </Protected>
        );
    }

    return (
        <Protected>
            <main className='min-h-screen bg-gray-50'>
                <div className='w-full max-w-[480px] mx-auto bg-white min-h-screen'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 bg-white border-b'>
                        <div className='px-4 py-4'>
                            <div className='flex items-center gap-3 mb-2'>
                                <Link href="/topup">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className='flex-1'>
                                    <h1 className="text-xl font-semibold text-gray-900">ประวัติการเติมเงิน</h1>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {transactions.length > 0 ? `พบ ${transactions.length} รายการ` : 'ยังไม่มีประวัติการเติมเงิน'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={fetchDepositHistory}
                                    disabled={loading}
                                    className="h-8 w-8"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='px-4 py-4'>
                        {transactions.length > 0 ? (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <Card key={transaction.id} className="hover:shadow-md transition-shadow border-gray-200">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Wallet className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {formatPrice(transaction.amount)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(transaction.createdAt)}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(transaction.status)}
                                                </div>

                                                {/* Payment Method */}
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    {transaction.paymentMethod === 'promptpay' ? (
                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                            <Image
                                                                src="https://richmanshop.com/img/pp.png"
                                                                alt="PromptPay"
                                                                width={24}
                                                                height={24}
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    ) : transaction.paymentMethod === 'truewallet' ? (
                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                            <Image
                                                                src="https://playzaa.online/images/angpao.png"
                                                                alt="TrueWallet"
                                                                width={24}
                                                                height={24}
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        {getPaymentMethodLabel(transaction.paymentMethod)}
                                                    </span>
                                                </div>

                                                {/* Transaction ID */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500">Transaction ID:</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-mono text-gray-700">
                                                            {transaction.transactionId.slice(-12)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => copyToClipboard(transaction.transactionId)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Expires At (if pending) */}
                                                {transaction.status === 'pending' && transaction.expiresAt && (
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-xs text-gray-500">
                                                            หมดอายุ: {formatDate(transaction.expiresAt)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1 || loading}
                                        >
                                            ก่อนหน้า
                                        </Button>
                                        <span className="text-sm text-gray-600">
                                            หน้า {page} จาก {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages || loading}
                                        >
                                            ถัดไป
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    ยังไม่มีประวัติการเติมเงิน
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    คุณยังไม่ได้เติมเงินเข้าสู่ระบบ
                                </p>
                                <Link href="/topup">
                                    <Button>
                                        <Wallet className="w-4 h-4 mr-2" />
                                        ไปเติมเงิน
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Protected>
    );
}

