import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { PreorderProduct } from './PreorderProductCard';
import { sanitizeHTML } from '@/lib/security/sanitize';
import { createAuthFetchOptions } from '@/lib/api-helpers';

interface PreorderProductDialogProps {
    product: PreorderProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PreorderProductDialog({ product, open, onOpenChange }: PreorderProductDialogProps) {
    const [purchasing, setPurchasing] = useState(false);
    const { isAuth, user } = useAuth();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    const handlePurchase = async () => {
        if (!product) return;

        if (!isAuth || !user) {
            toast.error('กรุณาเข้าสู่ระบบก่อนซื้อสินค้า');
            return;
        }

        // Check balance
        const displayPrice = product.pricevip > 0 ? product.pricevip : product.price;
        if (user.balance < displayPrice) {
            toast.error('ยอดเงินคงเหลือไม่เพียงพอ');
            return;
        }

        setPurchasing(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const response = await fetch('/api/v1/preorder/buy', 
                createAuthFetchOptions({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: product.id,
                        reference: `PREORDER_${Date.now()}_${user.id}`
                    })
                }, token)
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'สั่งซื้อสำเร็จ');
                onOpenChange(false);
                // Refresh user balance
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            } else {
                toast.error(data.message || 'การสั่งซื้อล้มเหลว');
            }
        } catch (error) {
            console.error('Error purchasing preorder product:', error);
            toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
        } finally {
            setPurchasing(false);
        }
    };

    if (!product) return null;

    const displayPrice = product.pricevip > 0 ? product.pricevip : product.price;
    const canAfford = isAuth && user && user.balance >= displayPrice;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {product.name}
                    </DialogTitle>
                    <DialogDescription>
                        สินค้าพรีออเดอร์
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Product Image */}
                        <div className="w-full aspect-video relative overflow-hidden rounded-lg border bg-gray-100">
                            <img
                                src={product.img || '/image-product-app-p.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/image-product-app-p.png';
                                }}
                            />
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold">{product.name}</h3>
                                <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                                    {product.stock > 0 ? 'มีสินค้า' : 'หมด'}
                                </Badge>
                            </div>

                            {/* Prices */}
                            <div className="space-y-1">
                                {product.pricevip > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ราคาตัวแทนจำหน่าย:</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatPrice(product.pricevip)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">ราคาขายปกติ:</span>
                                    <span className="text-sm font-semibold">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                                {product.agent_price > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ราคาตัวแทนสมาชิก:</span>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {formatPrice(product.agent_price)}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold">ราคาที่ต้องจ่าย:</span>
                                        <span className="text-lg font-bold text-primary">
                                            {formatPrice(displayPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {product.des && (
                                <div className="pt-2">
                                    <h4 className="text-sm font-medium mb-1">รายละเอียด:</h4>
                                    <div
                                        className="text-sm text-gray-600 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHTML(product.des)
                                        }}
                                    />
                                </div>
                            )}

                            {/* Type App */}
                            {product.type_app && (
                                <div className="pt-2">
                                    <Badge variant="outline">{product.type_app}</Badge>
                                </div>
                            )}

                            {/* Balance Check */}
                            {isAuth && user && (
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">ยอดเงินคงเหลือ:</span>
                                        <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPrice(user.balance)}
                                        </span>
                                    </div>
                                    {!canAfford && (
                                        <p className="text-xs text-red-600 mt-1">
                                            ยอดเงินไม่เพียงพอ
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                    {!isAuth ? (
                        <Button
                            className="w-full"
                            onClick={() => {
                                onOpenChange(false);
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/signin';
                                }
                            }}
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            เข้าสู่ระบบเพื่อซื้อ
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={handlePurchase}
                            disabled={purchasing || product.stock <= 0 || !canAfford}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {purchasing ? 'กำลังสั่งซื้อ...' : 'สั่งซื้อ'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

