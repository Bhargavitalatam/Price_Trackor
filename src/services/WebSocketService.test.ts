import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketService } from './WebSocketService';

class MockWebSocket {
    onopen: any;
    onmessage: any;
    onerror: any;
    onclose: any;
    readyState = 1;
    constructor(public url: string) {}
    close() {}
    send(_data: string) {}
}

describe('WebSocketService', () => {
    let wsService: WebSocketService;
    let originalWebSocket: any;

    beforeEach(() => {
        originalWebSocket = globalThis.WebSocket;
        globalThis.WebSocket = MockWebSocket as any;
        wsService = new WebSocketService('wss://test.url');
        vi.useFakeTimers();
    });

    afterEach(() => {
        globalThis.WebSocket = originalWebSocket;
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('should initialize but not connect immediately', () => {
        expect(wsService).toBeInstanceOf(WebSocketService);
        expect((wsService as any).ws).toBeNull();
    });

    it('should connect and trigger onopen', () => {
        wsService.connect();
        const wsInstance = (wsService as any).ws;
        expect(wsInstance).toBeTruthy();
        expect(wsInstance.url).toBe('wss://test.url');
    });

    it('should handle incoming messages and notify subscribers', () => {
        wsService.connect();
        const wsInstance = (wsService as any).ws;
        
        const callback = vi.fn();
        wsService.subscribeToMessages(callback);

        // Simulate message
        const mockMessage = {
            s: 'BTCUSDT',
            c: '50000.50',
            P: '2.5',
            v: '1000'
        };

        wsInstance.onmessage({ data: JSON.stringify([mockMessage]) });

        expect(callback).toHaveBeenCalledWith({
            symbol: 'BTCUSDT',
            price: 50000.50,
            change24h: 2.5,
            volume24h: 1000,
            timestamp: expect.any(Number)
        });
    });

    it('should reconnect on close', () => {
        wsService.connect();
        const wsInstance = (wsService as any).ws;
        
        wsInstance.onclose({});
        
        // Fast forward timers for reconnection
        vi.advanceTimersByTime(2000);
        
        // A new WebSocket instance should be created
        expect((wsService as any).ws).not.toBe(wsInstance);
    });
});
