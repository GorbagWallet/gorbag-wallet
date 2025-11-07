import { networks } from '../src/lib/config';

describe('Configuration', () => {
  describe('Networks Configuration', () => {
    it('should have gorbagana network configured', () => {
      expect(networks).toHaveProperty('gorbagana');
      expect(networks.gorbagana).toHaveProperty('rpc');
      expect(networks.gorbagana).toHaveProperty('explorer');
      expect(networks.gorbagana).toHaveProperty('network');
      
      // Check that RPC URL is a valid URL string
      expect(typeof networks.gorbagana.rpc).toBe('string');
      expect(networks.gorbagana.rpc).toContain('://');
      
      // Check that explorer URL is a valid URL string
      expect(typeof networks.gorbagana.explorer).toBe('string');
      expect(networks.gorbagana.explorer).toContain('://');
      
      // Check that network type is testnet
      expect(networks.gorbagana.network).toBe('testnet');
    });

    it('should have solana network configured', () => {
      expect(networks).toHaveProperty('solana');
      expect(networks.solana).toHaveProperty('rpc');
      expect(networks.solana).toHaveProperty('explorer');
      expect(networks.solana).toHaveProperty('network');
      
      // Check that RPC URL is a valid URL string
      expect(typeof networks.solana.rpc).toBe('string');
      expect(networks.solana.rpc).toContain('://');
      
      // Check that explorer URL is a valid URL string
      expect(typeof networks.solana.explorer).toBe('string');
      expect(networks.solana.explorer).toContain('://');
      
      // Check that network type is mainnet-beta
      expect(networks.solana.network).toBe('mainnet-beta');
    });

    it('should have correct RPC endpoints', () => {
      expect(networks.gorbagana.rpc).toBe('https://rpc.gorbagana.wtf');
      expect(networks.solana.rpc).toBe('https://mainnet.helius-rpc.com/?api-key=3b3d8e0c-c07a-47db-a270-eb14f7f3ac34');
    });

    it('should have correct explorer endpoints', () => {
      expect(networks.gorbagana.explorer).toBe('https://trashscan.io/tx/');
      expect(networks.solana.explorer).toBe('https://solscan.io/tx/');
    });

    it('should have correct network identifiers', () => {
      expect(networks.gorbagana.network).toBe('testnet');
      expect(networks.solana.network).toBe('mainnet-beta');
    });

    it('should maintain expected structure', () => {
      const expectedStructure = {
        gorbagana: {
          rpc: expect.any(String),
          explorer: expect.any(String),
          network: expect.any(String)
        },
        solana: {
          rpc: expect.any(String),
          explorer: expect.any(String),
          network: expect.any(String)
        }
      };
      
      expect(networks).toMatchObject(expectedStructure);
    });

    it('should have different RPC endpoints for different networks', () => {
      expect(networks.gorbagana.rpc).not.toBe(networks.solana.rpc);
    });

    it('should have different explorer endpoints for different networks', () => {
      expect(networks.gorbagana.explorer).not.toBe(networks.solana.explorer);
    });

    it('should have different network identifiers', () => {
      expect(networks.gorbagana.network).not.toBe(networks.solana.network);
    });
  });

  describe('Configuration Values Validation', () => {
    it('should have non-empty RPC URLs', () => {
      expect(networks.gorbagana.rpc).not.toBe('');
      expect(networks.solana.rpc).not.toBe('');
    });

    it('should have non-empty explorer URLs', () => {
      expect(networks.gorbagana.explorer).not.toBe('');
      expect(networks.solana.explorer).not.toBe('');
    });

    it('should have non-empty network identifiers', () => {
      expect(networks.gorbagana.network).not.toBe('');
      expect(networks.solana.network).not.toBe('');
    });

    it('should have valid URL formats', () => {
      const urlRegex = /^https?:\/\/.+/;
      
      expect(networks.gorbagana.rpc).toMatch(urlRegex);
      expect(networks.solana.rpc).toMatch(urlRegex);
      expect(networks.gorbagana.explorer).toMatch(urlRegex);
      expect(networks.solana.explorer).toMatch(urlRegex);
    });
  });
});