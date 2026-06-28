import { Coin, CoinPrice, CoinMarketChart } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const REQUEST_DELAY = 1000;
let lastRequestTime = 0;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRateLimit = async (url: string): Promise<Response> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await delay(REQUEST_DELAY - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
};

export const getCoinsMarkets = async (page = 1, perPage = 20): Promise<Coin[]> => {
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`;
  const response = await fetchWithRateLimit(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coins: ${response.statusText}`);
  }
  
  return response.json();
};

export const getSimplePrice = async (coinIds: string[]): Promise<CoinPrice> => {
  const ids = coinIds.join(',');
  const url = `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`;
  const response = await fetchWithRateLimit(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }
  
  return response.json();
};

export const getMarketChart = async (coinId: string, days = 7): Promise<CoinMarketChart> => {
  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const response = await fetchWithRateLimit(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market chart: ${response.statusText}`);
  }
  
  return response.json();
};
