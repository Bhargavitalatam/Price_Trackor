export interface CryptoMessage {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    timestamp: number;
}

type MessageCallback = (data: CryptoMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private reconnectIntervalMs: number = 1000;
    private isConnected: boolean = false;
    private subscribers: Set<MessageCallback> = new Set();

    constructor(url: string) {
        this.url = url;
    }

    public connect(): void {
        if (this.ws || this.isConnected) return;

        try {
            this.ws = new WebSocket(this.url);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.attemptReconnect();
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.reconnectAttempts = 0;
    }

    private setupEventListeners(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.reconnectIntervalMs = 1000;
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Binance miniTicker format: { "e": "24hrMiniTicker", "E": 123456789, "s": "BNBBTC", "c": "0.0025", "o": "0.0010", "h": "0.0025", "l": "0.0010", "v": "10000", "q": "18" }
                // If it's an array (like !miniTicker@arr), map it
                if (Array.isArray(data)) {
                    data.forEach((item: any) => this.processMessage(item));
                } else {
                    this.processMessage(data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.notifySubscribers({ 
                symbol: 'ERROR', 
                price: 0, 
                change24h: 0, 
                volume24h: 0, 
                timestamp: Date.now(),
                error: 'Connection error' 
            } as any);
        };

        this.ws.onclose = (event) => {
            console.log(`WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
            this.isConnected = false;
            this.ws = null;
            
            // Handle specific close codes if needed (e.g. 1008 Policy Violation for rate limits)
            if (event.code === 1008) {
                console.error('Rate limit reached on Binance WebSocket');
                this.reconnectIntervalMs = 30000; // Increase backoff significantly
            }
            
            this.attemptReconnect();
        };
    }

    private processMessage(item: any): void {
        const cryptoMessage: CryptoMessage = {
            symbol: item.s,
            price: parseFloat(item.c),
            change24h: ((parseFloat(item.c) - parseFloat(item.o)) / parseFloat(item.o)) * 100,
            volume24h: parseFloat(item.v),
            timestamp: item.E
        };
        this.notifySubscribers(cryptoMessage);
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const backoff = this.reconnectIntervalMs * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`Attempting reconnect in ${backoff}ms (Attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, backoff);
    }

    public subscribeToMessages(callback: MessageCallback): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    private notifySubscribers(data: CryptoMessage): void {
        this.subscribers.forEach(callback => callback(data));
    }
}

// Using Binance !miniTicker@arr for all symbols or could use individual ones
export const wsService = new WebSocketService('wss://stream.binance.com:9443/ws/!miniTicker@arr');
