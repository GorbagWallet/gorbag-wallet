import { networks } from "./config";

export const currencySymbols: { [currency: string]: string } = {
  usd: "$",
  gbp: "£",
  eur: "€",
  ngn: "₦",
  jpy: "¥",
};

// Cache for exchange rates: key is "symbol:currency", value is { rate: number, timestamp: number }
const exchangeRateCache: Map<string, { rate: number; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 1 minute in milliseconds

const coinIdMap: { [symbol: string]: string } = {
  SOL: "solana",
  GOR: "solana", // Assuming GOR has the same ID as SOL
  USDC: "usd-coin",
  USDT: "tether",
  RAY: "raydium",
  JUP: "jupiter-aggregator",
  BONK: "bonk",
};

interface Token {
  symbol: string;
  amount: number;
}

async function fetchPriceFromCoinGecko(coinId: string, currency: string) {
  const cacheKey = `${coinId}:${currency}`;
  const cached = exchangeRateCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached CoinGecko price for ${coinId}:${currency}: ${cached.rate}`);
    return cached.rate;
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}`
  );
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  const data = await response.json();
  console.log("CoinGecko API response for", coinId, currency, ":", JSON.stringify(data));
  const price = data[coinId] ? data[coinId][currency] : null;

  if (price !== null) {
    exchangeRateCache.set(cacheKey, { rate: price, timestamp: now });
  }
  
  return price;
}

async function fetchPriceFromCoinCap(symbol: string, currency: string) {
  const cacheKey = `CoinCap:${symbol}:${currency}`;
  const cached = exchangeRateCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached CoinCap price for ${symbol}:${currency}: ${cached.rate}`);
    return cached.rate;
  }

  // CoinCap doesn't directly support all currencies, so we map to USD and then convert
  const response = await fetch(`https://api.coincap.io/v2/assets/${symbol.toLowerCase()}`);
  if (!response.ok) {
    throw new Error(`CoinCap API error: ${response.status}`);
  }
  const data = await response.json();
  if (!data.data) {
    return null;
  }
  
  // Get USD price
  const priceUsd = parseFloat(data.data.priceUsd);
  if (!priceUsd || isNaN(priceUsd)) {
    return null;
  }
  
  // If currency is USD, return directly
  if (currency.toLowerCase() === 'usd') {
    if (priceUsd !== null) {
      exchangeRateCache.set(cacheKey, { rate: priceUsd, timestamp: now });
    }
    console.log("CoinCap API response for", symbol, ":", JSON.stringify(data));
    return priceUsd;
  }
  
  // For other currencies, we'd need another API for currency conversion
  // For now, just return USD price for CoinCap
  if (priceUsd !== null) {
    exchangeRateCache.set(cacheKey, { rate: priceUsd, timestamp: now });
  }
  console.log("CoinCap API response for", symbol, ":", JSON.stringify(data));
  return priceUsd;
}

async function fetchPriceFromCoinpaprika(symbol: string, currency: string) {
  const cacheKey = `Coinpaprika:${symbol}:${currency}`;
  const cached = exchangeRateCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached Coinpaprika price for ${symbol}:${currency}: ${cached.rate}`);
    return cached.rate;
  }

  // Coinpaprika uses different IDs, we'll need to map them
  const coinpaprikaIdMap: { [key: string]: string } = {
    SOL: "sol-solana",
    GOR: "sol-solana", // Assuming GOR maps to SOL on coinpaprika too
    USDC: "usdc-usd-coin",
    USDT: "usdt-tether", 
    RAY: "ray-raydium",
    JUP: "jup-jupiter-aggregator-solana",
    BONK: "bonk-bonk"
  };
  
  const coinpaprikaId = coinpaprikaIdMap[symbol];
  if (!coinpaprikaId) {
    return null;
  }
  
  const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinpaprikaId}?quotes=${currency.toUpperCase()}`);
  if (!response.ok) {
    throw new Error(`Coinpaprika API error: ${response.status}`);
  }
  const data = await response.json();
  
  if (data?.quotes?.[currency.toUpperCase()]) {
    const price = data.quotes[currency.toUpperCase()].price;
    if (price !== null) {
      exchangeRateCache.set(cacheKey, { rate: price, timestamp: now });
    }
    console.log("Coinpaprika API response for", symbol, currency, ":", JSON.stringify(data));
    return price;
  }
  return null;
}

export async function getTokenValue(token: Token, currency: string): Promise<number> {
  const coinId = coinIdMap[token.symbol];
  if (!coinId) {
    return 0;
  }

  // Try different APIs in sequence as fallbacks
  const apis = [
    { name: 'CoinGecko', fetch: () => fetchPriceFromCoinGecko(coinId, currency) },
    { name: 'Coinpaprika', fetch: () => fetchPriceFromCoinpaprika(token.symbol, currency) },
    { name: 'CoinCap', fetch: () => fetchPriceFromCoinCap(token.symbol, currency) }
  ];

  for (const api of apis) {
    try {
      const price = await api.fetch();
      if (price !== null && !isNaN(price)) {
        console.log(`${api.name} returned valid price for ${token.symbol}: ${price}`);
        return token.amount * price;
      }
    } catch (error) {
      console.log(`Error with ${api.name}:`, error);
      // Continue to next API
    }
  }

  console.error(`All APIs failed for ${token.symbol}`);
  return 0;
}

export async function getPortfolioValue(
  tokens: Token[],
  currency: string
): Promise<number> {
  let totalValue = 0;

  // Process each token individually to handle fallbacks properly
  for (const token of tokens) {
    const tokenValue = await getTokenValue(token, currency);
    totalValue += tokenValue;
  }

  return totalValue;
}
