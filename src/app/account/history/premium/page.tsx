"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Protected from '@/components/auth/Protected';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Package,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderData {
    id: string;
    productId: string;
    transactionId?: string;
    state: 'pending' | 'completed' | 'failed' | 'processing';
    price: number;
    data?: string;
    productMetadata?: {
        key: string;
        price: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    orders: OrderData[];
    count: number;
}

export default function PremiumHistoryPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPremiumOrders();
    }, []);

    const fetchPremiumOrders = async () => {
        try {
            const response = await fetch('/api/v1/orders/premium', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            const data: ApiResponse = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลได้');
            }
        } catch (error) {
            console.error('Error fetching premium orders:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (state: string) => {
        switch (state) {
            case 'completed':
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
            case 'processing':
                return (
                    <Badge variant="secondary">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        กำลังดำเนินการ
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        รอดำเนินการ
                    </Badge>
                );
            default:
                return <Badge variant="outline">{state}</Badge>;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('คัดลอกแล้ว');
    };

    if (loading) {
        return (
            <Protected>
                <main className='min-h-screen'>
                    <div className='border-b'>
                        <div className='w-full p-3'>
                            <h1 className="text-lg font-medium">ประวัติการสั่งซื้อแอพพรีเมี่ยม</h1>
                            <p className="text-muted-foreground text-xs">
                                กำลังโหลดข้อมูล...
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className='w-full p-3'>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Card key={index} className="animate-pulse">
                                        <CardHeader>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 rounded"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
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
            <main className='min-h-screen'>
                <div className='border-b'>
                    <div className='w-full p-3'>
                        <h1 className="text-lg font-medium">ประวัติการสั่งซื้อแอพพรีเมี่ยม</h1>
                        <p className="text-muted-foreground text-xs">
                            ประวัติการสั่งซื้อบริการแอพพรีเมี่ยมทั้งหมดของคุณ
                        </p>
                    </div>
                </div>

                <div>
                    <div className='w-full min-h-screen p-3'>
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        พบ {orders.length} รายการ
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchPremiumOrders}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        รีเฟรช
                                    </Button>
                                </div>

                                <ScrollArea className="h-[600px]">
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <CardTitle className="text-base flex items-center gap-2">
                                                                <ShoppingCart className="w-4 h-4" />
                                                                คำสั่งซื้อ #{order.id.slice(-8)}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-4 text-xs">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatDate(order.createdAt)}
                                                                </span>
                                                                {order.transactionId && (
                                                                    <span className="flex items-center gap-1">
                                                                        <CreditCard className="w-3 h-3" />
                                                                        TXN: {order.transactionId}
                                                                    </span>
                                                                )}
                                                            </CardDescription>
                                                        </div>
                                                        {getStatusBadge(order.state)}
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="pt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">รหัสสินค้า:</span>
                                                                <span className="text-sm font-mono">{order.productId}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">ราคา:</span>
                                                                <span className="text-sm font-semibold text-green-600">
                                                                    {formatPrice(order.price)}
                                                                </span>
                                                            </div>

                                                            {order.productMetadata && (
                                                                <div className="space-y-1">
                                                                    <span className="text-sm font-medium">ข้อมูลสินค้า:</span>
                                                                    <div className="bg-gray-50 p-2 rounded text-xs">
                                                                        {order.productMetadata.key && (
                                                                            <div>Key: {order.productMetadata.key}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.data && (
                                                            <div className="space-y-2">
                                                                <span className="text-sm font-medium">ข้อมูลการสั่งซื้อ:</span>
                                                                <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all relative">
                                                                    <div className="max-h-20 overflow-hidden">
                                                                        {order.data}
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute top-1 right-1 h-6 w-6 p-0"
                                                                        onClick={() => copyToClipboard(order.data)}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    ยังไม่มีประวัติการสั่งซื้อ
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    คุณยังไม่ได้สั่งซื้อบริการแอพพรีเมี่ยม
                                </p>
                                <Button asChild>
                                    <a href="/premium">
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        ไปเลือกซื้อ
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Protected>
    );
}
