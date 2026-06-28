export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  last_updated: string;
}

export interface CoinPrice {
  [coinId: string]: {
    usd: number;
  };
}

export interface CoinMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface WalletAsset {
  coinId: string;
  symbol: string;
  name: string;
  amount: string;
  averageBuyPrice: string;
  currentPrice: string;
  profitLoss: string;
  profitLossPercentage: string;
}

export interface Transaction {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  type: 'buy' | 'sell';
  amount: string;
  pricePerUnit: string;
  totalAmount: string;
  fee: string;
  timestamp: number;
}

export interface WalletState {
  cashBalance: string;
  assets: WalletAsset[];
  transactions: Transaction[];
}

export type TradeType = 'buy' | 'sell';

export interface TradeFormData {
  coinId: string;
  type: TradeType;
  amount: string;
  pricePerUnit: string;
  fee: string;
}
