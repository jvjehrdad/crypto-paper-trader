import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WalletState, Transaction, WalletAsset } from '../types';
import { Decimal } from '../utils/calculations';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
    const existingAmount = new Decimal(existingAsset?.amount || '0');
    const existingAveragePrice = new Decimal(existingAsset?.averageBuyPrice || '0');
    const newAmount = new Decimal(amount);
    const newPrice = new Decimal(pricePerUnit);
    
    const totalAmount = existingAmount.add(newAmount);
    const totalCost = existingAmount.multiply(existingAveragePrice).add(newAmount.multiply(newPrice));
    const newAveragePrice = totalCost.divide(totalAmount);
    
    return {
      coinId: existingAsset?.coinId || '',
      symbol: existingAsset?.symbol || '',
      name: existingAsset?.name || '',
      amount: totalAmount.toString(),
      averageBuyPrice: newAveragePrice.toString(),
      currentPrice: existingAsset?.currentPrice || pricePerUnit,
      profitLoss: '0',
      profitLossPercentage: '0',
    };
  } else {
    const existingAmount = new Decimal(existingAsset?.amount || '0');
    const newAmount = new Decimal(amount);
    const remainingAmount = existingAmount.subtract(newAmount);
    
    if (remainingAmount.isLessThanOrEqualTo(0)) {
      return undefined;
    }
    
    return {
      ...existingAsset!,
      amount: remainingAmount.toString(),
    };
  }
};

const tradingReducer = (state: WalletState, action: TradingAction): WalletState => {
  switch (action.type) {
    case 'BUY': {
      const { coinId, coinName, coinSymbol, amount, pricePerUnit, fee } = action.payload;
      const totalCost = new Decimal(amount).multiply(new Decimal(pricePerUnit));
      const feeDecimal = new Decimal(fee);
      const totalWithFee = totalCost.add(feeDecimal);
      
      const cashBalance = new Decimal(state.cashBalance);
      if (totalWithFee.isGreaterThan(cashBalance)) {
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
        totalAmount: totalCost.toString(),
        fee,
        timestamp: Date.now(),
      };
      
      return {
        cashBalance: cashBalance.subtract(totalWithFee).toString(),
        assets: newAssets,
        transactions: [...state.transactions, transaction],
      };
    }
    
    case 'SELL': {
      const { coinId, coinName, coinSymbol, amount, pricePerUnit, fee } = action.payload;
      const totalRevenue = new Decimal(amount).multiply(new Decimal(pricePerUnit));
      const feeDecimal = new Decimal(fee);
      const totalAfterFee = totalRevenue.subtract(feeDecimal);
      
      const existingAsset = state.assets.find(asset => asset.coinId === coinId);
      if (!existingAsset) {
        return state;
      }
      
      const existingAmount = new Decimal(existingAsset.amount);
      const sellAmount = new Decimal(amount);
      
      if (sellAmount.isGreaterThan(existingAmount)) {
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
        totalAmount: totalRevenue.toString(),
        fee,
        timestamp: Date.now(),
      };
      
      return {
        cashBalance: new Decimal(state.cashBalance).add(totalAfterFee).toString(),
        assets: newAssets,
        transactions: [...state.transactions, transaction],
      };
    }
    
    case 'UPDATE_PRICES': {
      const { payload: prices } = action;
      const updatedAssets = state.assets.map(asset => {
        const currentPrice = prices[asset.coinId];
        if (currentPrice !== undefined) {
          const currentPriceDecimal = new Decimal(currentPrice);
          const averageBuyPrice = new Decimal(asset.averageBuyPrice);
          const amount = new Decimal(asset.amount);
          
          const profitLoss = currentPriceDecimal.subtract(averageBuyPrice).multiply(amount);
          const profitLossPercentage = currentPriceDecimal.subtract(averageBuyPrice).divide(averageBuyPrice).multiply(100);
          
          return {
            ...asset,
            currentPrice: currentPriceDecimal.toString(),
            profitLoss: profitLoss.toString(),
            profitLossPercentage: profitLossPercentage.toString(),
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
