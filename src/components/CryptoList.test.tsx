import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CryptoList from './CryptoList';
import { useCryptoStore } from '../store/cryptoStore';

vi.mock('../store/cryptoStore', () => ({
    useCryptoStore: vi.fn()
}));

// Mock CryptoCard to isolate tests
vi.mock('./CryptoCard', () => ({
    default: ({ symbol }: { symbol: string }) => <div data-testid="crypto-card">{symbol}</div>
}));

describe('CryptoList', () => {
    const mockPrices = {
        'BTCUSDT': { symbol: 'BTCUSDT', price: 50000, volume24h: 1000 },
        'ETHUSDT': { symbol: 'ETHUSDT', price: 3000, volume24h: 2000 },
        'BNBUSDT': { symbol: 'BNBUSDT', price: 500, volume24h: 500 }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        (useCryptoStore as any).mockImplementation((selector: any) => {
            const state = { prices: mockPrices, loading: false };
            return selector(state);
        });
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders search input and filters correctly', async () => {
        render(<CryptoList />);
        
        // Initial render should show all cards (throttled/initial update)
        expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
        expect(screen.getByText('ETHUSDT')).toBeInTheDocument();
        expect(screen.getByText('BNBUSDT')).toBeInTheDocument();

        // Search for ETH
        const searchInput = screen.getByPlaceholderText('Search assets...');
        fireEvent.change(searchInput, { target: { value: 'eth' } });

        // Fast-forward immediate search update
        vi.advanceTimersByTime(0);

        // Should only show ETHUSDT
        expect(screen.getByText('ETHUSDT')).toBeInTheDocument();
        expect(screen.queryByText('BTCUSDT')).not.toBeInTheDocument();
        expect(screen.queryByText('BNBUSDT')).not.toBeInTheDocument();
    });

    it('renders empty state when no matches found', () => {
        render(<CryptoList />);
        const searchInput = screen.getByPlaceholderText('Search assets...');
        fireEvent.change(searchInput, { target: { value: 'unknown' } });

        expect(screen.getByText('No assets found matching "unknown"')).toBeInTheDocument();
    });

    it('clears search input when clear button is clicked', () => {
        render(<CryptoList />);
        const searchInput = screen.getByPlaceholderText('Search assets...');
        fireEvent.change(searchInput, { target: { value: 'btc' } });
        
        const clearButton = screen.getByLabelText('Clear search');
        fireEvent.click(clearButton);

        expect((searchInput as HTMLInputElement).value).toBe('');
    });
});
