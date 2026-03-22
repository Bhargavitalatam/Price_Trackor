import { useState } from 'react'
import { useHistoricalData } from './hooks/useHistoricalData'
import { useWebSocket } from './hooks/useWebSocket'
import { useCryptoPrices } from './hooks/useCryptoPrices'
import CryptoList from './components/CryptoList'
import HistoricalChart from './components/HistoricalChart'
import { LineChart, BarChart3, Clock, AlertCircle } from 'lucide-react'

function App() {
  const [timeRange, setTimeRange] = useState(7)
  const { selectedCryptoId } = useCryptoPrices()

  useWebSocket() // Initializes and buffers the WebSocket stream
  const { data: chartData, loading: chartLoading, error: chartError } = useHistoricalData(selectedCryptoId, timeRange)

  const timeRanges = [
    { label: '1H', value: 0.0416 }, // Approx 1 hour (1/24 days)
    { label: '24H', value: 1 },
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ]

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-blue-500/30 relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Live Market
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2">
              CryptoTrackor<span className="text-blue-500">.</span>
            </h1>
            <p className="text-slate-400 max-w-md">
              Institutional-grade real-time market data dashboard with lightning-fast WebSocket integration.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50" role="navigation" aria-label="Main Navigation">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20" aria-label="Go to Dashboard">
              <BarChart3 size={16} />
              Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 font-bold text-sm hover:text-white transition-colors" aria-label="Go to Markets">
              <LineChart size={16} />
              Markets
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <section className="lg:col-span-8 space-y-8" aria-labelledby="chart-section-title">
            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/50 bg-slate-800/20">
                <div>
                  <h2 id="chart-section-title" className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChart className="text-blue-500" aria-hidden="true" size={24} />
                    {selectedCryptoId ? `Market History: ${selectedCryptoId}` : 'Select an Asset'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Price change over selected period</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50" role="tablist" aria-label="Time Range Selector">
                  {timeRanges.map((range) => (
                    <button
                      key={range.value}
                      role="tab"
                      aria-selected={timeRange === range.value}
                      aria-label={`Select ${range.label} time range`}
                      onClick={() => setTimeRange(range.value)}
                      className={`
                        px-4 py-2 rounded-lg text-xs font-black transition-all
                        ${timeRange === range.value 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }
                      `}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 h-[400px] relative">
                {selectedCryptoId ? (
                  <>
                    {chartLoading && (
                      <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
                          <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Data...</p>
                        </div>
                      </div>
                    )}
                    {chartError ? (
                      <div className="h-full flex flex-col items-center justify-center text-rose-400 gap-4 text-center px-4">
                        <AlertCircle size={48} className="opacity-50" />
                        <p className="font-medium">{chartError}</p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-sm font-bold hover:bg-rose-500/20 transition-all"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : !chartData || chartData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 text-center px-4">
                        <div className="p-6 bg-slate-900/50 rounded-full border border-slate-700/50 mb-2">
                          <AlertCircle size={40} className="text-slate-700" />
                        </div>
                        <p className="text-lg font-bold text-slate-400">No Data Available</p>
                        <p className="text-sm max-w-xs px-6">Historical data couldn't be found for {selectedCryptoId} in the selected time range.</p>
                      </div>
                    ) : (
                      <HistoricalChart data={chartData} symbol={selectedCryptoId} days={timeRange} />
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
                    <div className="p-6 bg-slate-900/50 rounded-full border border-slate-700/50 mb-2">
                      <Clock size={40} className="text-slate-700" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No Asset Selected</p>
                    <p className="text-sm max-w-xs px-6">Click on a card from the list on the right to view detailed historical market trends.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Market Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Market Cap', value: '$2.4T', change: '+2.4%', color: 'blue' },
                { label: 'Volume 24h', value: '$84.2B', change: '-12.1%', color: 'purple' },
                { label: 'BTC Dominance', value: '52.1%', change: '+0.5%', color: 'orange' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl hover:bg-slate-800/60 transition-colors">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} mt-1 inline-block`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 lg:sticky lg:top-8 h-fit lg:max-h-[calc(100vh-4rem)]">
            <div className="glass-card rounded-3xl overflow-hidden flex flex-col max-h-full">
               <div className="p-6 border-b border-slate-700/50 bg-slate-800/20">
                  <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Live Heatmap</h3>
               </div>
               <div className="p-4 overflow-y-auto">
                  <CryptoList />
               </div>
            </div>
          </aside>
        </main>

        <footer className="mt-20 pt-8 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm">
            © 2026 CryptoTrackor Pro. High-frequency market data provided by Binance & CoinGecko.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
