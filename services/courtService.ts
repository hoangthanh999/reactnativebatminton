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
    images?: string[];  // ✅ Backend trả về array
    facilities?: string[];  // ✅ Backend trả về array
    owner: {
        id: number;
        fullName: string;
        email: string;
    };
}
export interface CourtRequest {
    name: string;
    address: string;
    description: string;
    pricePerHour: number;
    numberOfCourts: number;
    openTime: string;
    closeTime: string;
    images?: string[]; // Cloudinary URLs
    facilities?: string[];
}

// Helper function để lấy ảnh đầu tiên
export const getCourtImage = (court: Court): string | undefined => {
    return court.images && court.images.length > 0 ? court.images[0] : undefined;
};

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
    // Tạo sân mới
    createCourt: async (data: CourtRequest) => {
        try {
            console.log('📤 Creating court:', data);
            const response = await apiClient.post('/courts', data);
            console.log('✅ Court created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Create court error:', error);
            throw error;
        }
    },

    // Cập nhật sân
    updateCourt: async (id: number, data: Partial<CourtRequest>) => {
        try {
            console.log('📤 Updating court:', id, data);
            const response = await apiClient.put(`/courts/${id}`, data);
            console.log('✅ Court updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update court error:', error);
            throw error;
        }
    },

    // Xóa sân
    deleteCourt: async (id: number) => {
        try {
            console.log('🗑️ Deleting court:', id);
            const response = await apiClient.delete(`/courts/${id}`);
            console.log('✅ Court deleted');
            return response.data;
        } catch (error) {
            console.error('❌ Delete court error:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái
    updateCourtStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') => {
        try {
            console.log('📤 Updating court status:', id, status);
            const response = await apiClient.patch(`/courts/${id}/status`, null, {
                params: { status }
            });
            console.log('✅ Court status updated');
            return response.data;
        } catch (error) {
            console.error('❌ Update court status error:', error);
            throw error;
        }
    },
};

