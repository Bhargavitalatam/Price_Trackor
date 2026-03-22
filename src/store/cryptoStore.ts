import { create } from 'zustand';

export interface CryptoPrice {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    timestamp: number;
}

interface CryptoState {
    prices: Record<string, CryptoPrice>;
    loading: boolean;
    error: string | null;
    selectedCryptoId: string | null;
    addOrUpdatePrice: (priceData: CryptoPrice) => void;
    batchUpdatePrices: (priceDataArray: CryptoPrice[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (errorMessage: string | null) => void;
    setSelectedCryptoId: (id: string | null) => void;
}

export const useCryptoStore = create<CryptoState>((set) => ({
    prices: {},
    loading: true,
    error: null,
    selectedCryptoId: null,
    addOrUpdatePrice: (priceData) => set((state) => ({
        prices: { 
            ...state.prices, 
            [priceData.symbol]: priceData 
        },
        loading: false // Once we get data, we are not loading anymore
    })),
    batchUpdatePrices: (priceDataArray) => set((state) => {
        const newPrices = { ...state.prices };
        priceDataArray.forEach(p => {
            newPrices[p.symbol] = p;
        });
        return { 
            prices: newPrices,
            loading: false
        };
    }),
    setLoading: (isLoading) => set({ loading: isLoading }),
    setError: (errorMessage) => set({ error: errorMessage }),
    setSelectedCryptoId: (id) => set({ selectedCryptoId: id })
}));
