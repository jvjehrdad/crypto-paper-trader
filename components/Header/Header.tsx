import React from 'react';
import { useTrading } from '../../core/contexts/TradingContext';
import { dMultiply, dAdd, dDivide, dGt, dIsPositive, dIsNegative } from '../../core/utils/calculations';
import { formatCurrency, formatNumber } from '../../core/utils/formatting';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { state, dispatch } = useTrading();

  const totalPortfolioValue = state.assets.reduce((total, asset) => {
    return dAdd(total, dMultiply(asset.currentPrice, asset.amount));
  }, 0);

  const totalProfitLoss = state.assets.reduce((total, asset) => {
    return dAdd(total, asset.profitLoss);
  }, 0);

  const totalProfitLossPercentage = dGt(totalPortfolioValue, 0)
    ? dMultiply(dDivide(totalProfitLoss, totalPortfolioValue), 100)
    : 0;

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
            <span className={styles.value}>{formatCurrency(totalPortfolioValue)}</span>
          </div>

          <div className={styles.portfolioItem}>
            <span className={styles.label}>Total P&L</span>
            <span className={`${styles.value} ${dIsPositive(totalProfitLoss) ? styles.positive : dIsNegative(totalProfitLoss) ? styles.negative : ''}`}>
              {formatCurrency(totalProfitLoss)} ({formatNumber(totalProfitLossPercentage)}%)
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
