import { useCallback, useEffect, useState } from 'react';
import { Booking, bookingService } from '../services/bookingService';
import { ApiResponse, Page } from '../types/api';

export function useMyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
    });

    const loadBookings = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Using any here temporarily because service returns raw data structure which matches ApiResponse in shape but isn't typed yet
            const response = await bookingService.getMyBookings(0, 5);

            // Backend returns ApiResponse<Page<Booking>>
            if (response.success && response.data) {
                const pageData: Page<Booking> = response.data;
                const bookingData = pageData.content;
                setBookings(bookingData);

                setStats({
                    totalBookings: pageData.totalElements,
                    confirmedBookings: bookingData.filter(b => b.status === 'CONFIRMED').length,
                    pendingBookings: bookingData.filter(b => b.status === 'PENDING').length,
                    completedBookings: bookingData.filter(b => b.status === 'COMPLETED').length,
                });
            }
        } catch (error) {
            console.error('Hooks: Load bookings error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    return { bookings, stats, loading, refreshing, refresh: () => loadBookings(true) };
}
