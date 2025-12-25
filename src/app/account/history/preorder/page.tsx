"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createAuthFetchOptions } from '@/lib/api-helpers';

interface PreorderOrder {
    id: number;
    productName: string;
    productId: string;
    prize: string;
    img: string;
    price: string;
    refId: string;
    resellerId: string;
    status: string;
    date: string;
}

export default function PreorderHistoryPage() {
    const { isAuth, user } = useAuth();
    const [orders, setOrders] = useState<PreorderOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuth) {
            fetchHistory();
        }
    }, [isAuth]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            
            const response = await fetch('/api/v1/preorder/history', 
                createAuthFetchOptions({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        references: [] // Empty array = get all history
                    })
                }, token)
            );

            const data = await response.json();

            if (data.success) {
                setOrders(data.orders || []);
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดประวัติได้');
            }
        } catch (error) {
            console.error('Error fetching preorder history:', error);
            toast.error('เกิดข้อผิดพลาดในการโหลดประวัติ');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('คัดลอกแล้ว');
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return <Badge className="bg-green-500">สำเร็จ</Badge>;
            case 'failed':
                return <Badge variant="destructive">ล้มเหลว</Badge>;
            case 'pending':
                return <Badge variant="secondary">รอดำเนินการ</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (!isAuth) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูประวัติการซื้อ</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ประวัติการซื้อสินค้าพรีออเดอร์</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            ดูประวัติการซื้อสินค้าพรีออเดอร์ทั้งหมดของคุณ
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchHistory}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        รีเฟรช
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner />
                    </div>
                ) : orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">ยังไม่มีประวัติการซื้อสินค้าพรีออเดอร์</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{order.productName}</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Product ID: {order.productId}
                                            </p>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {order.prize && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">รายละเอียดสินค้า:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{order.prize}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyToClipboard(order.prize)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">ราคา:</span>
                                            <span className="text-sm font-semibold">
                                                ฿{parseFloat(order.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Reference ID:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono">{order.refId}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => copyToClipboard(order.refId)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">วันที่:</span>
                                            <span className="text-sm">
                                                {new Date(order.date).toLocaleString('th-TH')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

