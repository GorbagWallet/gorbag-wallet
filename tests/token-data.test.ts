import { gorbaganaTokens, solanaTokens } from '../src/lib/token-data';
import type { Token } from '../src/lib/token-data';

describe('Token Data', () => {
  describe('Gorbagana Tokens', () => {
    it('contains GOR token', () => {
      expect(gorbaganaTokens).toBeDefined();
      expect(Array.isArray(gorbaganaTokens)).toBe(true);
      expect(gorbaganaTokens.length).toBeGreaterThan(0);

      const gorToken = gorbaganaTokens.find(token => token.symbol === 'GOR');
      expect(gorToken).toBeDefined();
      expect(gorToken).toHaveProperty('id', 'gor');
      expect(gorToken).toHaveProperty('symbol', 'GOR');
      expect(gorToken).toHaveProperty('name', 'Gorbagana');
    });

    it('has proper GOR token structure', () => {
      const gorToken = gorbaganaTokens.find(token => token.symbol === 'GOR');
      expect(gorToken).toMatchObject({
        id: 'gor',
        symbol: 'GOR',
        name: 'Gorbagana',
        amount: '0',
        value: '$0.00',
        change: '+0.00%',
        positive: true,
        price: 0,
      });
    });
  });

  describe('Solana Tokens', () => {
    it('contains SOL token', () => {
      expect(solanaTokens).toBeDefined();
      expect(Array.isArray(solanaTokens)).toBe(true);
      expect(solanaTokens.length).toBeGreaterThan(0);

      const solToken = solanaTokens.find(token => token.symbol === 'SOL');
      expect(solToken).toBeDefined();
      expect(solToken).toHaveProperty('id', 'sol');
      expect(solToken).toHaveProperty('symbol', 'SOL');
      expect(solToken).toHaveProperty('name', 'Solana');
    });

    it('contains other common tokens', () => {
      const expectedTokens = ['SOL', 'USDC', 'USDT', 'RAY', 'JUP', 'BONK'];
      
      expectedTokens.forEach(tokenSymbol => {
        const token = solanaTokens.find(t => t.symbol === tokenSymbol);
        expect(token).toBeDefined();
        if (token) {
          expect(token).toHaveProperty('id');
          expect(token).toHaveProperty('name');
          expect(token).toHaveProperty('price');
        }
      });
    });

    it('has proper token structure', () => {
      const solToken = solanaTokens.find(token => token.symbol === 'SOL');
      expect(solToken).toMatchObject({
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        amount: '0',
        value: '$0.00',
        change: '+0.00%',
        positive: true,
        price: 0,
      });
    });

    it('has mint addresses for SPL tokens', () => {
      const splTokens = solanaTokens.filter(token => token.mint);
      expect(splTokens.length).toBeGreaterThan(0);

      const usdcToken = solanaTokens.find(token => token.symbol === 'USDC');
      expect(usdcToken).toBeDefined();
      if (usdcToken) {
        expect(usdcToken.mint).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/); // Base58 format
      }
    });

    it('has unique token IDs', () => {
      const tokenIds = solanaTokens.map(token => token.id);
      const uniqueIds = [...new Set(tokenIds)];
      expect(tokenIds.length).toBe(uniqueIds.length);
    });
  });

  describe('Token Interface Compliance', () => {
    it('all tokens follow Token interface', () => {
      const allTokens = [...gorbaganaTokens, ...solanaTokens];
      
      allTokens.forEach(token => {
        expect(token).toHaveProperty('id');
        expect(token).toHaveProperty('symbol');
        expect(token).toHaveProperty('name');
        expect(token).toHaveProperty('amount');
        expect(token).toHaveProperty('value');
        expect(token).toHaveProperty('change');
        expect(token).toHaveProperty('positive');
        expect(token).toHaveProperty('icon');
        expect(token).toHaveProperty('price');
        // Note: mint is optional, so it may not exist
      });
    });

    it('token values are properly formatted', () => {
      const allTokens = [...gorbaganaTokens, ...solanaTokens];
      
      allTokens.forEach(token => {
        expect(typeof token.value).toBe('string');
        expect(token.value).toMatch(/^\$\d+\.\d{2}$/); // Should match $XXX.XX format
      });
    });

    it('token changes are properly formatted', () => {
      const allTokens = [...gorbaganaTokens, ...solanaTokens];
      
      allTokens.forEach(token => {
        expect(typeof token.change).toBe('string');
        expect(token.change).toMatch(/^[+-]\d+\.\d{2}%$/); // Should match +XX.XX% or -XX.XX% format
      });
    });
  });

  describe('Token Prices', () => {
    it('has correct default prices', () => {
      const solToken = solanaTokens.find(token => token.symbol === 'SOL');
      expect(solToken?.price).toBe(0); // Default for native token

      const usdcToken = solanaTokens.find(token => token.symbol === 'USDC');
      expect(usdcToken?.price).toBe(1.0); // Should be $1 for stablecoin

      const gorToken = gorbaganaTokens.find(token => token.symbol === 'GOR');
      expect(gorToken?.price).toBe(0); // Default for native token
    });
  });
});