import { useEffect } from 'react';
import { useCryptoStore } from '../store/cryptoStore';

export const useCryptoPrices = () => {
  const selectedCryptoId = useCryptoStore((state) => state.selectedCryptoId);
  const setSelectedCryptoId = useCryptoStore((state) => state.setSelectedCryptoId);
  const prices = useCryptoStore((state) => state.prices);

  // Set default selection
  useEffect(() => {
    if (!selectedCryptoId && Object.keys(prices).length > 0) {
      // Small delay to ensure we have some data
      const timer = setTimeout(() => {
        if (!useCryptoStore.getState().selectedCryptoId) {
            setSelectedCryptoId('BTCUSDT');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCryptoId, setSelectedCryptoId, prices]);

  return { selectedCryptoId, setSelectedCryptoId, prices };
};
