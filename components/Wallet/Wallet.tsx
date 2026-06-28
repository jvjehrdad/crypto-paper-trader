import React from 'react';
import { useTrading } from '../../core/contexts/TradingContext';
import { formatCurrency, formatPercentage } from '../../core/utils/formatting';
import { Empty } from '../common';
import styles from './Wallet.module.css';

export const Wallet: React.FC = () => {
  const { state } = useTrading();
  
  if (state.assets.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Wallet</h2>
        <Empty message="No assets in your portfolio yet" />
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Wallet</h2>
      <div className={styles.assets}>
        {state.assets.map(asset => (
          <div key={asset.coinId} className={styles.asset}>
            <div className={styles.assetInfo}>
              <span className={styles.symbol}>{asset.symbol.toUpperCase()}</span>
              <span className={styles.name}>{asset.name}</span>
            </div>
            
            <div className={styles.assetDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Amount</span>
                <span className={styles.detailValue}>{parseFloat(asset.amount).toFixed(8)}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Avg. Buy Price</span>
                <span className={styles.detailValue}>{formatCurrency(parseFloat(asset.averageBuyPrice))}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Current Price</span>
                <span className={styles.detailValue}>{formatCurrency(parseFloat(asset.currentPrice))}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Value</span>
                <span className={styles.detailValue}>
                  {formatCurrency(parseFloat(asset.amount) * parseFloat(asset.currentPrice))}
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>P&L</span>
                <span className={`${styles.detailValue} ${
                  parseFloat(asset.profitLoss) >= 0 ? styles.positive : styles.negative
                }`}>
                  {formatCurrency(parseFloat(asset.profitLoss))} ({formatPercentage(parseFloat(asset.profitLossPercentage))})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
