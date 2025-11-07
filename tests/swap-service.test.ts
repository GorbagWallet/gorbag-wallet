import { Connection, Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { networks } from '../src/lib/config';
import { 
  SwapService,
  SwapToken,
  JupiterQuoteResponse,
  SwapRoute,
  SwapQuoteRequest,
  SwapExecutionRequest
} from '../src/lib/swap-service';

// Mock the Solana web3.js library
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  Keypair: jest.fn(),
  PublicKey: jest.fn(),
  VersionedTransaction: {
    deserialize: jest.fn()
  }
}));

// Mock global fetch API
global.fetch = jest.fn();

describe('Swap Service', () => {
  let swapService: SwapService;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConnection = {
      sendRawTransaction: jest.fn(),
      confirmTransaction: jest.fn()
    };
    (Connection as jest.Mock).mockImplementation(() => mockConnection);
    
    swapService = new SwapService();
  });

  describe('initialize', () => {
    it('should initialize with default RPC URL', async () => {
      const defaultRpcUrl = networks.solana.rpc;
      
      await swapService.initialize();
      
      expect(Connection).toHaveBeenCalledWith(defaultRpcUrl);
    });

    it('should initialize with custom RPC URL', async () => {
      const customRpcUrl = 'https://custom-rpc.solana.com';
      
      await swapService.initialize(customRpcUrl);
      
      expect(Connection).toHaveBeenCalledWith(customRpcUrl);
    });

    it('should not recreate connection if already initialized', async () => {
      const customRpcUrl = 'https://custom-rpc.solana.com';
      
      await swapService.initialize(customRpcUrl);
      await swapService.initialize('https://another-rpc.com'); // This should not change the connection
      
      expect(Connection).toHaveBeenCalledTimes(1); // Only called once
      expect(Connection).toHaveBeenCalledWith(customRpcUrl);
    });
  });

  describe('getTokens', () => {
    it('should throw error as getTokens is not supported', async () => {
      await expect(swapService.getTokens()).rejects.toThrow('getTokens not supported by API v6');
    });
  });

  describe('getQuote', () => {
    it('should return a valid swap quote', async () => {
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000', // 1 SOL in lamports
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        outAmount: '150000000', // 150 USDC (assuming 150:1 ratio)
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [
          {
            swapInfo: {
              ammKey: 'amm-key-123',
              label: 'Raydium',
              inputMint: 'So11111111111111111111111111111111111111112',
              outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
              feeAmount: '10000',
              feeMint: 'So11111111111111111111111111111111111111112'
            },
            percent: 100
          }
        ],
        contextSlot: 123456789,
        timeTaken: 123
      };
      
      const request: SwapQuoteRequest = {
        fromTokenAddress: 'So11111111111111111111111111111111111111112',
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1000000000, // 1 SOL in lamports
        slippageBps: 50
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockQuoteResponse),
        ok: true
      });
      
      const result = await swapService.getQuote(request);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('quote');
      expect(result).toHaveProperty('fromToken');
      expect(result).toHaveProperty('toToken');
      expect(result).toHaveProperty('fromAmount');
      expect(result).toHaveProperty('toAmount');
      
      expect(result!.quote).toEqual(mockQuoteResponse);
      expect(result!.fromAmount).toBeGreaterThan(0);
      expect(result!.toAmount).toBeGreaterThan(0);
      
      // Check that fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('quote-api.jup.ag'),
        expect.any(Object)
      );
    });

    it('should return null when API returns no quote', async () => {
      const request: SwapQuoteRequest = {
        fromTokenAddress: 'So11111111111111111111111111111111111111112',
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1000000000,
        slippageBps: 50
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(null),
        ok: true
      });
      
      const result = await swapService.getQuote(request);
      
      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      const request: SwapQuoteRequest = {
        fromTokenAddress: 'So11111111111111111111111111111111111111112',
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1000000000,
        slippageBps: 50
      };
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const result = await swapService.getQuote(request);
      
      expect(result).toBeNull();
    });

    it('should use default slippage when not provided', async () => {
      const request: SwapQuoteRequest = {
        fromTokenAddress: 'So11111111111111111111111111111111111111112',
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1000000000
        // slippageBps is not provided, should default to 50
      };
      
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockQuoteResponse),
        ok: true
      });
      
      await swapService.getQuote(request);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('50'), // Default slippage
        expect.any(Object)
      );
    });
  });

  describe('executeSwap', () => {
    it('should execute a swap successfully', async () => {
      const mockUserPublicKey = new PublicKey('mockPublicKey');
      // Create a mock transaction object with the required properties
      const mockTransaction = {
        serialize: jest.fn()
      };
      const mockSignedTransaction = { serialize: jest.fn().mockReturnValue(new Uint8Array(100)) };
      
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      const swapRequest: SwapExecutionRequest = {
        quoteResponse: mockQuoteResponse,
        userPublicKey: mockUserPublicKey
      };
      
      // Mock the signTransaction function
      const signTransaction = jest.fn().mockResolvedValue(mockSignedTransaction);
      
      // Mock the fetch response for getting swap transaction
      const mockSwapTransaction = 'mockSwapTransactionBase64String';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ swapTransaction: mockSwapTransaction }),
        ok: true
      });
      
      // Mock the transaction deserialization
      (VersionedTransaction.deserialize as jest.Mock).mockReturnValue(mockTransaction);
      
      // Mock the connection
      await swapService.initialize();
      mockConnection.sendRawTransaction.mockResolvedValue('txId123456789');
      mockConnection.confirmTransaction.mockResolvedValue({ value: { err: null } });
      
      const result = await swapService.executeSwap(swapRequest, signTransaction);
      
      expect(result).toBe('txId123456789');
      expect(global.fetch).toHaveBeenCalledTimes(1); // Called once for the swap endpoint
      expect(VersionedTransaction.deserialize).toHaveBeenCalledWith(expect.any(Buffer));
      expect(signTransaction).toHaveBeenCalledWith(mockTransaction);
      expect(mockConnection.sendRawTransaction).toHaveBeenCalled();
      expect(mockConnection.confirmTransaction).toHaveBeenCalled();
    });

    it('should throw error when no swap transaction is returned', async () => {
      const mockUserPublicKey = new PublicKey('mockPublicKey');
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      const swapRequest: SwapExecutionRequest = {
        quoteResponse: mockQuoteResponse,
        userPublicKey: mockUserPublicKey
      };
      
      const signTransaction = jest.fn();
      
      // Mock the fetch response to return no swap transaction
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({}), // No swapTransaction property
        ok: true
      });
      
      await swapService.initialize();
      
      await expect(swapService.executeSwap(swapRequest, signTransaction)).rejects.toThrow(
        'No swap transaction received from Jupiter API'
      );
    });

    it('should throw error when connection is not initialized', async () => {
      const mockUserPublicKey = new PublicKey('mockPublicKey');
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      const swapRequest: SwapExecutionRequest = {
        quoteResponse: mockQuoteResponse,
        userPublicKey: mockUserPublicKey
      };
      
      const signTransaction = jest.fn();
      
      // Don't initialize the service
      
      await expect(swapService.executeSwap(swapRequest, signTransaction)).rejects.toThrow(
        'Connection not initialized'
      );
    });

    it('should throw error when signTransaction fails', async () => {
      const mockUserPublicKey = new PublicKey('mockPublicKey');
      // Create a mock transaction object with the required properties
      const mockTransaction = {
        serialize: jest.fn()
      };
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      const swapRequest: SwapExecutionRequest = {
        quoteResponse: mockQuoteResponse,
        userPublicKey: mockUserPublicKey
      };
      
      const signTransaction = jest.fn().mockRejectedValue(new Error('Signing failed'));
      
      // Mock the fetch response
      const mockSwapTransaction = 'mockSwapTransactionBase64String';
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ swapTransaction: mockSwapTransaction }),
        ok: true
      });
      
      // Mock the transaction deserialization
      (VersionedTransaction.deserialize as jest.Mock).mockReturnValue(mockTransaction);
      
      await swapService.initialize();
      
      await expect(swapService.executeSwap(swapRequest, signTransaction)).rejects.toThrow('Signing failed');
    });
  });

  describe('getSimulatedOutputAmount', () => {
    it('should return the correct simulated output amount', () => {
      const inputAmount = 10;
      const inputDecimals = 9; // SOL has 9 decimals
      const outputDecimals = 6; // USDC has 6 decimals
      
      const result = swapService.getSimulatedOutputAmount(inputAmount, inputDecimals, outputDecimals);
      
      // With 10 input units, 9 input decimals, 6 output decimals:
      // inputInBaseUnits = 10 * 10^9 = 10,000,000,000
      // outputAmount = 10,000,000,000 / 10^6 = 10,000
      expect(result).toBe(10000);
    });

    it('should return same amount when input and output decimals are equal', () => {
      const inputAmount = 5;
      const inputDecimals = 9;
      const outputDecimals = 9;
      
      const result = swapService.getSimulatedOutputAmount(inputAmount, inputDecimals, outputDecimals);
      
      expect(result).toBe(5);
    });

    it('should handle decimal inputs correctly', () => {
      const inputAmount = 0.5; // Half a token
      const inputDecimals = 9;
      const outputDecimals = 6;
      
      const result = swapService.getSimulatedOutputAmount(inputAmount, inputDecimals, outputDecimals);
      
      // With 0.5 input units, 9 input decimals, 6 output decimals:
      // inputInBaseUnits = 0.5 * 10^9 = 500,000,000
      // outputAmount = 500,000,000 / 10^6 = 500
      expect(result).toBe(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in all functions', async () => {
      // Test getQuote error handling
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const request: SwapQuoteRequest = {
        fromTokenAddress: 'So11111111111111111111111111111111111111112',
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1000000000,
        slippageBps: 50
      };
      
      const quoteResult = await swapService.getQuote(request);
      expect(quoteResult).toBeNull();
      
      // Test executeSwap error handling
      await swapService.initialize();
      const mockUserPublicKey = new PublicKey('mockPublicKey');
      const mockQuoteResponse: JupiterQuoteResponse = {
        inputMint: 'So11111111111111111111111111111111111111112',
        inAmount: '1000000000',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '150000000',
        otherAmountThreshold: '149000000',
        swapMode: 'ExactIn',
        slippageBps: 50,
        platformFee: null,
        priceImpactPct: '0.001',
        routePlan: [],
        contextSlot: null,
        timeTaken: null
      };
      
      const swapRequest: SwapExecutionRequest = {
        quoteResponse: mockQuoteResponse,
        userPublicKey: mockUserPublicKey
      };
      
      const signTransaction = jest.fn();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Swap API error'));
      
      await expect(swapService.executeSwap(swapRequest, signTransaction)).rejects.toThrow('Swap API error');
    });
  });
});