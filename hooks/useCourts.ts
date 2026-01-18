import { useCallback, useEffect, useState } from 'react';
import { Court, CourtSearchParams, courtService } from '../services/courtService';
import { Page } from '../types/api';

export function useCourts(initialParams: CourtSearchParams = { page: 0, size: 10 }) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search logic could be complex with debouncing, simple version for now
    const loadCourts = useCallback(async (params: CourtSearchParams = initialParams, isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await courtService.searchCourts(params);

            // Backend returns ApiResponse<Page<Court>>
            if (response.success && response.data) {
                const pageData: Page<Court> = response.data;
                setCourts(pageData.content);
            }
        } catch (error) {
            console.error('Hooks: Load courts error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    return { courts, loading, refreshing, search: loadCourts };
}
