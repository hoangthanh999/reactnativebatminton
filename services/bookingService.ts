// services/bookingService.ts
import apiClient from "./apiClient";

export interface BookingRequest {
    courtId: number;
    courtNumber: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    // ❌ XÓA DÒNG NÀY: totalPrice: number;
    notes?: string;
}

export interface Booking {
    id: number;
    courtId: number;
    courtName: string;
    courtAddress: string;
    courtNumber: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number; // ✅ Giữ lại trong response
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    notes?: string;
    createdAt: string;
    user?: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
    };
}

export const bookingService = {
    createBooking: async (data: BookingRequest) => {
        try {
            console.log('📤 Creating booking:', data);
            const response = await apiClient.post('/bookings', data);
            console.log('📥 Booking created:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create booking error:', error.response?.data || error);
            throw error;
        }
    },

    getMyBookings: async (page = 0, size = 10) => {
        try {
            console.log('📤 Getting my bookings:', { page, size });
            const response = await apiClient.get('/bookings/my-bookings', {
                params: { page, size }
            });
            console.log('📥 My bookings:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get my bookings error:', error.response?.data || error);
            throw error;
        }
    },

    getBookingById: async (id: number) => {
        try {
            console.log('📤 Getting booking by id:', id);
            const response = await apiClient.get(`/bookings/${id}`);
            console.log('📥 Booking detail:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get booking by id error:', error.response?.data || error);
            throw error;
        }
    },

    cancelBooking: async (id: number) => {
        try {
            console.log('📤 Cancelling booking:', id);
            const response = await apiClient.delete(`/bookings/${id}`);
            console.log('📥 Booking cancelled:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Cancel booking error:', error.response?.data || error);
            throw error;
        }
    },
};
