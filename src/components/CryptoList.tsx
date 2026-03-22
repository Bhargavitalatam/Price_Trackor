import { useState, useEffect } from 'react';
import { useCryptoStore } from '../store/cryptoStore';
import CryptoCard from './CryptoCard';
import { Search, Info, X } from 'lucide-react';

const CryptoList = () => {
    const prices = useCryptoStore((state) => state.prices);
    const loading = useCryptoStore((state) => state.loading);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedSymbols, setDisplayedSymbols] = useState<string[]>([]);

    // Performance optimization: Throttle the sorting/filtering of the symbol list
    useEffect(() => {
        const updateList = () => {
            const allItems = Object.values(prices);
            let filtered: string[];

            if (!searchQuery.trim()) {
                filtered = allItems
                    .sort((a, b) => b.volume24h - a.volume24h)
                    .slice(0, 20)
                    .map(item => item.symbol);
            } else {
                const query = searchQuery.toLowerCase();
                filtered = allItems
                    .filter(item => item.symbol.toLowerCase().includes(query))
                    .sort((a, b) => b.volume24h - a.volume24h)
                    .slice(0, 50)
                    .map(item => item.symbol);
            }
            setDisplayedSymbols(filtered);
        };

        // If searching, update immediately for responsiveness
        if (searchQuery.trim()) {
            updateList();
            return;
        }

        // Otherwise, throttle updates to every 1.5 seconds to maintain 60fps
        const timer = setInterval(updateList, 1500);
        updateList(); // Initial call
        
        return () => clearInterval(timer);
    }, [prices, searchQuery]);

    if (loading && Object.keys(prices).length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-44 bg-slate-800/30 rounded-2xl animate-pulse border border-slate-700/50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} aria-hidden="true" />
                    <input 
                        type="text" 
                        placeholder="Search assets (e.g. BTC, ETH)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search cryptocurrencies"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search query"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/50" role="status" aria-live="polite">
                    <Info size={14} className="text-blue-400" aria-hidden="true" />
                    {searchQuery ? `Found ${displayedSymbols.length} matches` : `Top ${displayedSymbols.length} by volume`}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedSymbols.map((symbol) => (
                    <CryptoCard key={symbol} symbol={symbol} />
                ))}
            </div>

            {displayedSymbols.length === 0 && (
                <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                    <p className="text-slate-500 italic">No assets found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};

export default CryptoList;
