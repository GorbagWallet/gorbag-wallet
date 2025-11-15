/**
 * Crypto Data Service - Fetches token and market data from multiple APIs
 */

export type Network = "solana" | "gorbagana";

interface TokenDetails {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  totalVolume: number;
  circulatingSupply: number;
  totalSupply: number;
  image: string | null;
  lastUpdated: string;
}

interface HistoricalDataPoint {
  time: string;
  value: number;
}

interface TransactionData {
  signature: string;
  blockTime: number;
  transaction: any; // Raw transaction data
  fee: number;
  status: string;
}

export class CryptoDataService {
  private static readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
  private static readonly COINCAP_API = "https://api.coincap.io/v2";
  private static readonly COINPAPRIKA_API = "https://api.coinpaprika.com/v1";

  // Cache for exchange rates: key is "symbol:currency", value is { data: any, timestamp: number }
  private static readonly CACHE_DURATION = 60000; // 1 minute in milliseconds
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // Coin ID mappings for different APIs
  private coinIdMap: { [symbol: string]: string } = {
    SOL: "solana",
    GOR: "solana", // Assuming GOR has the same ID as SOL
    USDC: "usd-coin",
    USDT: "tether",
    RAY: "raydium",
    JUP: "jupiter-aggregator",
    BONK: "bonk",
    // Add more mappings as needed
  };

  private coinpaprikaIdMap: { [symbol: string]: string } = {
    SOL: "sol-solana",
    GOR: "sol-solana", // Assuming GOR maps to SOL on coinpaprika too
    USDC: "usdc-usd-coin",
    USDT: "usdt-tether", 
    RAY: "ray-raydium",
    JUP: "jup-jupiter-aggregator-solana",
    BONK: "bonk-bonk"
  };

  constructor() {
    this.initializeCache();
  }

  private initializeCache() {
    // Load any persisted cache on service initialization
    try {
      const cached = localStorage.getItem('crypto-data-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as { data: any; timestamp: number });
        });
      }
    } catch (e) {
      console.warn('Failed to load crypto data cache:', e);
    }
  }

  private saveCache() {
    // Persist cache to localStorage
    try {
      const obj: Record<string, { data: any; timestamp: number }> = {};
      this.cache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem('crypto-data-cache', JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save crypto data cache:', e);
    }
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CryptoDataService.CACHE_DURATION) {
      console.log(`Using cached data for ${key}`);
      return cached.data as T;
    }
    return null;
  }

  private setCached(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.saveCache();
  }

  /**
   * Get detailed token information combining on-chain and market data
   */
  async getTokenDetails(symbol: string, currency: string = "usd", network: Network = "solana", mintAddress?: string): Promise<TokenDetails> {
    // For Gorbagana network, return placeholder data until we have proper integration
    if (network === "gorbagana") {
      return {
        symbol,
        name: `${symbol} (Gorbagana)`,
        price: 0,
        priceChange24h: 0,
        marketCap: 0,
        totalVolume: 0,
        circulatingSupply: 0,
        totalSupply: 0,
        image: null,
        lastUpdated: new Date().toISOString()
      };
    }

    const cacheKey = `token:${symbol}:${currency}:${network}`;
    const cached = this.getCached<TokenDetails>(cacheKey);
    if (cached) return cached;

    // Start with basic result
    const result: TokenDetails = {
      symbol,
      name: symbol,
      price: 0,
      priceChange24h: 0,
      marketCap: 0,
      totalVolume: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      image: null,
      lastUpdated: new Date().toISOString()
    };

    // Fetch market data (price, market cap, 24h change) from CoinGecko
    const marketData = await this.fetchTokenMarketDataFromCoinGecko(symbol, currency);
    Object.assign(result, marketData);

    // For Solana tokens, fetch on-chain data if mint address is provided
    if (network === "solana" && mintAddress) {
      const onChainData = await this.getSolanaTokenOnChainData(mintAddress);
      Object.assign(result, onChainData);
    }

    console.log(`Retrieved token details for ${symbol}:`, result);
    this.setCached(cacheKey, result);
    return result;
  }

  /**
   * Get historical price data for a token
   */
  async getHistoricalData(symbol: string, currency: string = "usd", days: number = 7, interval: string = 'daily', network: Network = "solana"): Promise<HistoricalDataPoint[]> {
    // For Gorbagana network, return placeholder data until we have proper integration
    if (network === "gorbagana") {
      const mockData: HistoricalDataPoint[] = this.generateMockHistoricalData(days);
      return mockData;
    }

    const cacheKey = `historical:${symbol}:${currency}:${days}:${interval}:${network}`;
    const cached = this.getCached<HistoricalDataPoint[]>(cacheKey);
    if (cached) return cached;

    const coinId = this.coinIdMap[symbol];
    if (!coinId) {
      // If no mapping exists, return mock data
      const mockData: HistoricalDataPoint[] = this.generateMockHistoricalData(days);
      this.setCached(cacheKey, mockData);
      return mockData;
    }

    try {
      // Adjust interval based on days requested for better data quality
      let adjustedInterval = interval;
      if (days <= 1) {
        adjustedInterval = 'hourly';
      } else if (days <= 7) {
        adjustedInterval = 'hourly';
      } else if (days <= 30) {
        adjustedInterval = 'daily';
      } else {
        adjustedInterval = 'daily';
      }

      const response = await fetch(
        `${CryptoDataService.COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${adjustedInterval}`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the data for our chart: array of {time, value}
      const formattedData: HistoricalDataPoint[] = data.prices.map((pricePoint: [number, number]) => ({
        time: new Date(pricePoint[0]).toLocaleDateString(),
        value: pricePoint[1]
      }));
      
      this.setCached(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Return mock data if API fails
      const mockData: HistoricalDataPoint[] = this.generateMockHistoricalData(days);
      this.setCached(cacheKey, mockData);
      return mockData;
    }
  }

  /**
   * Generate mock historical data for testing or fallback
   */
  private generateMockHistoricalData(days: number, startPrice?: number): HistoricalDataPoint[] {
    const mockData: HistoricalDataPoint[] = [];
    let currentValue = startPrice || 10 + Math.random() * 5; // Start with a random base price
    
    for (let i = days; i >= 0; i--) {
      // Add some random fluctuation
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
      currentValue = currentValue * (1 + fluctuation);
      
      mockData.push({
        time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: currentValue
      });
    }
    return mockData;
  }

  /**
   * Get current price for a token
   */
  async getTokenPrice(symbol: string, currency: string = "usd"): Promise<number> {
    const cacheKey = `price:${symbol}:${currency}`;
    const cached = this.getCached<number>(cacheKey);
    if (cached) return cached;

    const coinId = this.coinIdMap[symbol];
    if (!coinId) {
      this.setCached(cacheKey, 0);
      return 0;
    }

    // Try different APIs in sequence as fallbacks
    const apis = [
      { 
        name: 'CoinGecko', 
        fetch: () => this.fetchPriceFromCoinGecko(coinId, currency) 
      },
      { 
        name: 'Coinpaprika', 
        fetch: () => this.fetchPriceFromCoinpaprika(symbol, currency) 
      },
      { 
        name: 'CoinCap', 
        fetch: () => this.fetchPriceFromCoinCap(symbol, currency) 
      }
    ];

    for (const api of apis) {
      try {
        const price = await api.fetch();
        if (price !== null && !isNaN(price) && price > 0) {
          console.log(`${api.name} returned valid price for ${symbol}: ${price}`);
          this.setCached(cacheKey, price);
          return price;
        }
      } catch (error) {
        console.log(`Error with ${api.name}:`, error);
        // Continue to next API
      }
    }

    console.error(`All APIs failed for ${symbol}`);
    this.setCached(cacheKey, 0);
    return 0;
  }

  /**
   * Fetch token details from CoinGecko for market data
   * This method only fetches market-related data (price, market cap, 24h metrics)
   */
  private async fetchTokenMarketDataFromCoinGecko(symbol: string, currency: string): Promise<Partial<TokenDetails>> {
    const coinId = this.coinIdMap[symbol];
    if (!coinId) {
      return {};
    }
    
    try {
      const response = await fetch(
        `${CryptoDataService.COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract market-related information
      const marketData = data.market_data;
      const price = marketData.current_price?.[currency] || 0;
      const priceChange24h = marketData.price_change_percentage_24h || 0;
      const marketCap = marketData.market_cap?.[currency] || 0;
      const totalVolume = marketData.total_volume?.[currency] || 0;
      const circulatingSupply = marketData.circulating_supply || 0;

      return {
        price,
        priceChange24h,
        marketCap,
        totalVolume,
        circulatingSupply,
        name: data.name,
        image: data.image?.small || null
      };
    } catch (error) {
      console.error(`Error fetching market data from CoinGecko for ${symbol}:`, error);
      return {};
    }
  }

  /**
   * Fetch Solana token details using RPC calls
   * This method fetches on-chain token data like total supply
   */
  async getSolanaTokenOnChainData(mintAddress: string): Promise<Partial<TokenDetails>> {
    try {
      // Import Solana web3.js library dynamically
      const solanaModule = await import('@solana/web3.js');
      const { networks } = await import('~/lib/config');
      
      // Use the Solana RPC URL from config
      const rpcUrl = networks.solana.rpc;
      const connection = new solanaModule.Connection(rpcUrl);
      
      // Handle native SOL specially since it doesn't have a mint account in the traditional sense
      const NATIVE_MINT = "So11111111111111111111111111111111111111112";
      if (mintAddress === NATIVE_MINT || mintAddress.toLowerCase() === "sol") {
        // For native SOL, we fetch the total supply differently
        const supply = await connection.getSupply();
        if (supply.value) {
          // Convert lamports to SOL (9 decimals)
          const totalSol = Number(supply.value.total) / Math.pow(10, 9);
          return {
            totalSupply: totalSol,
          };
        }
      } else {
        // For other SPL tokens, fetch the token supply from the mint account
        const tokenSupply = await connection.getTokenSupply(new solanaModule.PublicKey(mintAddress));
        
        if (tokenSupply.value) {
          return {
            totalSupply: Number(tokenSupply.value.amount) / Math.pow(10, tokenSupply.value.decimals),
          };
        }
      }
      
      return {};
    } catch (error) {
      console.error(`Error fetching on-chain token data for ${mintAddress}:`, error);
      return {};
    }
  }

  /**
   * Fetch token details from Coinpaprika
   */
  private async fetchTokenDetailsFromCoinpaprika(symbol: string, currency: string): Promise<TokenDetails> {
    const coinpaprikaId = this.coinpaprikaIdMap[symbol];
    if (!coinpaprikaId) {
      throw new Error(`No Coinpaprika mapping for ${symbol}`);
    }
    
    const response = await fetch(`${CryptoDataService.COINPAPRIKA_API}/tickers/${coinpaprikaId}?quotes=${currency.toUpperCase()}`);
    if (!response.ok) {
      throw new Error(`Coinpaprika API error: ${response.status}`);
    }
    const data = await response.json();
    
    if (data?.quotes?.[currency.toUpperCase()]) {
      const price = data.quotes[currency.toUpperCase()].price || 0;
      const priceChange24h = data.quotes[currency.toUpperCase()].percent_change_24h || 0;
      
      return {
        symbol,
        name: data.name || symbol,
        price,
        priceChange24h,
        marketCap: 0, // Coinpaprika response structure may differ
        totalVolume: 0,
        circulatingSupply: 0,
        totalSupply: data.supply || 0,
        image: null,
        lastUpdated: new Date().toISOString()
      };
    }
    throw new Error(`No data from Coinpaprika for ${symbol}`);
  }

  /**
   * Fetch token details from CoinCap
   */
  private async fetchTokenDetailsFromCoinCap(symbol: string, currency: string): Promise<TokenDetails> {
    // CoinCap doesn't directly support all currencies, so we map to USD and then convert
    const response = await fetch(`${CryptoDataService.COINCAP_API}/assets/${symbol.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.data) {
      throw new Error(`No data from CoinCap for ${symbol}`);
    }
    
    // Get USD price
    const priceUsd = parseFloat(data.data.priceUsd);
    if (!priceUsd || isNaN(priceUsd)) {
      throw new Error(`Invalid price from CoinCap for ${symbol}`);
    }
    
    // For other currencies, we'd need another API for currency conversion
    // For now, just return USD price for CoinCap
    const price = currency.toLowerCase() === 'usd' ? priceUsd : priceUsd; // Would need conversion for other currencies
    
    return {
      symbol,
      name: data.data.name || symbol,
      price: price,
      priceChange24h: data.data.changePercent24Hr ? parseFloat(data.data.changePercent24Hr) : 0,
      marketCap: data.data.marketCapUsd ? parseFloat(data.data.marketCapUsd) : 0,
      totalVolume: data.data.volumeUsd24Hr ? parseFloat(data.data.volumeUsd24Hr) : 0,
      circulatingSupply: data.data.supply ? parseFloat(data.data.supply) : 0,
      totalSupply: data.data.maxSupply ? parseFloat(data.data.maxSupply) : 0,
      image: null, // CoinCap doesn't provide images in the same way
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Fetch price from CoinGecko
   */
  private async fetchPriceFromCoinGecko(coinId: string, currency: string): Promise<number> {
    const response = await fetch(
      `${CryptoDataService.COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=${currency}`
    );
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    const data = await response.json();
    const price = data[coinId] ? data[coinId][currency] : null;
    return price;
  }

  /**
   * Fetch price from Coinpaprika
   */
  private async fetchPriceFromCoinpaprika(symbol: string, currency: string): Promise<number> {
    const coinpaprikaId = this.coinpaprikaIdMap[symbol];
    if (!coinpaprikaId) {
      throw new Error(`No Coinpaprika mapping for ${symbol}`);
    }
    
    const response = await fetch(`${CryptoDataService.COINPAPRIKA_API}/tickers/${coinpaprikaId}?quotes=${currency.toUpperCase()}`);
    if (!response.ok) {
      throw new Error(`Coinpaprika API error: ${response.status}`);
    }
    const data = await response.json();
    
    if (data?.quotes?.[currency.toUpperCase()]) {
      return data.quotes[currency.toUpperCase()].price || 0;
    }
    return null;
  }

  /**
   * Fetch price from CoinCap
   */
  private async fetchPriceFromCoinCap(symbol: string, currency: string): Promise<number> {
    // CoinCap doesn't directly support all currencies, so we map to USD and then convert
    const response = await fetch(`${CryptoDataService.COINCAP_API}/assets/${symbol.toLowerCase()}`);
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
      return priceUsd;
    }
    
    // For other currencies, we'd need another API for currency conversion
    // For now, just return USD price for CoinCap (would need real conversion)
    return priceUsd;
  }

  /**
   * Fetch token metadata from SPL Token Registry
   */
  async getTokenMetadataFromSPLRegistry(mintAddress: string): Promise<{ name: string, symbol: string, logo: string } | null> {
    try {
      // The SPL Token Registry is hosted on GitHub
      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mintAddress}/logo.png`
      );
      
      if (response.ok) {
        // If the logo exists, we know the token is in the registry
        // For complete metadata, we'd need to fetch the entire token list
        // This is a simplified check
        return {
          name: "", // Would come from the token list JSON
          symbol: "", // Would come from the token list JSON
          logo: `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mintAddress}/logo.png`
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching SPL token metadata for ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    this.saveCache();
  }
}

// Create a singleton instance
export const cryptoDataService = new CryptoDataService();