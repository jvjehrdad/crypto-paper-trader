import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Coin } from '../../types';
import { Decimal, calculateFee, calculateTotalWithFee } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatting';
import styles from './TradeForm.module.css';

interface TradeFormProps {
  coin: Coin | null;
  onClose: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ coin, onClose }) => {
  const { state, dispatch } = useTrading();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [feePercentage, setFeePercentage] = useState('0.5');
  const [inputMode, setInputMode] = useState<'amount' | 'dollars'>('amount');
  
  useEffect(() => {
    if (coin) {
      setPricePerUnit(coin.current_price.toString());
      setAmount('');
    }
  }, [coin]);
  
  if (!coin) {
    return null;
  }
  
  const getAvailableBalance = () => {
    if (tradeType === 'buy') {
      return new Decimal(state.cashBalance);
    } else {
      const asset = state.assets.find(a => a.coinId === coin.id);
      return asset ? new Decimal(asset.amount) : new Decimal(0);
    }
  };
  
  const getCalculatedValue = () => {
    const price = new Decimal(pricePerUnit || '0');
    
    if (inputMode === 'amount') {
      const amountDecimal = new Decimal(amount || '0');
      return amountDecimal.multiply(price);
    } else {
      const dollarsDecimal = new Decimal(amount || '0');
      return dollarsDecimal.divide(price);
    }
  };
  
  const getConvertedValue = () => {
    const price = new Decimal(pricePerUnit || '0');
    
    if (inputMode === 'amount') {
      const amountDecimal = new Decimal(amount || '0');
      return amountDecimal.multiply(price);
    } else {
      const dollarsDecimal = new Decimal(amount || '0');
      return dollarsDecimal.divide(price);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      if (inputMode === 'dollars' && pricePerUnit && value) {
        const dollars = new Decimal(value);
        const price = new Decimal(pricePerUnit);
        const cryptoAmount = dollars.divide(price);
        setAmount(cryptoAmount.round(8).toString());
      }
    }
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPricePerUnit(value);
    }
  };
  
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFeePercentage(value);
    }
  };
  
  const handleInputModeChange = (mode: 'amount' | 'dollars') => {
    setInputMode(mode);
    setAmount('');
  };
  
  const handleTrade = () => {
    const amountDecimal = new Decimal(amount || '0');
    const priceDecimal = new Decimal(pricePerUnit || '0');
    const feeDecimal = calculateFee(amountDecimal.multiply(priceDecimal), new Decimal(feePercentage));
    const totalWithFee = calculateTotalWithFee(amountDecimal.multiply(priceDecimal), feeDecimal);
    
    const availableBalance = getAvailableBalance();
    
    if (tradeType === 'buy' && totalWithFee.isGreaterThan(availableBalance)) {
      alert('Insufficient balance');
      return;
    }
    
    if (tradeType === 'sell' && amountDecimal.isGreaterThan(availableBalance)) {
      alert('Insufficient holdings');
      return;
    }
    
    dispatch({
      type: tradeType.toUpperCase() as 'BUY' | 'SELL',
      payload: {
        coinId: coin.id,
        coinName: coin.name,
        coinSymbol: coin.symbol,
        amount: amountDecimal.toString(),
        pricePerUnit: priceDecimal.toString(),
        fee: feeDecimal.toString(),
      },
    });
    
    onClose();
  };
  
  const isValid = () => {
    const amountDecimal = new Decimal(amount || '0');
    const priceDecimal = new Decimal(pricePerUnit || '0');
    
    if (amountDecimal.isLessThanOrEqualTo(0) || priceDecimal.isLessThanOrEqualTo(0)) {
      return false;
    }
    
    const availableBalance = getAvailableBalance();
    const totalWithFee = calculateTotalWithFee(
      amountDecimal.multiply(priceDecimal),
      calculateFee(amountDecimal.multiply(priceDecimal), new Decimal(feePercentage))
    );
    
    if (tradeType === 'buy' && totalWithFee.isGreaterThan(availableBalance)) {
      return false;
    }
    
    if (tradeType === 'sell' && amountDecimal.isGreaterThan(availableBalance)) {
      return false;
    }
    
    return true;
  };
  
  const totalValue = getConvertedValue();
  const fee = calculateFee(totalValue, new Decimal(feePercentage));
  const totalWithFee = calculateTotalWithFee(totalValue, fee);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Trade {coin.name}</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className={styles.tradeTypeSelector}>
        <button
          className={`${styles.tradeTypeButton} ${tradeType === 'buy' ? styles.buyActive : ''}`}
          onClick={() => setTradeType('buy')}
        >
          Buy
        </button>
        <button
          className={`${styles.tradeTypeButton} ${tradeType === 'sell' ? styles.sellActive : ''}`}
          onClick={() => setTradeType('sell')}
        >
          Sell
        </button>
      </div>
      
      <div className={styles.inputModeSelector}>
        <button
          className={`${styles.inputModeButton} ${inputMode === 'amount' ? styles.active : ''}`}
          onClick={() => handleInputModeChange('amount')}
        >
          By Amount
        </button>
        <button
          className={`${styles.inputModeButton} ${inputMode === 'dollars' ? styles.active : ''}`}
          onClick={() => handleInputModeChange('dollars')}
        >
          By Dollars
        </button>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>
          {inputMode === 'amount' ? 'Amount' : 'Dollars'}
        </label>
        <input
          type="text"
          className={styles.input}
          value={amount}
          onChange={handleAmountChange}
          placeholder={inputMode === 'amount' ? `0.00000000 ${coin.symbol.toUpperCase()}` : '$0.00'}
        />
        <span className={styles.balance}>
          Available: {tradeType === 'buy' 
            ? formatCurrency(parseFloat(state.cashBalance))
            : `${getAvailableBalance().toString()} ${coin.symbol.toUpperCase()}`
          }
        </span>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Price Per Unit (USD)</label>
        <input
          type="text"
          className={styles.input}
          value={pricePerUnit}
          onChange={handlePriceChange}
          placeholder="$0.00"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Fee Percentage (%)</label>
        <input
          type="text"
          className={styles.input}
          value={feePercentage}
          onChange={handleFeeChange}
          placeholder="0.5"
        />
      </div>
      
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(totalValue.toNumber())}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Fee ({feePercentage}%)</span>
          <span>{formatCurrency(fee.toNumber())}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Total</span>
          <span>{formatCurrency(totalWithFee.toNumber())}</span>
        </div>
      </div>
      
      <button
        className={`${styles.submitButton} ${tradeType === 'buy' ? styles.buyButton : styles.sellButton}`}
        onClick={handleTrade}
        disabled={!isValid()}
      >
        {tradeType === 'buy' ? 'Buy' : 'Sell'} {coin.symbol.toUpperCase()}
      </button>
    </div>
  );
};
