import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useHistoricalData from './useHistoricalData';
import { cryptoApiService } from '../services/CryptoApiService';

// Mock the service
vi.mock('../services/CryptoApiService', () => {
    return {
        cryptoApiService: {
            fetchHistoricalData: vi.fn()
        }
    };
});

describe('useHistoricalData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty data and not load if cryptoId is null', () => {
        const { result } = renderHook(() => useHistoricalData(null, 7));
        
        expect(result.current.data).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should fetch data successfully', async () => {
        const mockData = [
            { timestamp: 1600000000000, price: 50000 },
            { timestamp: 1600086400000, price: 51000 }
        ];
        
        (cryptoApiService.fetchHistoricalData as any).mockResolvedValue(mockData);

        const { result } = renderHook(() => useHistoricalData('BTCUSDT', 7));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
        expect(cryptoApiService.fetchHistoricalData).toHaveBeenCalledWith('BTCUSDT', 7);
    });

    it('should handle fetch error', async () => {
        const error = new Error('API Error');
        (cryptoApiService.fetchHistoricalData as any).mockRejectedValue(error);

        const { result } = renderHook(() => useHistoricalData('BTCUSDT', 7));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual([]);
        expect(result.current.error).toBe('API Error');
    });
});
