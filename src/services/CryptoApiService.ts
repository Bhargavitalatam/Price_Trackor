import axios from 'axios';

export interface HistoricalDataPoint {
    timestamp: number;
    price: number;
}

const SYMBOL_MAP: Record<string, string> = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'SOLUSDT': 'solana',
    'ADAUSDT': 'cardano',
    'XRPUSDT': 'ripple',
    'DOTUSDT': 'polkadot',
    'DOGEUSDT': 'dogecoin',
    'LINKUSDT': 'chainlink',
    'MATICUSDT': 'matic-network',
    'AVAXUSDT': 'avalanche-2',
    'SHIBUSDT': 'shiba-inu',
    'TRXUSDT': 'tron',
    'LTCUSDT': 'litecoin',
    'BCHUSDT': 'bitcoin-cash',
    'UNIUSDT': 'uniswap',
    'NEARUSDT': 'near',
    'APTUSDT': 'aptos',
    'ARBUSDT': 'arbitrum',
    'OPUSDT': 'optimism',
};

class CryptoApiService {
    private baseUrl: string;
    private cache = new Map<string, { data: HistoricalDataPoint[]; timestamp: number }>();
    private cacheDurationMs: number = 5 * 60 * 1000; // 5 minutes
    private requestQueue: Map<string, Promise<HistoricalDataPoint[]>> = new Map();

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async fetchHistoricalData(symbol: string, days: number = 7): Promise<HistoricalDataPoint[]> {
        // 1. Try SYMBOL_MAP
        let coinId = SYMBOL_MAP[symbol];
        
        // 2. If not in map, try some heuristics
        if (!coinId) {
            const cleanSymbol = symbol.toUpperCase();
            if (cleanSymbol.endsWith('USDT')) {
                coinId = cleanSymbol.replace('USDT', '').toLowerCase();
            } else if (cleanSymbol.endsWith('BUSD')) {
                coinId = cleanSymbol.replace('BUSD', '').toLowerCase();
            } else {
                coinId = cleanSymbol.toLowerCase();
            }
        }

        const cacheKey = `${coinId}-${days}`;
        const storageKey = `CT_HIST_${cacheKey}`;

        // Phase A: Check in-memory cache
        const memoized = this.cache.get(cacheKey);
        if (memoized && Date.now() - memoized.timestamp < this.cacheDurationMs) {
            console.log(`Returning in-memory cache for ${cacheKey}`);
            return memoized.data;
        }

        // Phase B: Check localStorage persistence
        const persisted = this._loadFromLocalStorage(storageKey);
        if (persisted && Date.now() - persisted.timestamp < this.cacheDurationMs) {
            console.log(`Returning localStorage cache for ${cacheKey}`);
            this.cache.set(cacheKey, persisted); // Sync back to memory
            return persisted.data;
        }

        // Phase C: Check if there's already a pending request
        const pendingRequest = this.requestQueue.get(cacheKey);
        if (pendingRequest) {
            console.log(`Awaiting pending request for ${cacheKey}`);
            return pendingRequest;
        }

        // Create new request
        const fetchPromise = this.fetchFromApi(coinId, days).finally(() => {
            this.requestQueue.delete(cacheKey);
        });

        this.requestQueue.set(cacheKey, fetchPromise);

        try {
            const data = await fetchPromise;
            const cacheEntry = { data, timestamp: Date.now() };
            this.cache.set(cacheKey, cacheEntry);
            this._saveToLocalStorage(storageKey, cacheEntry);
            return data;
        } catch (error) {
            console.error(`Failed to fetch historical data for ${coinId}:`, error);
            throw error;
        }
    }

    private _saveToLocalStorage(key: string, entry: { data: HistoricalDataPoint[]; timestamp: number }): void {
        try {
            localStorage.setItem(key, JSON.stringify(entry));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
            // If quota exceeded, clear some old CT entries
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                this._clearOldCache();
            }
        }
    }

    private _loadFromLocalStorage(key: string): { data: HistoricalDataPoint[]; timestamp: number } | null {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return null;
        }
    }

    private _clearOldCache(): void {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('CT_HIST_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.error('Error clearing cache:', e);
        }
    }

    private async fetchFromApi(coinId: string, days: number): Promise<HistoricalDataPoint[]> {
        try {
            // CoinGecko API: /coins/{id}/market_chart?vs_currency=usd&days={days}
            const response = await axios.get(`${this.baseUrl}/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: days,
                    interval: days <= 1 ? 'hourly' : 'daily'
                }
            });

            if (!response.data || !response.data.prices) {
                throw new Error('Invalid response format from CoinGecko');
            }

            return response.data.prices.map((p: [number, number]) => ({
                timestamp: p[0],
                price: p[1]
            }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 429) {
                    throw new Error('CoinGecko API rate limit reached. Please wait a moment.');
                }
                if (error.response?.status === 404) {
                    throw new Error(`Data for "${coinId}" not found on CoinGecko.`);
                }
            }
            throw new Error('Failed to fetch historical data. Please check your connection.');
        }
    }
}

// In Vite, we use import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_REST_API_URL || 'https://api.coingecko.com/api/v3';
export const cryptoApiService = new CryptoApiService(API_URL);
