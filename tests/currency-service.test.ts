import { getTokenValue, getPortfolioValue, getTokenDetails } from '../src/lib/currency';

// Mock fetch globally
const originalFetch = global.fetch;

describe('Currency Module', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getTokenValue', () => {
    it('calculates token value correctly', async () => {
      // Setup mock response for CoinGecko
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            solana: {
              usd: 150.75
            }
          })
        } as Response);

      const token = { symbol: 'SOL', amount: 2 };
      const value = await getTokenValue(token, 'usd');

      expect(value).toBeGreaterThan(0); // Should return a positive value
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.coingecko.com/api/v3/simple/price')
      );
    });

    it('returns 0 for unsupported tokens', async () => {
      const token = { symbol: 'UNKNOWN', amount: 10 };
      const value = await getTokenValue(token, 'usd');

      expect(value).toBe(0);
    });

    it('handles API failure gracefully', async () => {
      // Mock all API calls to fail
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockRejectedValueOnce(new Error('API Error')) // CoinGecko fails
        .mockRejectedValueOnce(new Error('API Error')) // Coinpaprika fails
        .mockRejectedValueOnce(new Error('API Error')); // CoinCap fails

      const token = { symbol: 'UNKNOWN', amount: 1 };
      const value = await getTokenValue(token, 'usd');

      expect(value).toBe(0);
    });
  });

  describe('getPortfolioValue', () => {
    it('calculates total portfolio value correctly', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            solana: {
              usd: 150.75
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            'usd-coin': {
              usd: 1.0
            }
          })
        } as Response);

      const tokens = [
        { symbol: 'SOL', amount: 2 },
        { symbol: 'USDC', amount: 100 }
      ];
      
      const totalValue = await getPortfolioValue(tokens, 'usd');

      expect(totalValue).toBeGreaterThan(0);
      expect(totalValue).toBeGreaterThanOrEqual(100); // At least the USDC value
    });
  });

  describe('getTokenDetails', () => {
    it('fetches token details from CoinGecko', async () => {
      const mockTokenData = {
        id: 'solana',
        name: 'Solana',
        symbol: 'sol',
        market_data: {
          current_price: { usd: 150.75 },
          price_change_percentage_24h: 2.45,
          market_cap: { usd: 56789012345 },
          total_volume: { usd: 1234567890 },
          circulating_supply: 500000000,
          total_supply: 600000000
        },
        image: {
          small: 'https://example.com/sol-icon.png'
        }
      };

      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenData
        } as Response);

      const details = await getTokenDetails('SOL', 'usd');

      expect(details).toHaveProperty('name', 'Solana');
      expect(details).toHaveProperty('price', 150.75);
      expect(details).toHaveProperty('priceChange24h', 2.45);
      expect(details).toHaveProperty('marketCap', 56789012345);
    });

    it('handles API errors gracefully', async () => {
      // Mock CoinGecko API to fail
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockRejectedValueOnce(new Error('CoinGecko Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              quotes: {
                USD: {
                  price: 140,
                  percent_change_24h: 1.5
                }
              }
            }
          }) as any
        } as Response);

      const details = await getTokenDetails('SOL', 'usd');

      expect(details).toHaveProperty('symbol', 'SOL');
      // Value should be from fallback API or default
      expect(details.price).toBeDefined();
    });

    it('returns basic info when all APIs fail', async () => {
      // Mock all API calls to fail
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockRejectedValueOnce(new Error('CoinGecko Error')) // CoinGecko fails
        .mockRejectedValueOnce(new Error('Coinpaprika Error')); // Coinpaprika fails

      const details = await getTokenDetails('UNKNOWN', 'usd');

      // The function should return a basic object with defaults when all APIs fail
      expect(details).toBeDefined();
      expect(details).toHaveProperty('symbol', 'UNKNOWN');
      expect(details).toHaveProperty('price', 0);
      expect(details).toHaveProperty('priceChange24h', 0);
    });
  });
});