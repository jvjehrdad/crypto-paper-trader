import React, { useState, useEffect } from 'react';
import { Coin } from '../../types';
import { getCoinsMarkets } from '../../api/coingecko';
import { usePolling } from '../../hooks/usePolling';
import { formatCurrency, formatPercentage } from '../../utils/formatting';
import { Loading, Error, Empty } from '../common';
import styles from './MarketList.module.css';

interface MarketListProps {
  onSelectCoin: (coinId: string) => void;
  selectedCoinId: string | null;
}

export const MarketList: React.FC<MarketListProps> = ({ onSelectCoin, selectedCoinId }) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChanges, setPriceChanges] = useState<{ [coinId: string]: number }>({});
  
  const fetchCoins = async () => {
    try {
      const data = await getCoinsMarkets();
      
      setCoins(prevCoins => {
        const newPriceChanges: { [coinId: string]: number } = {};
        
        data.forEach(coin => {
          const prevCoin = prevCoins.find(c => c.id === coin.id);
          if (prevCoin) {
            newPriceChanges[coin.id] = coin.current_price - prevCoin.current_price;
          }
        });
        
        setPriceChanges(newPriceChanges);
        return data;
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coins');
    } finally {
      setLoading(false);
    }
  };
  
  usePolling(fetchCoins, 10000, !error);
  
  useEffect(() => {
    fetchCoins();
  }, []);
  
  if (loading && coins.length === 0) {
    return <Loading message="Loading market data..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={fetchCoins} />;
  }
  
  if (coins.length === 0) {
    return <Empty message="No coins available" />;
  }
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Market</h2>
      <div className={styles.list}>
        {coins.map(coin => (
          <div
            key={coin.id}
            className={`${styles.item} ${selectedCoinId === coin.id ? styles.selected : ''}`}
            onClick={() => onSelectCoin(coin.id)}
          >
            <div className={styles.coinInfo}>
              <img src={coin.image} alt={coin.name} className={styles.icon} />
              <div className={styles.details}>
                <span className={styles.symbol}>{coin.symbol.toUpperCase()}</span>
                <span className={styles.name}>{coin.name}</span>
              </div>
            </div>
            
            <div className={styles.priceInfo}>
              <span className={styles.price}>{formatCurrency(coin.current_price)}</span>
              <div className={styles.changeContainer}>
                <span
                  className={`${styles.change} ${
                    coin.price_change_percentage_24h >= 0 ? styles.positive : styles.negative
                  }`}
                >
                  {formatPercentage(coin.price_change_percentage_24h)}
                </span>
                {priceChanges[coin.id] !== undefined && (
                  <span
                    className={`${styles.instantChange} ${
                      priceChanges[coin.id] >= 0 ? styles.positive : styles.negative
                    }`}
                  >
                    {priceChanges[coin.id] >= 0 ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
