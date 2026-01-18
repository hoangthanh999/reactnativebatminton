import { useCallback, useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { Product, ProductCategory, ProductSearchParams } from '../types/shop';
import { Page } from '../types/api';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadProducts = useCallback(async (params: Partial<ProductSearchParams> = {}, isRefresh = false) => {
        try {
            setLoading(true);

            // Default params
            const searchParams: ProductSearchParams = {
                page: 0,
                size: 20,
                ...params
            };

            let response;
            if (searchParams.keyword || searchParams.minPrice || searchParams.maxPrice) {
                // Use search endpoint if filters exist
                response = await productService.searchProducts(searchParams);
            } else if (searchParams.categoryId) {
                response = await productService.getProductsByCategory(searchParams.categoryId, searchParams.page, searchParams.size);
            } else {
                response = await productService.getAllProducts(searchParams.page, searchParams.size);
            }

            if (response.success && response.data) {
                const pageData: Page<Product> = response.data;

                if (isRefresh || searchParams.page === 0) {
                    setProducts(pageData.content);
                } else {
                    setProducts(prev => [...prev, ...pageData.content]);
                }
                setTotalPages(pageData.totalPages);
                setPage(pageData.number);
            }
        } catch (error) {
            console.error('Load products error', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const response = await productService.getCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Load categories error', error);
        }
    }, []);

    const loadFeatured = useCallback(async () => {
        try {
            const response = await productService.getFeaturedProducts();
            if (response.success) {
                setFeaturedProducts(response.data);
            }
        } catch (error) {
            console.error('Load featured error', error);
        }
    }, []);

    // Initial load helper
    const initShop = useCallback(() => {
        loadCategories();
        loadFeatured();
        loadProducts();
    }, [loadCategories, loadFeatured, loadProducts]);

    return {
        products,
        categories,
        featuredProducts,
        loading,
        page,
        totalPages,
        loadProducts,
        loadCategories,
        initShop
    };
}
