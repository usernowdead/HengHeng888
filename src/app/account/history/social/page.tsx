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
    Copy,
    Link,
    Hash,
    RotateCcw,
    X,
    Info
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
        link?: string;
        quantity?: number;
        runs?: number;
        interval?: number;
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

export default function SocialHistoryPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingOrder, setProcessingOrder] = useState<string | null>(null);
    const [orderStatuses, setOrderStatuses] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchSocialOrders();
    }, []);

    const fetchSocialOrders = async () => {
        try {
            const response = await fetch('/api/v1/orders/social', {
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
            console.error('Error fetching social orders:', error);
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

    const handleGetStatus = async (orderId: string) => {
        setProcessingOrder(orderId);
        try {
            const response = await fetch('/api/v1/social/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ orderId })
            });

            const data = await response.json();

            if (data.success) {
                setOrderStatuses(prev => ({ ...prev, [orderId]: data.data }));
                toast.success('ดึงข้อมูลสถานะสำเร็จ');
            } else {
                toast.error(data.message || 'ไม่สามารถดึงข้อมูลสถานะได้');
            }
        } catch (error) {
            console.error('Error getting status:', error);
            toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถานะ');
        } finally {
            setProcessingOrder(null);
        }
    };

    const handleRefill = async (orderId: string) => {
        if (!confirm('คุณต้องการ refill ออเดอร์นี้หรือไม่?')) {
            return;
        }

        setProcessingOrder(orderId);
        try {
            const response = await fetch('/api/v1/social/refill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ orderId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('ส่งคำขอ refill สำเร็จ');
                // Refresh orders
                fetchSocialOrders();
            } else {
                toast.error(data.message || 'ไม่สามารถส่งคำขอ refill ได้');
            }
        } catch (error) {
            console.error('Error requesting refill:', error);
            toast.error('เกิดข้อผิดพลาดในการส่งคำขอ refill');
        } finally {
            setProcessingOrder(null);
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm('คุณต้องการยกเลิกออเดอร์นี้หรือไม่?')) {
            return;
        }

        setProcessingOrder(orderId);
        try {
            const response = await fetch('/api/v1/social/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ orderId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('ยกเลิกออเดอร์สำเร็จ');
                // Refresh orders
                fetchSocialOrders();
            } else {
                toast.error(data.message || 'ไม่สามารถยกเลิกออเดอร์ได้');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('เกิดข้อผิดพลาดในการยกเลิกออเดอร์');
        } finally {
            setProcessingOrder(null);
        }
    };

    if (loading) {
        return (
            <Protected>
                <main className='min-h-screen'>
                    <div className='border-b'>
                        <div className='w-full p-3'>
                            <h1 className="text-lg font-medium">ประวัติการสั่งซื้อโซเชียลมีเดีย</h1>
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
                        <h1 className="text-lg font-medium">ประวัติการสั่งซื้อโซเชียลมีเดีย</h1>
                        <p className="text-muted-foreground text-xs">
                            ประวัติการสั่งซื้อบริการโซเชียลมีเดียทั้งหมดของคุณ
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
                                        onClick={fetchSocialOrders}
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
                                                                <span className="text-sm font-medium">รหัสบริการ:</span>
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
                                                                    <span className="text-sm font-medium">ข้อมูลการสั่งซื้อ:</span>
                                                                    <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                                                                        {order.productMetadata.link && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Link className="w-3 h-3" />
                                                                                <span className="truncate">{order.productMetadata.link}</span>
                                                                            </div>
                                                                        )}
                                                                        {order.productMetadata.quantity && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Hash className="w-3 h-3" />
                                                                                <span>จำนวน: {order.productMetadata.quantity}</span>
                                                                            </div>
                                                                        )}
                                                                        {order.productMetadata.runs && (
                                                                            <div>Runs: {order.productMetadata.runs}</div>
                                                                        )}
                                                                        {order.productMetadata.interval && (
                                                                            <div>Interval: {order.productMetadata.interval} นาที</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Order Status Info */}
                                                            {orderStatuses[order.id] && (
                                                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                                                    <div className="font-medium mb-1">สถานะออเดอร์:</div>
                                                                    <div className="space-y-1">
                                                                        <div>Status: {orderStatuses[order.id].status}</div>
                                                                        {orderStatuses[order.id].startCount && (
                                                                            <div>Start Count: {orderStatuses[order.id].startCount}</div>
                                                                        )}
                                                                        {orderStatuses[order.id].remains && (
                                                                            <div>Remains: {orderStatuses[order.id].remains}</div>
                                                                        )}
                                                                        {orderStatuses[order.id].charge && (
                                                                            <div>Charge: {orderStatuses[order.id].charge} {orderStatuses[order.id].currency || 'USD'}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.data && (
                                                            <div className="space-y-2">
                                                                <span className="text-sm font-medium">ข้อมูลการตอบกลับ:</span>
                                                                <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all relative">
                                                                    <div className="max-h-20 overflow-hidden">
                                                                        {order.data}
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="absolute top-1 right-1 h-6 w-6 p-0"
                                                                        onClick={() => order.data && copyToClipboard(order.data)}
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleGetStatus(order.id)}
                                                            disabled={processingOrder === order.id}
                                                        >
                                                            <Info className="w-3 h-3 mr-1" />
                                                            {processingOrder === order.id ? 'กำลังโหลด...' : 'ดูสถานะ'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRefill(order.id)}
                                                            disabled={processingOrder === order.id || order.state === 'failed' || order.state === 'cancelled'}
                                                        >
                                                            <RotateCcw className="w-3 h-3 mr-1" />
                                                            Refill
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancel(order.id)}
                                                            disabled={processingOrder === order.id || order.state === 'completed' || order.state === 'cancelled'}
                                                        >
                                                            <X className="w-3 h-3 mr-1" />
                                                            Cancel
                                                        </Button>
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
                                    คุณยังไม่ได้สั่งซื้อบริการโซเชียลมีเดีย
                                </p>
                                <Button asChild>
                                    <a href="/social">
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