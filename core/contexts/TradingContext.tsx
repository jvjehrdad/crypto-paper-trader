import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WalletState, Transaction, WalletAsset } from '../interfaces';
import { dAdd, dMultiply, dSubtract, dDivide, dGt, dLte, toStr } from '../utils/calculations';

interface TradingContextType {
  state: WalletState;
  dispatch: React.Dispatch<TradingAction>;
}

type TradingAction =
  | { type: 'BUY'; payload: { coinId: string; coinName: string; coinSymbol: string; amount: string; pricePerUnit: string; fee: string } }
  | { type: 'SELL'; payload: { coinId: string; coinName: string; coinSymbol: string; amount: string; pricePerUnit: string; fee: string } }
  | { type: 'UPDATE_PRICES'; payload: { [coinId: string]: number } }
  | { type: 'RESET' };

const initialState: WalletState = {
  cashBalance: '10000',
  assets: [],
  transactions: [],
};

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const calculateNewAsset = (
  existingAsset: WalletAsset | undefined,
  amount: string,
  pricePerUnit: string,
  transactionType: 'buy' | 'sell'
): WalletAsset | undefined => {
  if (transactionType === 'buy') {
    const existingAmount = parseFloat(existingAsset?.amount || '0');
    const existingAveragePrice = parseFloat(existingAsset?.averageBuyPrice || '0');
    const newAmount = parseFloat(amount);
    const newPrice = parseFloat(pricePerUnit);

    const totalAmount = dAdd(existingAmount, newAmount);
    const totalCost = dAdd(dMultiply(existingAmount, existingAveragePrice), dMultiply(newAmount, newPrice));
    const newAveragePrice = dDivide(totalCost, totalAmount);

    return {
      coinId: existingAsset?.coinId || '',
      symbol: existingAsset?.symbol || '',
      name: existingAsset?.name || '',
      amount: toStr(totalAmount),
      averageBuyPrice: toStr(newAveragePrice),
      currentPrice: existingAsset?.currentPrice || pricePerUnit,
      profitLoss: '0',
      profitLossPercentage: '0',
    };
  } else {
    const existingAmount = parseFloat(existingAsset?.amount || '0');
    const newAmount = parseFloat(amount);
    const remainingAmount = dSubtract(existingAmount, newAmount);

    if (dLte(remainingAmount, 0)) {
      return undefined;
    }

    return {
      ...existingAsset!,
      amount: toStr(remainingAmount),
    };
  }
};

const tradingReducer = (state: WalletState, action: TradingAction): WalletState => {
  switch (action.type) {
    case 'BUY': {
      const { coinId, coinName, coinSymbol, amount, pricePerUnit, fee } = action.payload;
      const totalCost = dMultiply(amount, pricePerUnit);
      const feeDecimal = parseFloat(fee);
      const totalWithFee = dAdd(totalCost, feeDecimal);

      const cashBalance = parseFloat(state.cashBalance);
      if (dGt(totalWithFee, cashBalance)) {
        return state;
      }

      const existingAsset = state.assets.find(asset => asset.coinId === coinId);
      const newAsset = calculateNewAsset(existingAsset, amount, pricePerUnit, 'buy');

      let newAssets: WalletAsset[];
      if (newAsset) {
        if (existingAsset) {
          newAssets = state.assets.map(asset =>
            asset.coinId === coinId ? newAsset : asset
          );
        } else {
          newAssets = [...state.assets, { ...newAsset, coinId, symbol: coinSymbol, name: coinName }];
        }
      } else {
        newAssets = state.assets;
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        coinId,
        coinName,
        coinSymbol,
        type: 'buy',
        amount,
        pricePerUnit,
        totalAmount: toStr(totalCost),
        fee,
        timestamp: Date.now(),
      };

      return {
        cashBalance: toStr(dSubtract(cashBalance, totalWithFee)),
        assets: newAssets,
        transactions: [...state.transactions, transaction],
      };
    }

    case 'SELL': {
      const { coinId, coinName, coinSymbol, amount, pricePerUnit, fee } = action.payload;
      const totalRevenue = dMultiply(amount, pricePerUnit);
      const feeDecimal = parseFloat(fee);
      const totalAfterFee = dSubtract(totalRevenue, feeDecimal);

      const existingAsset = state.assets.find(asset => asset.coinId === coinId);
      if (!existingAsset) {
        return state;
      }

      const existingAmount = parseFloat(existingAsset.amount);
      const sellAmount = parseFloat(amount);

      if (dGt(sellAmount, existingAmount)) {
        return state;
      }

      const newAsset = calculateNewAsset(existingAsset, amount, pricePerUnit, 'sell');

      let newAssets: WalletAsset[];
      if (newAsset) {
        newAssets = state.assets.map(asset =>
          asset.coinId === coinId ? newAsset : asset
        );
      } else {
        newAssets = state.assets.filter(asset => asset.coinId !== coinId);
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        coinId,
        coinName,
        coinSymbol,
        type: 'sell',
        amount,
        pricePerUnit,
        totalAmount: toStr(totalRevenue),
        fee,
        timestamp: Date.now(),
      };

      return {
        cashBalance: toStr(dAdd(parseFloat(state.cashBalance), totalAfterFee)),
        assets: newAssets,
        transactions: [...state.transactions, transaction],
      };
    }

    case 'UPDATE_PRICES': {
      const { payload: prices } = action;
      const updatedAssets = state.assets.map(asset => {
        const currentPrice = prices[asset.coinId];
        if (currentPrice !== undefined) {
          const avgBuy = parseFloat(asset.averageBuyPrice);
          const amt = parseFloat(asset.amount);

          const profitLoss = dMultiply(dSubtract(currentPrice, avgBuy), amt);
          const profitLossPercentage = dMultiply(dDivide(dSubtract(currentPrice, avgBuy), avgBuy), 100);

          return {
            ...asset,
            currentPrice: toStr(currentPrice),
            profitLoss: toStr(profitLoss),
            profitLossPercentage: toStr(profitLossPercentage),
          };
        }
        return asset;
      });

      return {
        ...state,
        assets: updatedAssets,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedState, setStoredState] = useLocalStorage<WalletState>('trading-wallet', initialState);
  const [state, dispatch] = useReducer(tradingReducer, storedState);

  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = (): TradingContextType => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
