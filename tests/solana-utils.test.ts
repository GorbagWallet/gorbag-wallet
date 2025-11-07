import { Connection, LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js';
import { 
  getBalance, 
  getWalletTokens, 
  getTransactionHistory, 
  getTransactionDetails,
  parseTransactionForActivity
} from '../src/lib/solana';

// Mock the Solana web3.js library
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  LAMPORTS_PER_SOL: 1000000000, // Solana's lamports per SOL
  PublicKey: jest.fn(),
  TransactionSignature: jest.fn()
}));

// Mock the global fetch API
global.fetch = jest.fn();

describe('Solana Utilities', () => {
  let mockConnection: any;
  let mockPublicKey: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPublicKey = { toBase58: jest.fn().mockReturnValue('mockPublicKey') };
    (PublicKey as jest.Mock).mockImplementation(() => mockPublicKey);
    
    mockConnection = {
      getBalance: jest.fn(),
      getSignaturesForAddress: jest.fn(),
      getParsedTransaction: jest.fn()
    };
    (Connection as jest.Mock).mockImplementation(() => mockConnection);
  });

  describe('getBalance', () => {
    it('should return the correct balance in SOL', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      const lamportsBalance = 2000000000; // 2 SOL in lamports
      const expectedSOLBalance = lamportsBalance / LAMPORTS_PER_SOL; // 2 SOL
      
      mockConnection.getBalance.mockResolvedValue(lamportsBalance);
      
      const result = await getBalance(address, rpcUrl);
      
      expect(result).toBe(expectedSOLBalance);
      expect(Connection).toHaveBeenCalledWith(rpcUrl);
      expect(mockConnection.getBalance).toHaveBeenCalledWith(mockPublicKey);
      expect(PublicKey).toHaveBeenCalledWith(address);
    });

    it('should return 0 when there is an error fetching balance', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      
      mockConnection.getBalance.mockRejectedValue(new Error('Connection error'));
      
      const result = await getBalance(address, rpcUrl);
      
      expect(result).toBe(0);
    });

    it('should return 0 for invalid addresses', async () => {
      const address = 'invalidAddress';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      
      (PublicKey as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid public key');
      });
      
      const result = await getBalance(address, rpcUrl);
      
      expect(result).toBe(0);
    });
  });

  describe('getWalletTokens', () => {
    it('should return wallet tokens from Helius API', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const heliusApiKey = 'test-api-key';
      const mockTokens = {
        result: {
          items: [
            { token: 'SOL', amount: '10' },
            { token: 'USDC', amount: '100' }
          ]
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockTokens),
        ok: true
      });
      
      const result = await getWalletTokens(address, heliusApiKey);
      
      expect(result).toEqual(mockTokens.result.items);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(address)
        })
      );
    });

    it('should return empty array when there is an error', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const heliusApiKey = 'test-api-key';
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const result = await getWalletTokens(address, heliusApiKey);
      
      expect(result).toEqual([]);
    });

    it('should return empty array when fetch returns an error', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const heliusApiKey = 'test-api-key';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('API error')),
        ok: true
      });
      
      const result = await getWalletTokens(address, heliusApiKey);
      
      expect(result).toEqual([]);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction signatures', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      const expectedSignatures = [
        { signature: 'signature1' },
        { signature: 'signature2' }
      ];
      
      mockConnection.getSignaturesForAddress.mockResolvedValue(expectedSignatures);
      
      const result = await getTransactionHistory(address, rpcUrl, 10);
      
      expect(result).toEqual(expectedSignatures);
      expect(Connection).toHaveBeenCalledWith(rpcUrl);
      expect(PublicKey).toHaveBeenCalledWith(address);
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledWith(
        mockPublicKey, 
        { limit: 10 }
      );
    });

    it('should return empty array when there is an error', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      
      mockConnection.getSignaturesForAddress.mockRejectedValue(new Error('Connection error'));
      
      const result = await getTransactionHistory(address, rpcUrl, 5);
      
      expect(result).toEqual([]);
    });

    it('should use default limit when not provided', async () => {
      const address = '5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      const expectedSignatures = [];
      
      mockConnection.getSignaturesForAddress.mockResolvedValue(expectedSignatures);
      
      const result = await getTransactionHistory(address, rpcUrl);
      
      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledWith(
        mockPublicKey, 
        { limit: 10 } // Default limit
      );
    });
  });

  describe('getTransactionDetails', () => {
    it('should return transaction details', async () => {
      const signature = 'test-signature-123';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      const mockTransaction = { transaction: 'details' };
      
      mockConnection.getParsedTransaction.mockResolvedValue(mockTransaction);
      
      const result = await getTransactionDetails(signature, rpcUrl);
      
      expect(result).toEqual(mockTransaction);
      expect(Connection).toHaveBeenCalledWith(rpcUrl);
      expect(mockConnection.getParsedTransaction).toHaveBeenCalledWith(
        signature, 
        { maxSupportedTransactionVersion: 0 }
      );
    });

    it('should return null when there is an error', async () => {
      const signature = 'test-signature-123';
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      
      mockConnection.getParsedTransaction.mockRejectedValue(new Error('Transaction not found'));
      
      const result = await getTransactionDetails(signature, rpcUrl);
      
      expect(result).toBeNull();
    });
  });

  describe('parseTransactionForActivity', () => {
    it('should handle null transaction', () => {
      const result = parseTransactionForActivity(null, 'mockAddress', 'solana');
      
      expect(result).toEqual({
        type: 'unknown',
        tokenSymbol: 'SOL',
        amount: '0.00',
        counterparty: 'Unknown',
        fee: 0
      });
    });

    it('should handle transaction without metadata', () => {
      const transaction = {
        // No meta property
      } as any;
      
      const result = parseTransactionForActivity(transaction, 'mockAddress', 'solana');
      
      expect(result).toEqual({
        type: 'unknown',
        tokenSymbol: 'SOL',
        amount: '0.00',
        counterparty: 'Unknown',
        fee: 0
      });
    });

    it('should handle transaction without transaction message', () => {
      const transaction = {
        meta: {
          fee: 0
        },
        transaction: {} // Empty transaction object without message property
      } as any;
      
      const result = parseTransactionForActivity(transaction, 'mockAddress', 'solana');
      
      expect(result).toEqual({
        type: 'unknown',
        tokenSymbol: 'SOL',
        amount: '0.00',
        counterparty: 'Unknown',
        fee: 0
      });
    });

    it('should handle SOL sent transaction', () => {
      const walletAddress = 'walletAddr123';
      const transaction = {
        meta: {
          fee: 5000,
          preBalances: [2000000000, 1000000000], // wallet had 2 SOL, other had 1 SOL
          postBalances: [1800000000, 1200000000]  // wallet now has 1.8 SOL, other now has 1.2 SOL
        },
        transaction: {
          message: {
            accountKeys: [walletAddress, 'otherAddr456']
          }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, walletAddress, 'solana');
      
      expect(result.type).toBe('sent');
      expect(result.tokenSymbol).toBe('SOL');
      expect(parseFloat(result.amount)).toBeCloseTo(0.2, 4); // Sent 0.2 SOL
      expect(result.fee).toBe(5000);
    });

    it('should handle SOL received transaction', () => {
      const walletAddress = 'walletAddr123';
      const transaction = {
        meta: {
          fee: 5000,
          preBalances: [1800000000, 1200000000], // wallet had 1.8 SOL, other had 1.2 SOL
          postBalances: [2000000000, 1000000000]  // wallet now has 2 SOL, other now has 1 SOL
        },
        transaction: {
          message: {
            accountKeys: [walletAddress, 'otherAddr456']
          }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, walletAddress, 'solana');
      
      expect(result.type).toBe('received');
      expect(result.tokenSymbol).toBe('SOL');
      expect(parseFloat(result.amount)).toBeCloseTo(0.2, 4); // Received 0.2 SOL
      expect(result.fee).toBe(5000);
    });

    it('should handle SPL token received transaction', () => {
      const walletAddress = 'walletAddr123';
      const transaction = {
        meta: {
          fee: 5000,
          preTokenBalances: [
            {
              accountIndex: 0,
              mint: 'mintAddr123',
              uiTokenAmount: {
                amount: '1000000000', // 1 token in base units
                decimals: 9,
                symbol: 'TOKEN'
              }
            }
          ],
          postTokenBalances: [
            {
              accountIndex: 0,
              mint: 'mintAddr123',
              uiTokenAmount: {
                amount: '2000000000', // 2 tokens in base units
                decimals: 9,
                symbol: 'TOKEN'
              }
            }
          ]
        },
        transaction: {
          message: {
            accountKeys: [walletAddress]
          }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, walletAddress, 'solana');
      
      expect(result.type).toBe('received');
      expect(result.tokenSymbol).toBe('TOKEN');
      expect(result.amount).toBe('1.000000000'); // Received 1 token
      expect(result.fee).toBe(5000);
    });

    it('should handle SPL token sent transaction', () => {
      const walletAddress = 'walletAddr123';
      const transaction = {
        meta: {
          fee: 5000,
          preTokenBalances: [
            {
              accountIndex: 0,
              mint: 'mintAddr123',
              uiTokenAmount: {
                amount: '2000000000', // 2 tokens in base units
                decimals: 9,
                symbol: 'TOKEN'
              }
            }
          ],
          postTokenBalances: [
            {
              accountIndex: 0,
              mint: 'mintAddr123',
              uiTokenAmount: {
                amount: '1000000000', // 1 token in base units
                decimals: 9,
                symbol: 'TOKEN'
              }
            }
          ]
        },
        transaction: {
          message: {
            accountKeys: [walletAddress]
          }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, walletAddress, 'solana');
      
      expect(result.type).toBe('sent');
      expect(result.tokenSymbol).toBe('TOKEN');
      expect(result.amount).toBe('1.000000000'); // Sent 1 token
      expect(result.fee).toBe(5000);
    });

    it('should return default for gorbagana network', () => {
      const transaction = {
        meta: {},
        transaction: {
          message: { accountKeys: [] }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, 'anyAddr', 'gorbagana');
      
      expect(result.tokenSymbol).toBe('GOR'); // Gorbagana network token
    });

    it('should return default for solana network', () => {
      const transaction = {
        meta: {},
        transaction: {
          message: { accountKeys: [] }
        }
      } as any;
      
      const result = parseTransactionForActivity(transaction, 'anyAddr', 'solana');
      
      expect(result.tokenSymbol).toBe('SOL'); // Solana network token
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in all functions gracefully', async () => {
      // Test getBalance error handling
      mockConnection.getBalance.mockRejectedValue(new Error('Balance error'));
      const balanceResult = await getBalance('addr', 'rpc');
      expect(balanceResult).toBe(0);
      
      // Test getTransactionHistory error handling
      mockConnection.getSignaturesForAddress.mockRejectedValue(new Error('History error'));
      const historyResult = await getTransactionHistory('addr', 'rpc');
      expect(historyResult).toEqual([]);
      
      // Test getTransactionDetails error handling
      mockConnection.getParsedTransaction.mockRejectedValue(new Error('Details error'));
      const detailsResult = await getTransactionDetails('sig', 'rpc');
      expect(detailsResult).toBeNull();
    });
  });
});