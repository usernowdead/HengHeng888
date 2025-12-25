"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PreorderProduct, PreorderProductGrid, PreorderProductDialog } from '@/components/preorder';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface ApiResponse {
    success: boolean;
    products: PreorderProduct[];
    count: number;
}

export default function PreorderPage() {
    const [allProducts, setAllProducts] = useState<PreorderProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<PreorderProduct | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchPreorderProducts();
    }, []);

    const fetchPreorderProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/preorder');
            
            if (!response.ok) {
                // Silently handle errors - don't log to avoid console spam
                setAllProducts([]);
                setLoading(false);
                return;
            }

            const data: ApiResponse = await response.json();

            if (data.success && Array.isArray(data.products)) {
                setAllProducts(data.products);
            } else {
                // No products available or API key not configured - silently handle
                setAllProducts([]);
            }
        } catch (error) {
            // Silently handle all errors - don't log to avoid console spam
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter and search products
    const filteredProducts = useMemo(() => {
        let filtered = allProducts;

        // Apply filter
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter(product => {
                const typeApp = product.type_app?.toLowerCase() || '';
                return typeApp === selectedFilter.toLowerCase();
            });
        }

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(product => {
                const name = product.name?.toLowerCase() || '';
                const typeApp = product.type_app?.toLowerCase() || '';
                const query = searchQuery.toLowerCase();
                return name.includes(query) || typeApp.includes(query);
            });
        }

        return filtered;
    }, [allProducts, selectedFilter, searchQuery]);

    // Get unique type_app for filter
    const uniqueTypes = useMemo(() => {
        const types = new Set(allProducts.map(p => p.type_app).filter(Boolean));
        return Array.from(types).sort();
    }, [allProducts]);

    const handleProductClick = (product: PreorderProduct) => {
        setSelectedProduct(product);
        setShowDialog(true);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">สินค้าพรีออเดอร์</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        สินค้าพรีออเดอร์คุณภาพสูง พร้อมบริการหลังการขาย
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="ค้นหาสินค้า..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="หมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {uniqueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600">
                                พบ {filteredProducts.length} รายการ
                            </p>
                        </div>
                        <PreorderProductGrid
                            products={filteredProducts}
                            loading={false}
                            onProductClick={handleProductClick}
                        />
                    </>
                )}
            </div>

            <PreorderProductDialog
                product={selectedProduct}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </div>
    );
}

