// services/productService.ts
import apiClient from "./apiClient";
import { Product, ProductDetail, ProductCategory, ProductSearchParams } from "../types/shop";
import { Page, ApiResponse } from "../types/api";

export const productService = {
    // Lấy danh sách sản phẩm (có phân trang & sort)
    getAllProducts: async (page = 0, size = 20, sortBy = 'createdAt', sortDir = 'DESC') => {
        const response = await apiClient.get<ApiResponse<Page<Product>>>('/shop/products', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Tìm kiếm sản phẩm
    searchProducts: async (params: ProductSearchParams) => {
        // Backend đang dùng POST cho search
        const response = await apiClient.post<ApiResponse<Page<Product>>>('/shop/products/search', {
            keyword: params.keyword,
            categoryId: params.categoryId,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            page: params.page,
            size: params.size
        });
        return response.data;
    },

    // Chi tiết sản phẩm
    getProductById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<ProductDetail>>(`/shop/products/${id}`);
        return response.data;
    },

    // Sản phẩm theo danh mục
    getProductsByCategory: async (categoryId: number, page = 0, size = 20) => {
        const response = await apiClient.get<ApiResponse<Page<Product>>>(`/shop/products/category/${categoryId}`, {
            params: { page, size }
        });
        return response.data;
    },

    // Danh sách danh mục
    getCategories: async () => {
        const response = await apiClient.get<ApiResponse<ProductCategory[]>>('/shop/categories/active');
        return response.data;
    },

    // Sản phẩm nổi bật
    getFeaturedProducts: async () => {
        const response = await apiClient.get<ApiResponse<Product[]>>('/shop/products/featured');
        return response.data;
    },

    // Sản phẩm bán chạy
    getBestSellingProducts: async () => {
        const response = await apiClient.get<ApiResponse<Product[]>>('/shop/products/best-selling');
        return response.data;
    },

    // Sản phẩm mới
    getNewProducts: async () => {
        const response = await apiClient.get<ApiResponse<Product[]>>('/shop/products/new-arrivals');
        return response.data;
    }
};
