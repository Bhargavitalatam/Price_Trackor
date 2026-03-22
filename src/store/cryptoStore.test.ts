import { describe, it, expect, beforeEach } from 'vitest';
import { useCryptoStore } from './cryptoStore';

describe('cryptoStore', () => {
    beforeEach(() => {
        useCryptoStore.setState({
            prices: {},
            loading: true,
            error: null,
            selectedCryptoId: null
        });
    });

    it('should have initial state', () => {
        const state = useCryptoStore.getState();
        expect(state.prices).toEqual({});
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.selectedCryptoId).toBeNull();
    });

    it('should add or update price', () => {
        const mockPrice = {
            symbol: 'BTCUSDT',
            price: 50000,
            change24h: 5.5,
            volume24h: 1000,
            timestamp: Date.now()
        };

        useCryptoStore.getState().addOrUpdatePrice(mockPrice);

        const state = useCryptoStore.getState();
        expect(state.prices['BTCUSDT']).toEqual(mockPrice);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should batch update prices', () => {
        const mockPrices = [
            { symbol: 'BTCUSDT', price: 50000, change24h: 5.5, volume24h: 1000, timestamp: Date.now() },
            { symbol: 'ETHUSDT', price: 3000, change24h: -2.1, volume24h: 500, timestamp: Date.now() }
        ];

        useCryptoStore.getState().batchUpdatePrices(mockPrices);

        const state = useCryptoStore.getState();
        expect(state.prices['BTCUSDT'].price).toBe(50000);
        expect(state.prices['ETHUSDT'].price).toBe(3000);
        expect(state.loading).toBe(false);
    });

    it('should set selected crypto id', () => {
        useCryptoStore.getState().setSelectedCryptoId('ETHUSDT');
        expect(useCryptoStore.getState().selectedCryptoId).toBe('ETHUSDT');
    });

    it('should set error', () => {
        useCryptoStore.getState().setError('Connection failed');
        expect(useCryptoStore.getState().error).toBe('Connection failed');
        expect(useCryptoStore.getState().loading).toBe(false);
    });
});
