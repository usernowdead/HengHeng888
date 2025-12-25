import React from 'react';
import { PreorderProductCard, PreorderProduct } from './PreorderProductCard';
import { Spinner } from '../ui/spinner';

interface PreorderProductGridProps {
    products: PreorderProduct[];
    loading: boolean;
    onProductClick: (product: PreorderProduct) => void;
    showViewAllButton?: boolean;
    viewAllHref?: string;
    viewAllText?: string;
}

export function PreorderProductGrid({
    products,
    loading,
    onProductClick,
    showViewAllButton = false,
    viewAllHref,
    viewAllText = 'ดูทั้งหมด'
}: PreorderProductGridProps) {
    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <Spinner />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className='text-center py-8 text-sm text-gray-500'>
                ไม่พบสินค้าพรีออเดอร์
            </div>
        );
    }

    return (
        <div className='space-y-3'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                {products.map((product) => (
                    <PreorderProductCard
                        key={product.id}
                        product={product}
                        onClick={onProductClick}
                    />
                ))}
            </div>
            {showViewAllButton && viewAllHref && (
                <div className='flex justify-center pt-2'>
                    <a
                        href={viewAllHref}
                        className='text-sm text-blue-600 hover:text-blue-700 underline'
                    >
                        {viewAllText}
                    </a>
                </div>
            )}
        </div>
    );
}

