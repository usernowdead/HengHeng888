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
            return 'https://playzaa.online/images/apppremium/nf.webp';
        }

        // Disney
        if (lower.includes('disney')) {
            return 'https://playzaa.online/images/apppremium/dn.png';
        }

        // VIU
        if (lower.includes('viu')) {
            return 'https://playzaa.online/images/apppremium/viu.png';
        }

        // YouTube / YT
        if (lower.includes('youtube') || lower.includes('yt')) {
            return 'https://playzaa.online/images/apppremium/yt.png';
        }

        // Monomax / HBO
        if (lower.includes('monomax') || lower.includes('hbo')) {
            return 'https://playzaa.online/images/apppremium/hbo.webp';
        }

        // TrueID
        if (lower.includes('trueid') || lower.includes('true id')) {
            return 'https://playzaa.online/images/apppremium/tid.png';
        }

        // CH3
        if (lower.includes('ch3') || lower.includes('ช่อง 3') || lower.includes('channel 3')) {
            return 'https://playzaa.online/images/apppremium/ch3.webp';
        }

        // WeTV
        if (lower.includes('wetv') || lower.includes('we tv')) {
            return 'https://playzaa.online/images/apppremium/we.webp';
        }

        // Prime Video
        if (lower.includes('prime')) {
            return 'https://playzaa.online/images/apppremium/pri.png';
        }

        // Youku
        if (lower.includes('youku')) {
            return 'https://playzaa.online/images/apppremium/yk.webp';
        }

        // Blibli / BiliBili
        if (lower.includes('blibli') || lower.includes('bilibili')) {
            return 'https://playzaa.online/images/apppremium/bl.webp';
        }

        // IQIYI
        if (lower.includes('iqiyi') || lower.includes('iqy') || lower.includes('qiy')) {
            return 'https://playzaa.online/images/apppremium/iq.png';
        }

        // oneD
        if (lower.includes('oned') || lower.includes('one d')) {
            return 'https://www.oned.net/_nuxt/oneD_logo_black.BJCu-mC7.png';
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
