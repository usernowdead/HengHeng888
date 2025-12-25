import React from 'react';
import { Badge } from '../ui/badge';

export interface PreorderProduct {
    id: number;
    name: string;
    price: number;
    pricevip: number;
    agent_price: number;
    type_app: string;
    stock: number;
    img: string;
    des: string;
    recommendedPrice: number;
}

interface PreorderProductCardProps {
    product: PreorderProduct;
    onClick: (product: PreorderProduct) => void;
}

export const getPreorderProductImage = (product: PreorderProduct) => {
    // Use product image if available
    if (product.img) {
        return product.img;
    }
    
    // Fallback to type_app based images
    const lower = product.type_app?.toLowerCase() || '';
    const nameLower = product.name?.toLowerCase() || '';

    // Netflix
    if (lower.includes('netflix') || nameLower.includes('netflix') || nameLower.includes('nf')) {
        return 'https://playzaa.online/images/apppremium/nf.webp';
    }

    // Disney
    if (lower.includes('disney') || nameLower.includes('disney')) {
        return 'https://playzaa.online/images/apppremium/dn.png';
    }

    // YouTube
    if (lower.includes('youtube') || nameLower.includes('youtube') || nameLower.includes('yt')) {
        return 'https://playzaa.online/images/apppremium/yt.png';
    }

    // Default image
    return '/image-product-app-p.png';
};

export function PreorderProductCard({ product, onClick }: PreorderProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    // Use pricevip if available, otherwise use price
    const displayPrice = product.pricevip > 0 ? product.pricevip : product.price;

    return (
        <div
            className='group relative overflow-hidden border p-1.5 cursor-pointer rounded-md'
            onClick={() => onClick(product)}
        >
            <img
                src={getPreorderProductImage(product)}
                className='w-full object-cover rounded-md'
                alt={product.name}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/image-product-app-p.png';
                }}
            />
            <div className='mt-1.5'>
                <h5 className='text-xs font-medium line-clamp-2 leading-tight'>
                    {product.name}
                </h5>
                <div className='flex items-center justify-between mt-1 gap-1'>
                    <p className='text-xs font-semibold'>
                        {formatPrice(displayPrice)}
                    </p>
                    <Badge variant={product.stock > 0 ? "default" : "secondary"} className='text-[10px] px-1 py-0'>
                        {product.stock > 0 ? 'มีสินค้า' : 'หมด'}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

