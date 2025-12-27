import React from 'react';
import { Badge } from '../ui/badge';

export interface PremiumService {
    name: string;
    id: number;
    description: string | null;
    price: number;
    stock: number;
    provider?: 'gafiw' | 'peamsub'; // Optional provider field
}

interface PremiumServiceCardProps {
    service: PremiumService;
    onClick: (service: PremiumService) => void;
}

export const getPremiumServiceImage = (name: string) => {
        const lower = name.toLowerCase();

        // ใช้โลโก้ Netflix ตามที่ต้องการ
        if (lower.includes('netflix') || lower.includes('nf')) {
            return '/app/nf.webp';
        }

        // Disney
        if (lower.includes('disney')) {
            // Check if file exists, fallback to default if not
            return '/app/dn.png';
        }

        // VIU
        if (lower.includes('viu')) {
            return '/app/viu.png';
        }

        // YouTube / YT
        if (lower.includes('youtube') || lower.includes('yt')) {
            // YouTube image may not exist, will fallback via onError
            return '/app/yt.png';
        }

        // Monomax / HBO
        if (lower.includes('monomax') || lower.includes('hbo')) {
            return '/app/hbo.webp';
        }

        // TrueID
        if (lower.includes('trueid') || lower.includes('true id')) {
            return '/app/tid.png';
        }

        // CH3
        if (lower.includes('ch3') || lower.includes('ช่อง 3') || lower.includes('channel 3')) {
            return '/app/ch3.webp';
        }

        // WeTV
        if (lower.includes('wetv') || lower.includes('we tv')) {
            return '/app/we.webp';
        }

        // Prime Video
        if (lower.includes('prime')) {
            return '/app/pri.png';
        }

        // Youku
        if (lower.includes('youku')) {
            return '/app/yk.webp';
        }

        // Blibli / BiliBili
        if (lower.includes('blibli') || lower.includes('bilibili')) {
            return '/app/bl.webp';
        }

        // IQIYI
        if (lower.includes('iqiyi') || lower.includes('iqy') || lower.includes('qiy')) {
            return '/app/iq.png';
        }

        // oneD
        if (lower.includes('oned') || lower.includes('one d')) {
            return '/app/oneD_logo_black.BJCu-mC7.png';
        }

        // รูปเริ่มต้น
        return '/image-product-app-p.png';
};

export function PremiumServiceCard({ service, onClick }: PremiumServiceCardProps) {

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    return (
        <div
            className='group relative overflow-hidden border p-1.5 cursor-pointer rounded-md'
            onClick={() => onClick(service)}
        >
            <img
                src={getPremiumServiceImage(service.name)}
                className='w-full object-cover rounded-md select-none'
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
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback to default image if local image fails
                    if (target.src !== '/image-product-app-p.png') {
                        target.src = '/image-product-app-p.png';
                    }
                }}
            />
            <div className='mt-1.5'>
                <h5 className='text-xs font-medium line-clamp-2 leading-tight'>
                    {service.name}
                </h5>
                <div className='flex items-center justify-between mt-1 gap-1'>
                    <p className='text-xs font-semibold'>
                        {formatPrice(service.price)}
                    </p>
                    <Badge variant={service.stock > 0 ? "default" : "secondary"} className='text-[10px] px-1 py-0'>
                        {service.stock > 0 ? 'มีสินค้า' : 'หมด'}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
