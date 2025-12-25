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
import { PremiumService, getPremiumServiceImage } from './PremiumServiceCard';
import { sanitizeHTML } from '@/lib/security/sanitize';

interface PremiumServiceDialogProps {
    service: PremiumService | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PremiumServiceDialog({ service, open, onOpenChange }: PremiumServiceDialogProps) {
    const [purchasing, setPurchasing] = useState(false);
    const { isAuth, user, login } = useAuth();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    const handlePurchase = async () => {
        if (!service) return;

        setPurchasing(true);

        try {
            const response = await fetch('/api/v1/premium/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    id: service.id,
                    provider: service.provider // Include provider if available
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('สั่งซื้อสำเร็จ!', {
                    description: `ได้รับสินค้าแล้ว ตรวจสอบข้อมูลในบัญชีของคุณ`
                });

                // Update user balance in context
                if (user && data.data?.user?.balance !== undefined) {
                    const updatedUser = {
                        ...user,
                        balance: parseFloat(data.data.user.balance)
                    };
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        await login(token, updatedUser);
                    }
                }

                // Close dialog
                onOpenChange(false);

            } else {
                toast.error('สั่งซื้อล้มเหลว', {
                    description: data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ'
                });
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ', {
                description: 'กรุณาลองใหม่อีกครั้ง'
            });
        } finally {
            setPurchasing(false);
        }
    };

    if (!service) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="line-clamp-1">{service.name}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            รายละเอียดสินค้าและบริการ
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="flex-1 px-4 sm:px-6 overflow-y-auto">
                    <div className="space-y-3 pb-2">
                        {/* Product Image */}
                        <div className="flex justify-center">
                            <img
                                src={getPremiumServiceImage(service.name)}
                                className='w-full max-w-[280px] object-cover rounded-md select-none'
                                alt={service.name}
                                draggable={false}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    return false;
                                }}
                                onDragStart={(e) => {
                                    e.preventDefault();
                                    return false;
                                }}
                            />
                        </div>

                        {/* Price and Stock */}
                        <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                                <p className="text-xs text-gray-600">ราคา</p>
                                <p className="text-xl sm:text-2xl font-bold">
                                    {formatPrice(service.price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-600">สถานะสินค้า</p>
                                <Badge
                                    variant={service.stock && service.stock > 0 ? "default" : "secondary"}
                                    className='text-[10px] px-2 py-0.5 mt-1'
                                >
                                    {service.stock && service.stock > 0 ? 'มีสินค้า' : 'หมด'}
                                </Badge>
                            </div>
                        </div>

                        {/* User Balance Info */}
                        {isAuth && user && (
                            <div className="p-3 border rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">ยอดเงินคงเหลือ</p>
                                        <p className="text-sm font-semibold">
                                            {formatPrice(user.balance || 0)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600 mb-1">หลังซื้อ</p>
                                        <p className={`text-sm font-semibold ${(user.balance || 0) >= service.price ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPrice((user.balance || 0) - service.price)}
                                        </p>
                                    </div>
                                </div>
                                {(user.balance || 0) < service.price && (
                                    <p className="text-[10px] text-red-600 mt-1.5">
                                        ยอดเงินคงเหลือไม่เพียงพอสำหรับการซื้อสินค้านี้
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        {service.description && (
                            <div>
                                <h4 className="font-medium mb-1.5 text-sm">รายละเอียดสินค้า</h4>
                                <div
                                    className="prose prose-sm max-w-none text-muted-foreground text-xs sm:text-sm p-2 border rounded-md"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHTML(service.description)
                                    }}
                                />
                            </div>
                        )}

                        {/* Service Info */}
                        <div className="grid grid-cols-2 gap-4 rounded-lg">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-600 mb-1">รหัสสินค้า</p>
                                <p className="font-mono text-xs sm:text-sm break-all">{service.id}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-600 mb-1">ประเภท</p>
                                <p className="text-xs sm:text-sm">แอพพรีเมี่ยม</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex flex-col gap-2.5 px-4 sm:px-6 py-4 border-t bg-gray-50/50">
                    {isAuth ? (
                        <Button
                            className='w-full cursor-pointer text-sm h-11 font-medium shadow-sm'
                            disabled={
                                !service.stock ||
                                service.stock <= 0 ||
                                purchasing ||
                                Boolean(user && (user.balance || 0) < service.price)
                            }
                            onClick={handlePurchase}
                        >
                            <ShoppingCart className="w-4 h-4 mr-1.5" />
                            {purchasing ? 'กำลังสั่งซื้อ...' : 'ซื้อเลย'}
                        </Button>
                    ) : (
                        <Button variant={'default'} disabled className="w-full text-sm h-11 font-medium">
                            <LogIn className="w-4 h-4 mr-1.5" />
                            <span className="line-clamp-1">ต้องการซื้อสินค้า กรุณาเข้าสู่ระบบ</span>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className='w-full cursor-pointer text-sm h-11 font-medium'
                        onClick={() => onOpenChange(false)}
                        disabled={purchasing}
                    >
                        ปิด
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
