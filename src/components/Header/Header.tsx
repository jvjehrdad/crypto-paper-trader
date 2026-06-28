import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { Decimal } from '../../utils/calculations';
import { formatCurrency, formatNumber } from '../../utils/formatting';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { state, dispatch } = useTrading();
  
  const totalPortfolioValue = state.assets.reduce((total, asset) => {
    return total.add(new Decimal(asset.currentPrice).multiply(new Decimal(asset.amount)));
  }, new Decimal(0));
  
  const totalProfitLoss = state.assets.reduce((total, asset) => {
    return total.add(new Decimal(asset.profitLoss));
  }, new Decimal(0));
  
  const totalProfitLossPercentage = totalPortfolioValue.isGreaterThan(0)
    ? totalProfitLoss.divide(totalPortfolioValue).multiply(100)
    : new Decimal(0);
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your portfolio? This action cannot be undone.')) {
      dispatch({ type: 'RESET' });
    }
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.icon}>📈</span>
          <h1 className={styles.title}>Crypto Paper Trader</h1>
        </div>
        
        <div className={styles.portfolio}>
          <div className={styles.portfolioItem}>
            <span className={styles.label}>Cash Balance</span>
            <span className={styles.value}>{formatCurrency(parseFloat(state.cashBalance))}</span>
          </div>
          
          <div className={styles.portfolioItem}>
            <span className={styles.label}>Portfolio Value</span>
            <span className={styles.value}>{formatCurrency(totalPortfolioValue.toNumber())}</span>
          </div>
          
          <div className={styles.portfolioItem}>
            <span className={styles.label}>Total P&L</span>
            <span className={`${styles.value} ${totalProfitLoss.isPositive() ? styles.positive : totalProfitLoss.isNegative() ? styles.negative : ''}`}>
              {formatCurrency(totalProfitLoss.toNumber())} ({formatNumber(totalProfitLossPercentage.toNumber())}%)
            </span>
          </div>
        </div>
        
        <button className={styles.resetButton} onClick={handleReset}>
          Reset
        </button>
      </div>
    </header>
  );
};
