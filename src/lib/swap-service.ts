import { Connection, Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import type { Route, QuoteResponse } from "@jup-ag/api";
import { networks } from "./config";

export interface SwapToken {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
}

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: {
    amount: string | null;
    feeBps: number | null;
  } | null;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number | null;
  timeTaken: number | null;
}

export interface SwapRoute {
  quote: JupiterQuoteResponse;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: number;
  toAmount: number;
}

export interface SwapQuoteRequest {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: number; // in base units (e.g., lamports for SOL)
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
}

export interface SwapExecutionRequest {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: PublicKey;
}

export class SwapService {
  private connection: Connection | null = null;

  constructor() {
    // Initialize the service
  }

  async initialize(rpcUrl?: string): Promise<void> {
    const solanaRpcUrl = rpcUrl || networks.solana.rpc;
    if (!this.connection) {
      this.connection = new Connection(solanaRpcUrl);
    }
  }

  async getTokens(): Promise<SwapToken[]> {
    throw new Error("getTokens not supported by API v6");
  }

  async getQuote(request: SwapQuoteRequest): Promise<SwapRoute | null> {
    const {
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippageBps = 50, // Default to 0.5% slippage
    } = request;

    try {
      // Get quote from Jupiter API
      const quoteResponse = await fetch(
        'https://quote-api.jup.ag/v6/quote?' + 
        new URLSearchParams({
          inputMint: fromTokenAddress,
          outputMint: toTokenAddress,
          amount: amount.toString(),
          slippageBps: slippageBps.toString(),
        })
      ).then(res => res.json()) as JupiterQuoteResponse;

      if (!quoteResponse) {
        return null;
      }

      // Get token details (simplified - in a real app you might fetch token metadata separately)
      const fromToken: SwapToken = {
        address: fromTokenAddress,
        symbol: "TOKEN", // Would need to resolve from mint
        name: "Token",
        decimals: 9, // Default, should get from API response or other source
        logoURI: "",
        tags: [],
        chainId: 101,
      };

      const toToken: SwapToken = {
        address: toTokenAddress,
        symbol: "TOKEN", // Would need to resolve from mint
        name: "Token",
        decimals: 9, // Default, should get from API response or other source
        logoURI: "",
        tags: [],
        chainId: 101,
      };

      return {
        quote: quoteResponse,
        fromToken,
        toToken,
        fromAmount: parseFloat(quoteResponse.inAmount) / Math.pow(10, fromToken.decimals),
        toAmount: parseFloat(quoteResponse.outAmount) / Math.pow(10, toToken.decimals),
      };
    } catch (error) {
      console.error("Error getting swap quote:", error);
      return null;
    }
  }

  async executeSwap(request: SwapExecutionRequest, signTransaction: (transaction: any) => Promise<any>): Promise<string> {
    const { quoteResponse: inputQuoteResponse, userPublicKey } = request;

    try {
      if (!this.connection) {
        throw new Error("Connection not initialized");
      }

      // Get the swap transaction from Jupiter API
      const swapApiCall = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: inputQuoteResponse,
          userPublicKey: userPublicKey.toString(),
          wrapAndUnwrapSol: true, // Auto wrap/unwrap SOL
        })
      }).then(res => res.json());
      
      const { swapTransaction } = swapApiCall;

      if (!swapTransaction) {
        throw new Error("No swap transaction received from Jupiter API");
      }

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign the transaction with the user's wallet
      const signedTransaction = await signTransaction(transaction);

      // The transaction has already been retrieved above, so we don't need to fetch it again
      // Just continue with sending the transaction
      if (!swapTransaction) {
        throw new Error("No swap transaction received from Jupiter API");
      }

      // Send the transaction
      const rawTransaction = signedTransaction.serialize();
      const txId = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      });

      // Confirm the transaction
      await this.connection.confirmTransaction(txId);

      return txId;
    } catch (error) {
      console.error("Error executing swap:", error);
      throw error;
    }
  }

  // Helper function to simulate swap without execution
  getSimulatedOutputAmount(inputAmount: number, inputDecimals: number, outputDecimals: number): number {
    // In a real scenario, this would come from the quote
    // For simulation, we'll just return the input amount adjusted for decimals
    const inputInBaseUnits = inputAmount * Math.pow(10, inputDecimals);
    const outputAmount = inputInBaseUnits / Math.pow(10, outputDecimals);
    return outputAmount;
  }
}

// Singleton instance
const swapService = new SwapService();
export default swapService;