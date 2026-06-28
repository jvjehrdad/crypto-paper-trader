import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import type { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';
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
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th 
                className={`${styles.th} ${sortField === 'timestamp' ? styles.sorted : ''}`}
                onClick={() => handleSort('timestamp')}
              >
                Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`${styles.th} ${sortField === 'type' ? styles.sorted : ''}`}
                onClick={() => handleSort('type')}
              >
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`${styles.th} ${sortField === 'coinName' ? styles.sorted : ''}`}
                onClick={() => handleSort('coinName')}
              >
                Coin {sortField === 'coinName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`${styles.th} ${sortField === 'amount' ? styles.sorted : ''}`}
                onClick={() => handleSort('amount')}
              >
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`${styles.th} ${sortField === 'pricePerUnit' ? styles.sorted : ''}`}
                onClick={() => handleSort('pricePerUnit')}
              >
                Price {sortField === 'pricePerUnit' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`${styles.th} ${sortField === 'totalAmount' ? styles.sorted : ''}`}
                onClick={() => handleSort('totalAmount')}
              >
                Total {sortField === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className={styles.row}>
                <td className={styles.td}>{formatDate(tx.timestamp)}</td>
                <td className={styles.td}>
                  <span className={`${styles.typeBadge} ${tx.type === 'buy' ? styles.buy : styles.sell}`}>
                    {tx.type.toUpperCase()}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={styles.coinName}>{tx.coinName}</span>
                  <span className={styles.coinSymbol}>{tx.coinSymbol.toUpperCase()}</span>
                </td>
                <td className={styles.td}>{parseFloat(tx.amount).toFixed(8)}</td>
                <td className={styles.td}>{formatCurrency(parseFloat(tx.pricePerUnit))}</td>
                <td className={styles.td}>{formatCurrency(parseFloat(tx.totalAmount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
