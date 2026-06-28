import type { Coin, CoinPrice, CoinMarketChart } from '../interfaces';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const REQUEST_DELAY = 6000;
let lastRequestTime = 0;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 15000;

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRateLimit = async (url: string, retries = 3): Promise<Response> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < REQUEST_DELAY) {
    await delay(REQUEST_DELAY - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        const waitTime = retryAfter * 1000;
        if (attempt < retries) {
          await delay(waitTime);
          lastRequestTime = Date.now();
          continue;
        }
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }

      if (response.status === 304) {
        const cached = getCachedData<unknown>(url);
        if (cached !== null) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      const backoff = Math.pow(2, attempt) * 2000;
      await delay(backoff);
      lastRequestTime = Date.now();
    }
  }

  throw new Error('Max retries exceeded');
};

export const getCoinsMarkets = async (page = 1, perPage = 20): Promise<Coin[]> => {
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`;
  const cacheKey = `markets:${page}:${perPage}`;

  const cached = getCachedData<Coin[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRateLimit(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch coins: ${response.statusText}`);
  }

  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const getSimplePrice = async (coinIds: string[]): Promise<CoinPrice> => {
  const ids = coinIds.sort().join(',');
  const url = `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`;
  const cacheKey = `price:${ids}`;

  const cached = getCachedData<CoinPrice>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRateLimit(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }

  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};

export const getMarketChart = async (coinId: string, days = 7): Promise<CoinMarketChart> => {
  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const cacheKey = `chart:${coinId}:${days}`;

  const cached = getCachedData<CoinMarketChart>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRateLimit(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch market chart: ${response.statusText}`);
  }

  const data = await response.json();
  setCachedData(cacheKey, data);
  return data;
};
