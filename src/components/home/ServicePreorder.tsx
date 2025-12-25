"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { PreorderProduct, PreorderProductGrid, PreorderProductDialog } from '../preorder';
import { toast } from 'sonner';
import Link from 'next/link';

interface ApiResponse {
    success: boolean;
    products: PreorderProduct[];
    count: number;
}

export default function ServicePreorder() {
    const [products, setProducts] = useState<PreorderProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<PreorderProduct | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchPreorderProducts();
    }, []);

    const fetchPreorderProducts = async () => {
        try {
            const response = await fetch('/api/v1/preorder');
            
            if (!response.ok) {
                // Silently handle errors - don't log to avoid console spam
                setProducts([]);
                setLoading(false);
                return;
            }

            const data: ApiResponse = await response.json();

            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products.slice(0, 10)); // Show first 10 products
            } else {
                // No products available or API key not configured - silently handle
                setProducts([]);
            }
        } catch (error) {
            // Silently handle all errors - don't log to avoid console spam
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: PreorderProduct) => {
        setSelectedProduct(product);
        setShowDialog(true);
    };

    return (
        <>
            <section className='border-b'>
                <div className='w-full'>
                    <div className='px-3 pt-3 pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h3 className='text-base font-medium'>
                                    บริการสินค้าพรีออเดอร์
                                </h3>
                                <p className='text-xs text-muted-foreground'>
                                    สินค้าพรีออเดอร์คุณภาพสูง
                                </p>
                            </div>
                            <Link href="/preorder">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    ดูทั้งหมด
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className='px-3 py-3'>
                        <PreorderProductGrid
                            products={products}
                            loading={loading}
                            onProductClick={handleProductClick}
                            showViewAllButton={true}
                            viewAllHref="/preorder"
                            viewAllText="ดูทั้งหมด"
                        />
                    </div>
                </div>
            </section>

            <PreorderProductDialog
                product={selectedProduct}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </>
    );
}

