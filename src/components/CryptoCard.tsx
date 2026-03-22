import { memo, useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useCryptoStore } from '../store/cryptoStore';

interface CryptoCardProps {
    symbol: string;
}

const CryptoCard = memo(({ symbol }: CryptoCardProps) => {
    const data = useCryptoStore((state) => state.prices[symbol]);
    const setSelectedCryptoId = useCryptoStore((state) => state.setSelectedCryptoId);
    const selectedCryptoId = useCryptoStore((state) => state.selectedCryptoId);
    
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);
    const prevPrice = useRef(data?.price || 0);

    useEffect(() => {
        if (!data) return;
        if (data.price > prevPrice.current && prevPrice.current !== 0) {
            setFlash('up');
            const timer = setTimeout(() => setFlash(null), 600);
            return () => clearTimeout(timer);
        } else if (data.price < prevPrice.current && prevPrice.current !== 0) {
            setFlash('down');
            const timer = setTimeout(() => setFlash(null), 600);
            return () => clearTimeout(timer);
        }
        prevPrice.current = data.price;
    }, [data?.price]);

    if (!data) return null;

    const isPositive = data.change24h >= 0;
    const isSelected = selectedCryptoId === data.symbol;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedCryptoId(data.symbol);
        }
    };

    return (
        <div 
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`View details for ${data.symbol}. Current price ${data.price.toFixed(2)} USDT, 24 hour change ${data.change24h.toFixed(2)}%.`}
            onClick={() => setSelectedCryptoId(data.symbol)}
            onKeyDown={handleKeyDown}
            className={`
                relative overflow-hidden cursor-pointer transition-all duration-300 
                p-5 rounded-2xl border flex flex-col gap-4 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isSelected 
                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-xl'
                }
                ${flash === 'up' ? 'animate-flash-emerald' : ''}
                ${flash === 'down' ? 'animate-flash-rose' : ''}
            `}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl scale-110 transition-transform ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-100">{data.symbol}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Binance Spot</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(data.change24h).toFixed(2)}%
                </div>
            </div>

            <div className="mt-2">
                <div className="flex items-baseline gap-1" aria-live="polite">
                    <span className={`text-2xl font-black transition-colors duration-300 ${flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-rose-400' : 'text-white'} tracking-tight`}>
                        {data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">USDT</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-3">
                <div className="flex items-center gap-1">
                    <DollarSign size={12} />
                    <span>Vol: {data.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center gap-1 text-blue-400 font-semibold">
                    Details →
                </div>
            </div>

            {/* Subtle glow effect for positive movement */}
            {isPositive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
            )}
        </div>
    );
});

CryptoCard.displayName = 'CryptoCard';

export default CryptoCard;
