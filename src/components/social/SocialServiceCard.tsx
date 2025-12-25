import React from 'react';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface SocialService {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
}

interface SocialServiceCardProps {
    service: SocialService;
    onClick: (service: SocialService) => void;
}

export function SocialServiceCard({ service, onClick }: SocialServiceCardProps) {
    const { isAuth } = useAuth();

    const getCategoryIcon = (category: string) => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('instagram')) return '/icons/instagram.png';
        if (categoryLower.includes('facebook')) return '/icons/facebook.png';
        if (categoryLower.includes('tiktok')) return '/icons/tiktok.png';
        if (categoryLower.includes('twitter')) return '/icons/twitter.png';
        if (categoryLower.includes('youtube')) return '/icons/youtube.png';
        if (categoryLower.includes('linkedin')) return '/icons/LinkedIn.png';
        if (categoryLower.includes('telegram')) return '/icons/telegram.png';
        return '/icons/shopee.png'; // default icon
    };

    const handleClick = () => {
        if (!isAuth) {
            toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อบริการ');
            return;
        }
        onClick(service);
    };

    return (
        <div
            key={service.service}
            className='border rounded-md relative flex cursor-pointer items-start gap-2 p-3 hover:bg-gray-50 transition-colors'
            onClick={() => onClick(service)}
        >
            <div>
                <img
                    src={getCategoryIcon(service.category)}
                    className='w-12 h-12 border p-1 rounded-md select-none'
                    alt={service.category}
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
                        // Fallback to default icon if image fails to load
                        (e.target as HTMLImageElement).src = '/icons/shopee.png'
                    }}
                />
            </div>
            <div className='flex-1 py-1'>
                <h5 className='text-sm font-medium line-clamp-2 mb-1'>
                    {service.name}
                </h5>
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                    <Badge variant={'outline'} className='text-black rounded-md text-xs'>
                        ฿ {parseFloat(service.rate).toFixed(2)} ต่อ 1,000
                    </Badge>
                    <span>ขั้นต่ำ {service.min}</span>
                    <span>สูงสุด {service.max}</span>
                    {service.refill && (
                        <Badge variant="secondary" className="text-xs">
                            Refill
                        </Badge>
                    )}
                    {service.cancel && (
                        <Badge variant="outline" className="text-xs">
                            Cancel
                        </Badge>
                    )}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                    ประเภท: {service.type}
                </p>
            </div>
            <div className='absolute top-2 right-2'>
                <Badge variant="secondary">
                    {service.category}
                </Badge>
            </div>
        </div>
    );
}
