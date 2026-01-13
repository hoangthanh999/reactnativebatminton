// services/bookingService.ts
import apiClient from "./apiClient";

export interface BookingRequest {
    courtId: number;
    courtNumber: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
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
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    notes?: string;
    createdAt: string;
    user?: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
    };
    payment?: {
        id: number;
        status: string;
        paymentType: string;
        amount: number;
        depositAmount: number;
        remainingAmount: number;
    };
}
export const bookingService = {
    // ================= USER =================
    createBooking: async (data: BookingRequest) => {
        const response = await apiClient.post('/bookings', data);
        return response.data;
    },

    getMyBookings: async (page = 0, size = 10) => {
        const response = await apiClient.get('/bookings/my-bookings', {
            params: { page, size },
        });
        return response.data;
    },

    getBookingById: async (id: number) => {
        const response = await apiClient.get(`/bookings/${id}`);
        return response.data;
    },

    cancelBooking: async (id: number) => {
        const response = await apiClient.delete(`/bookings/${id}`);
        return response.data;
    },

    // ================= OWNER =================
    getOwnerBookings: async (page = 0, size = 10) => {
        const response = await apiClient.get('/bookings/owner-bookings', {
            params: { page, size },
        });
        return response.data;
    },

    getCourtBookings: async (courtId: number) => {
        const response = await apiClient.get(`/bookings/court/${courtId}`);
        return response.data;
    },

    // ================= ADMIN =================
    getAllBookings: async (page = 0, size = 10) => {
        const response = await apiClient.get('/bookings/all', {
            params: { page, size },
        });
        return response.data;
    },

    updateBookingStatus: async (id: number, status: string) => {
        const response = await apiClient.patch(
            `/bookings/${id}/status`,
            null,
            { params: { status } }
        );
        return response.data;
    },
};
