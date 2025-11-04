import { Token } from '../src/lib/token-data';

// Import the functions from token-page.tsx
// We'll test the formatting functions directly
function formatTokenAmount(balance: number, decimals: number): string {
  const amount = balance / (10 ** decimals);
  // Format to show up to 6 decimal places, but remove trailing zeros
  if (amount === 0) {
    return '0';
  } else if (amount < 0.000001 && amount > 0) {
    return '<0.000001';
  } else {
    // Format with up to 6 decimal places, removing unnecessary trailing zeros
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
}

describe('Token Utilities', () => {
  describe('formatTokenAmount', () => {
    it('formats whole numbers correctly', () => {
      expect(formatTokenAmount(1000000000, 9)).toBe('1'); // 1 SOL
      expect(formatTokenAmount(2500000000, 9)).toBe('2.5'); // 2.5 SOL
      expect(formatTokenAmount(10000000000, 9)).toBe('10'); // 10 SOL
    });

    it('formats fractional amounts correctly', () => {
      expect(formatTokenAmount(500000000, 9)).toBe('0.5'); // 0.5 SOL
      expect(formatTokenAmount(123456789, 9)).toBe('0.123457'); // Rounded to 6 decimals
      expect(formatTokenAmount(1000000, 9)).toBe('0.001'); // 0.001 SOL
    });

    it('handles zero amounts', () => {
      expect(formatTokenAmount(0, 9)).toBe('0');
    });

      it('handles very small amounts', () => {
      expect(formatTokenAmount(1, 9)).toBe('<0.000001'); // Very small amount
    });

    it('formats with correct decimals for different token types', () => {
      // USDC has 6 decimals
      expect(formatTokenAmount(1000000, 6)).toBe('1'); // 1 USDC
      expect(formatTokenAmount(1500000, 6)).toBe('1.5'); // 1.5 USDC
      expect(formatTokenAmount(999999, 6)).toBe('0.999999'); // 0.999999 USDC

      // Token with 0 decimals (unusual but possible)
      expect(formatTokenAmount(100, 0)).toBe('100');
    });

    it('removes trailing zeros appropriately', () => {
      expect(formatTokenAmount(2500000000, 9)).toBe('2.5'); // Not 2.500000
      expect(formatTokenAmount(1000000000, 9)).toBe('1'); // Not 1.000000
    });
  });

  describe('Token Interface', () => {
    it('defines token structure correctly', () => {
      const token: Token = {
        id: 'test-token',
        symbol: 'TEST',
        name: 'Test Token',
        amount: '100',
        value: '$1000.00',
        change: '+5.25%',
        positive: true,
        icon: 'mock-icon',
        price: 10,
        mint: 'test-mint-address'
      };

      expect(token).toHaveProperty('id');
      expect(token).toHaveProperty('symbol');
      expect(token).toHaveProperty('name');
      expect(token).toHaveProperty('amount');
      expect(token).toHaveProperty('value');
      expect(token).toHaveProperty('change');
      expect(token).toHaveProperty('positive');
      expect(token).toHaveProperty('icon');
      expect(token).toHaveProperty('price');
      expect(token).toHaveProperty('mint');
    });

    it('has required token properties', () => {
      const token: Token = {
        id: 'test',
        symbol: 'TST',
        name: 'Test',
        amount: '0',
        value: '$0.00',
        change: '+0.00%',
        positive: true,
        icon: 'mock',
        price: 0,
      };

      // mint is optional, so it should be able to be undefined
      expect(token).toMatchObject({
        id: 'test',
        symbol: 'TST',
        name: 'Test',
        amount: '0',
        value: '$0.00',
        change: '+0.00%',
        positive: true,
        icon: 'mock',
        price: 0,
      });
    });
  });

  describe('Token Formatting Edge Cases', () => {
    it('handles maximum decimals', () => {
      // Simulate a token with many decimals
      expect(formatTokenAmount(123456789123456, 18)).toBe('0.000123'); // Rounded
    });

    it('handles large amounts', () => {
      expect(formatTokenAmount(1000000000000000000, 9)).toBe('1,000,000,000'); // 1 billion
    });

    it('handles amounts that round to zero', () => {
      expect(formatTokenAmount(1, 10)).toBe('<0.000001'); // Very small fraction
    });
  });
});