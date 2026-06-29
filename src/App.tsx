import React, { useState } from 'react';
import { Header } from '../components/Header';
import { MarketList } from '../components/MarketList';
import { PriceChart } from '../components/PriceChart';
import { TradeForm } from '../components/TradeForm';
import { Wallet } from '../components/Wallet';
import { TransactionHistory } from '../components/TransactionHistory';
import type { Coin } from '../core/interfaces';
import { getCoinsMarkets } from '../core/api/coingecko';
import '../core/styles/global.css';
import styles from './App.module.css';

const App: React.FC = () => {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [showTradeForm, setShowTradeForm] = useState(false);
  
  const handleSelectCoin = async (coinId: string) => {
    setSelectedCoinId(coinId);
    
    try {
      const coins = await getCoinsMarkets();
      const coin = coins.find(c => c.id === coinId);
      if (coin) {
        setSelectedCoin(coin);
        setShowTradeForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch coin details:', error);
    }
  };
  
  const handleCloseTradeForm = () => {
    setShowTradeForm(false);
    setSelectedCoin(null);
    setSelectedCoinId(null);
  };
  
  return (
    <div className={styles.app}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.sidebar}>
              <MarketList 
                onSelectCoin={handleSelectCoin}
                selectedCoinId={selectedCoinId}
              />
            </div>
            
            <div className={styles.content}>
              <div className={styles.chartSection}>
                <PriceChart coinId={selectedCoinId} />
              </div>
              
              {showTradeForm && selectedCoin && (
                <div className={styles.tradeSection}>
                  <TradeForm 
                    coin={selectedCoin}
                    onClose={handleCloseTradeForm}
                  />
                </div>
              )}
            </div>
            
            <div className={styles.sidebar}>
              <Wallet />
              <TransactionHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
