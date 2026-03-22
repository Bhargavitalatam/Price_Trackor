import { useEffect } from 'react';
import { wsService } from '../services/WebSocketService';
import { useCryptoStore } from '../store/cryptoStore';

export const useWebSocket = () => {
  const batchUpdatePrices = useCryptoStore((state) => state.batchUpdatePrices);
  const setError = useCryptoStore((state) => state.setError);

  useEffect(() => {
    wsService.connect();
    
    // Performance optimization: Buffer updates and batch them
    const buffer: any[] = [];
    const flushBuffer = () => {
      if (buffer.length > 0) {
        batchUpdatePrices([...buffer]);
        buffer.length = 0;
      }
    };
    const intervalId = setInterval(flushBuffer, 100);

    const unsubscribe = wsService.subscribeToMessages((data) => {
      buffer.push(data);
    });

    return () => {
      unsubscribe();
      clearInterval(intervalId);
      wsService.disconnect();
    };
  }, [batchUpdatePrices, setError]);
};
