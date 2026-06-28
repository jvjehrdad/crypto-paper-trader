import React, { useState, useEffect } from 'react';
import { useTrading } from '../../core/contexts/TradingContext';
import type { Coin } from '../../core/interfaces';
import { dMultiply, dDivide, dLte, dGt, calculateFee, calculateTotalWithFee, toStr, toFixed } from '../../core/utils/calculations';
import { formatCurrency } from '../../core/utils/formatting';
import styles from './TradeForm.module.css';

interface TradeFormProps {
  coin: Coin | null;
  onClose: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ coin, onClose }) => {
  const { state, dispatch } = useTrading();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [dollarAmount, setDollarAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [feePercentage, setFeePercentage] = useState('0.5');
  const [inputMode, setInputMode] = useState<'amount' | 'dollars'>('amount');

  useEffect(() => {
    if (coin) {
      setPricePerUnit(coin.current_price.toString());
      setCryptoAmount('');
      setDollarAmount('');
    }
  }, [coin]);

  if (!coin) {
    return null;
  }

  const getAvailableBalance = () => {
    if (tradeType === 'buy') {
      return parseFloat(state.cashBalance);
    } else {
      const asset = state.assets.find(a => a.coinId === coin.id);
      return asset ? parseFloat(asset.amount) : 0;
    }
  };

  const getCurrentCryptoAmount = (): number => {
    if (inputMode === 'amount') {
      return parseFloat(cryptoAmount || '0');
    } else {
      const dollars = parseFloat(dollarAmount || '0');
      const price = parseFloat(pricePerUnit || '0');
      return price === 0 ? 0 : dDivide(dollars, price);
    }
  };

  const getCurrentDollarTotal = (): number => {
    const cryptoAmt = getCurrentCryptoAmount();
    const price = parseFloat(pricePerUnit || '0');
    return dMultiply(cryptoAmt, price);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (inputMode === 'amount') {
        setCryptoAmount(value);
      } else {
        setDollarAmount(value);
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
    setCryptoAmount('');
    setDollarAmount('');
  };

  const handleTrade = () => {
    const cryptoAmt = getCurrentCryptoAmount();
    const priceVal = parseFloat(pricePerUnit || '0');
    const subtotal = dMultiply(cryptoAmt, priceVal);
    const feeDecimal = calculateFee(subtotal, feePercentage);
    const totalWithFee = calculateTotalWithFee(subtotal, feeDecimal);

    const availableBalance = getAvailableBalance();

    if (tradeType === 'buy' && dGt(totalWithFee, availableBalance)) {
      alert('Insufficient balance');
      return;
    }

    if (tradeType === 'sell' && dGt(cryptoAmt, availableBalance)) {
      alert('Insufficient holdings');
      return;
    }

    dispatch({
      type: tradeType.toUpperCase() as 'BUY' | 'SELL',
      payload: {
        coinId: coin.id,
        coinName: coin.name,
        coinSymbol: coin.symbol,
        amount: toStr(cryptoAmt),
        pricePerUnit: toStr(priceVal),
        fee: toStr(feeDecimal),
      },
    });

    onClose();
  };

  const isValid = () => {
    const cryptoAmt = getCurrentCryptoAmount();
    const priceVal = parseFloat(pricePerUnit || '0');

    if (dLte(cryptoAmt, 0) || dLte(priceVal, 0)) {
      return false;
    }

    const availableBalance = getAvailableBalance();
    const subtotal = dMultiply(cryptoAmt, priceVal);
    const totalWithFee = calculateTotalWithFee(
      subtotal,
      calculateFee(subtotal, feePercentage)
    );

    if (tradeType === 'buy' && dGt(totalWithFee, availableBalance)) {
      return false;
    }

    if (tradeType === 'sell' && dGt(cryptoAmt, availableBalance)) {
      return false;
    }

    return true;
  };

  const cryptoAmt = getCurrentCryptoAmount();
  const totalValue = getCurrentDollarTotal();
  const fee = calculateFee(totalValue, feePercentage);
  const totalWithFee = calculateTotalWithFee(totalValue, fee);

  const inputValue = inputMode === 'amount' ? cryptoAmount : dollarAmount;
  const inputPlaceholder = inputMode === 'amount'
    ? `0.00000000 ${coin.symbol.toUpperCase()}`
    : '$0.00';
  const inputLabel = inputMode === 'amount' ? 'Amount' : 'Dollars';

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
        <label className={styles.label}>{inputLabel}</label>
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={handleAmountChange}
          placeholder={inputPlaceholder}
        />
        <span className={styles.balance}>
          Available: {tradeType === 'buy'
            ? formatCurrency(parseFloat(state.cashBalance))
            : `${getAvailableBalance()} ${coin.symbol.toUpperCase()}`
          }
        </span>
      </div>

      {inputMode === 'dollars' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>You Will Receive</label>
          <div className={styles.convertedValue}>
            {toFixed(cryptoAmt, 8)} {coin.symbol.toUpperCase()}
          </div>
        </div>
      )}

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
          <span>{formatCurrency(totalValue)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Fee ({feePercentage}%)</span>
          <span>{formatCurrency(fee)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Total</span>
          <span>{formatCurrency(totalWithFee)}</span>
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
