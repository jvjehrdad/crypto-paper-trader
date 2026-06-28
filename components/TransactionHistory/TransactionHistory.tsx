import React, { useState, useMemo } from 'react';
import { useTrading } from '../../core/contexts/TradingContext';
import type { Transaction } from '../../core/interfaces';
import { formatCurrency } from '../../core/utils/formatting';
import { Empty, CustomSelect } from '../common';
import styles from './TransactionHistory.module.css';

export const TransactionHistory: React.FC = () => {
  const { state } = useTrading();
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterCoin, setFilterCoin] = useState<string>('all');
  
  const uniqueCoins = useMemo(() => {
    const coins = new Map<string, string>();
    state.transactions.forEach(tx => {
      if (!coins.has(tx.coinId)) {
        coins.set(tx.coinId, tx.coinName);
      }
    });
    return Array.from(coins.entries());
  }, [state.transactions]);
  
  const filteredTransactions = useMemo(() => {
    let result = [...state.transactions];
    
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }
    
    if (filterCoin !== 'all') {
      result = result.filter(tx => tx.coinId === filterCoin);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'coinName':
          comparison = a.coinName.localeCompare(b.coinName);
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'pricePerUnit':
          comparison = parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit);
          break;
        case 'totalAmount':
          comparison = parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [state.transactions, sortField, sortDirection, filterType, filterCoin]);
  
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (state.transactions.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Transaction History</h2>
        <Empty message="No transactions yet" />
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Transaction History</h2>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Type:</label>
          <CustomSelect
            value={filterType}
            onChange={(val) => setFilterType(val as 'all' | 'buy' | 'sell')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'buy', label: 'Buy' },
              { value: 'sell', label: 'Sell' },
            ]}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Coin:</label>
          <CustomSelect
            value={filterCoin}
            onChange={setFilterCoin}
            options={[
              { value: 'all', label: 'All Coins' },
              ...uniqueCoins.map(([coinId, coinName]) => ({
                value: coinId,
                label: coinName,
              })),
            ]}
          />
        </div>
      </div>
      
      <div className={styles.sortBar}>
        {([
          ['timestamp', 'Date'],
          ['type', 'Type'],
          ['coinName', 'Coin'],
          ['amount', 'Amount'],
          ['pricePerUnit', 'Price'],
          ['totalAmount', 'Total'],
        ] as const).map(([field, label]) => (
          <button
            key={field}
            className={`${styles.sortChip} ${sortField === field ? styles.sortedChip : ''}`}
            onClick={() => handleSort(field)}
          >
            {label}
            {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
          </button>
        ))}
      </div>

      <div className={styles.cardList}>
        {filteredTransactions.map(tx => (
          <div key={tx.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.coinCell}>
                <span className={styles.coinName}>{tx.coinName}</span>
                <span className={styles.coinSymbol}>{tx.coinSymbol.toUpperCase()}</span>
              </div>
              <span className={`${styles.typeBadge} ${tx.type === 'buy' ? styles.buy : styles.sell}`}>
                {tx.type.toUpperCase()}
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardField}>
                <span className={styles.cardLabel}>Date</span>
                <span className={styles.cardValue}>{formatDate(tx.timestamp)}</span>
              </div>
              <div className={styles.cardField}>
                <span className={styles.cardLabel}>Amount</span>
                <span className={styles.cardValue}>{parseFloat(tx.amount).toFixed(8)}</span>
              </div>
              <div className={styles.cardField}>
                <span className={styles.cardLabel}>Price</span>
                <span className={styles.cardValue}>{formatCurrency(parseFloat(tx.pricePerUnit))}</span>
              </div>
              <div className={styles.cardField}>
                <span className={styles.cardLabel}>Total</span>
                <span className={styles.cardValue}>{formatCurrency(parseFloat(tx.totalAmount))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
