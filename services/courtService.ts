// services/courtService.ts
import apiClient from "./apiClient";

export interface Court {
    id: number;
    name: string;
    address: string;
    description: string;
    pricePerHour: number;
    numberOfCourts: number;
    openTime: string;
    closeTime: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    imageUrl?: string;
    owner: {
        id: number;
        fullName: string;
        email: string;
    };
}

export interface CourtSearchParams {
    name?: string;
    address?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

export const courtService = {
    // Lấy tất cả sân
    getAllCourts: async (page = 0, size = 10) => {
        try {
            const response = await apiClient.get('/courts', {
                params: { page, size, sortBy: 'createdAt', sortDir: 'DESC' }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Get all courts error:', error);
            throw error;
        }
    },

    // Tìm kiếm sân
    searchCourts: async (params: CourtSearchParams) => {
        try {
            const response = await apiClient.get('/courts/search', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Search courts error:', error);
            throw error;
        }
    },

    // Lấy chi tiết sân
    getCourtById: async (id: number) => {
        try {
            const response = await apiClient.get(`/courts/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Get court by id error:', error);
            throw error;
        }
    },

    // Lấy sân của owner (nếu là owner)
    getMyCourts: async () => {
        try {
            const response = await apiClient.get('/courts/my-courts');
            return response.data;
        } catch (error) {
            console.error('❌ Get my courts error:', error);
            throw error;
        }
    },
};
