# Application Programming Interfaces

CryptoTrackor relies on two core external streaming architectures to fetch real-world financial data. Below is the documentation detailing those endpoints.

## 🔴 Real-Time Price Streams (Binance)
- **Protocol**: `WebSocket Secure (WSS)`
- **Network Scope**: Global
- **Frequency**: 10 updates per second on average.

We connect to the `!miniTicker@arr` raw stream, rather than subscribing to individual assets, to populate our global Heatmap instantly.

**Connection Endpoint:**
`wss://stream.binance.com:9443/ws/!miniTicker@arr`

**Response Output (Mini-Ticker Array):**
```json
[
  {
    "e": "24hrMiniTicker",  // Event type
    "E": 123456789,         // Event time
    "s": "BNBBTC",          // Symbol
    "c": "0.0025",          // Close price (Current Live)
    "o": "0.0010",          // Open price
    "h": "0.0025",          // High price
    "l": "0.0010",          // Low price
    "v": "10000",           // Total traded base asset volume
    "q": "18"               // Total traded quote asset volume
  }
]
```

## 🔵 Historical Market Charts (CoinGecko)
- **Protocol**: `REST HTTP GET`
- **Network Scope**: Server-Side Rate-Limited
- **Authentication**: Public Free Tier (No explicit auth header, bound by IP restrictions)

We map Binance tickers into internal CoinGecko core IDs. 

**Connection Endpoint:**
`https://api.coingecko.com/api/v3/coins/{id}/market_chart`

**Required Parameters:**
- `vs_currency=usd`
- `days={1|7|30|90|etc}`

**Response Output:**
```json
{
  "prices": [
    [
      1628121600000, // Unix Timestamp
      39500.25       // Price at that exact time
    ],
    // ...
  ],
  "market_caps": [], // Unused
  "total_volumes": [] // Unused
}
```
