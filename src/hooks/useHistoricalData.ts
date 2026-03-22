import { useState, useEffect, useCallback } from 'react';
import { cryptoApiService, HistoricalDataPoint } from '../services/CryptoApiService';

export const useHistoricalData = (symbol: string | null, days: number = 7) => {
    const [data, setData] = useState<HistoricalDataPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!symbol) return;

        setLoading(true);
        setError(null);

        try {
            const result = await cryptoApiService.fetchHistoricalData(symbol, days);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch historical data');
        } finally {
            setLoading(false);
        }
    }, [symbol, days]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};
