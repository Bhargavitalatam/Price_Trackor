import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CryptoCard from './CryptoCard';
import { useCryptoStore } from '../store/cryptoStore';

// Mock the store
vi.mock('../store/cryptoStore', () => ({
    useCryptoStore: vi.fn()
}));

describe('CryptoCard', () => {
    const mockData = {
        symbol: 'BTCUSDT',
        price: 50000,
        change24h: 5.5,
        volume24h: 1000,
        timestamp: Date.now()
    };

    const mockSetSelectedCryptoId = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useCryptoStore as any).mockImplementation((selector: any) => {
            const state = {
                prices: {
                    'BTCUSDT': mockData
                },
                selectedCryptoId: 'ETHUSDT',
                setSelectedCryptoId: mockSetSelectedCryptoId
            };
            return selector(state);
        });
    });

    it('renders the symbol and price correctly', () => {
        render(<CryptoCard symbol="BTCUSDT" />);
        expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
        expect(screen.getByText('50,000.00')).toBeInTheDocument();
        expect(screen.getByText('5.50%')).toBeInTheDocument();
    });

    it('calls setSelectedCryptoId on click', () => {
        render(<CryptoCard symbol="BTCUSDT" />);
        const card = screen.getByRole('button');
        fireEvent.click(card);
        expect(mockSetSelectedCryptoId).toHaveBeenCalledWith('BTCUSDT');
    });

    it('calls setSelectedCryptoId on Enter key press', () => {
        render(<CryptoCard symbol="BTCUSDT" />);
        const card = screen.getByRole('button');
        fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
        expect(mockSetSelectedCryptoId).toHaveBeenCalledWith('BTCUSDT');
    });

    it('renders null if data is missing', () => {
        (useCryptoStore as any).mockImplementation((selector: any) => {
            const state = { prices: {}, selectedCryptoId: null, setSelectedCryptoId: vi.fn() };
            return selector(state);
        });
        const { container } = render(<CryptoCard symbol="UNKNOWN" />);
        expect(container).toBeEmptyDOMElement();
    });
});
