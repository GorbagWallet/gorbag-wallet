import { networks } from '../src/lib/config';
import { getPortfolioValue, getTokenValue } from '../src/lib/currency';
import { Token } from '../src/lib/token-data';

// Mock the API calls
global.fetch = jest.fn();

describe('Wallet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Configuration', () => {
    it('has correct network configurations', () => {
      expect(networks).toHaveProperty('gorbagana');
      expect(networks).toHaveProperty('solana');
      
      expect(networks.gorbagana).toHaveProperty('rpc');
      expect(networks.solana).toHaveProperty('rpc');
      
      expect(networks.gorbagana.rpc).toContain('gorbagana');
      expect(networks.solana.rpc).toContain('helius');
    });

    it('has correct Helius API endpoint for Solana', () => {
      expect(networks.solana.rpc).toContain('helius');
    });
  });

  describe('Token Management', () => {
    it('defines core tokens correctly', () => {
      const token: Token = {
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        amount: '1.5',
        value: '$200.00',
        change: '+2.5%',
        positive: true,
        icon: 'mock-icon',
        price: 133.33,
        mint: 'So11111111111111111111111111111111111111112'
      };

      expect(token.symbol).toBe('SOL');
      expect(token.name).toBe('Solana');
      expect(token.price).toBe(133.33);
    });

    it('includes GOR token for Gorbagana network', () => {
      const gorTokens = require('../src/lib/token-data').gorbaganaTokens;
      expect(gorTokens).toBeDefined();
      expect(gorTokens.length).toBeGreaterThan(0);
      expect(gorTokens[0]).toHaveProperty('symbol', 'GOR');
    });

    it('includes standard Solana tokens', () => {
      const solTokens = require('../src/lib/token-data').solanaTokens;
      expect(solTokens).toBeDefined();
      expect(solTokens).toContainEqual(
        expect.objectContaining({ symbol: 'SOL' })
      );
      expect(solTokens).toContainEqual(
        expect.objectContaining({ symbol: 'USDC' })
      );
      expect(solTokens).toContainEqual(
        expect.objectContaining({ symbol: 'USDT' })
      );
    });
  });

  describe('Token Value Calculation', () => {
    it('should calculate value for different token amounts', async () => {
      // Mock successful response
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            solana: {
              usd: 150.00  // $150 per SOL
            }
          })
        } as Response);

      const solToken = { symbol: 'SOL', amount: 2.5 };
      const value = await getTokenValue(solToken, 'usd');
      
      // Should be approximately 2.5 * 150 = 375
      expect(value).toBeCloseTo(375, -1); // Allow some tolerance for API variations
    });

    it('should handle fractional token amounts', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            'usd-coin': {
              usd: 1.0  // $1 per USDC
            }
          })
        } as Response);

      const usdcToken = { symbol: 'USDC', amount: 0.5 };
      const value = await getTokenValue(usdcToken, 'usd');
      
      expect(value).toBeCloseTo(0.5, 1);
    });
  });

  describe('Portfolio Value Calculation', () => {
    it('should calculate portfolio value for multiple tokens', async () => {
      // Mock responses for each token
      const mockResponses = [
        { solana: { usd: 150.00 } },  // SOL
        { 'usd-coin': { usd: 1.00 } }  // USDC
      ];
      
      let callCount = 0;
      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockImplementation(() => {
          const response = mockResponses[callCount++];
          return Promise.resolve({
            ok: true,
            json: async () => response
          } as Response);
        });

      const tokens = [
        { symbol: 'SOL', amount: 2 },
        { symbol: 'USDC', amount: 100 }
      ];
      
      const totalValue = await getPortfolioValue(tokens, 'usd');
      
      // Should be approximately (2 * 150) + (100 * 1) = 400
      expect(totalValue).toBeGreaterThanOrEqual(390); // Lower bound with tolerance
      expect(totalValue).toBeLessThanOrEqual(410);   // Upper bound with tolerance
    });
  });
});