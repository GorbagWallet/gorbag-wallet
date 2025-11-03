import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "./wallet-context";
import swapService, { SwapRoute, SwapQuoteRequest, JupiterQuoteResponse } from "./swap-service";

export interface SwapState {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  priorityFee: boolean;
  swapRoutes: SwapRoute | null;
  loading: boolean;
  error: string | null;
}

export interface SwapActions {
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  setPriorityFee: (enabled: boolean) => void;
  switchTokens: () => void;
  getQuote: () => Promise<void>;
  executeSwap: () => Promise<string | null>;
  clearSwap: () => void;
}

export const useSwap = (): [SwapState, SwapActions] => {
  const { activeWallet, tokens, network, signTransaction } = useWallet();
  const [state, setState] = useState<SwapState>({
    fromToken: "GOR",
    toToken: "SOL",
    fromAmount: "",
    toAmount: "",
    slippage: 0.5,
    priorityFee: false,
    swapRoutes: null,
    loading: false,
    error: null,
  });

  // Initialize tokens if network changes
  useEffect(() => {
    if (network === "solana") {
      // On Solana, we can use Jupiter
      // Set default tokens based on available tokens
      if (tokens.length > 0) {
        const solToken = tokens.find(token => 
          token.content.metadata.symbol === "SOL"
        );
        const gorToken = tokens.find(token => 
          token.content.metadata.symbol === "GOR"
        );
        
        if (solToken && gorToken) {
          setState(prev => ({
            ...prev,
            fromToken: "GOR",
            toToken: "SOL"
          }));
        }
      }
    } else {
      // On Gorbagana, swaps are not supported (for now)
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Swaps are not supported on the Gorbagana network"
      }));
    }
  }, [network, tokens]);

  const setFromToken = (token: string) => {
    setState(prev => ({ ...prev, fromToken: token }));
  };

  const setToToken = (token: string) => {
    setState(prev => ({ ...prev, toToken: token }));
  };

  const setFromAmount = (amount: string) => {
    setState(prev => ({ ...prev, fromAmount: amount }));
  };

  const setToAmount = (amount: string) => {
    setState(prev => ({ ...prev, toAmount: amount }));
  };

  const setSlippage = (slippage: number) => {
    setState(prev => ({ ...prev, slippage }));
  };

  const setPriorityFee = (enabled: boolean) => {
    setState(prev => ({ ...prev, priorityFee: enabled }));
  };

  const switchTokens = () => {
    setState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      swapRoutes: null // Clear routes when switching
    }));
  };

  const getQuote = async () => {
    if (!activeWallet || network === "gorbagana") {
      setState(prev => ({
        ...prev,
        error: network === "gorbagana" 
          ? "Swaps are not supported on the Gorbagana network" 
          : "Wallet not connected"
      }));
      return;
    }

    if (!state.fromAmount || parseFloat(state.fromAmount) <= 0) {
      setState(prev => ({ ...prev, error: "Please enter a valid amount" }));
      return;
    }

    const fromTokenData = tokens.find(token => 
      token.content.metadata.symbol === state.fromToken
    );
    const toTokenData = tokens.find(token => 
      token.content.metadata.symbol === state.toToken
    );

    if (!fromTokenData || !toTokenData) {
      setState(prev => ({ ...prev, error: "Invalid token selected" }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get the mint addresses properly
      // For native tokens like SOL, the ID should be the actual mint address
      let fromMintAddress: string;
      let toMintAddress: string;

      // Check if the token is a native token (SOL/GOR)
      if (state.fromToken === "SOL") {
        fromMintAddress = "So11111111111111111111111111111111111111112"; // Native SOL mint
      } else if (state.fromToken === "GOR") {
        // For GOR on Solana (if it exists as a token), or using same as SOL for native
        fromMintAddress = "So11111111111111111111111111111111111111112";
      } else {
        // For other tokens, use the token id from token data
        fromMintAddress = fromTokenData.id;
      }

      if (state.toToken === "SOL") {
        toMintAddress = "So11111111111111111111111111111111111111112"; // Native SOL mint
      } else if (state.toToken === "GOR") {
        // For GOR on Solana (if it exists as a token), or using same as SOL for native
        toMintAddress = "So11111111111111111111111111111111111111112";
      } else {
        // For other tokens, use the token id from token data
        toMintAddress = toTokenData.id;
      }

      // Get decimals for the tokens to convert the amount to base units
      let fromTokenDecimals = 9; // Default to 9 for native tokens
      let toTokenDecimals = 9; // Default to 9 for native tokens

      // Get decimals from token data if available
      if (fromTokenData.token_info?.decimals) {
        fromTokenDecimals = fromTokenData.token_info.decimals;
      } else if (state.fromToken === "SOL" || state.fromToken === "GOR") {
        fromTokenDecimals = 9; // SOL has 9 decimals
      }

      if (toTokenData.token_info?.decimals) {
        toTokenDecimals = toTokenData.token_info.decimals;
      } else if (state.toToken === "SOL" || state.toToken === "GOR") {
        toTokenDecimals = 9; // SOL has 9 decimals
      }

      // Convert the amount to base units (lamports for SOL)
      const amountInBaseUnits = Math.round(parseFloat(state.fromAmount) * Math.pow(10, fromTokenDecimals));

      const quoteRequest: SwapQuoteRequest = {
        fromTokenAddress: fromMintAddress,
        toTokenAddress: toMintAddress,
        amount: amountInBaseUnits,
        slippageBps: state.slippage * 100, // Convert percentage to basis points
      };

      const swapRoute = await swapService.getQuote(quoteRequest);

      if (swapRoute) {
        setState(prev => ({
          ...prev,
          swapRoutes: swapRoute,
          toAmount: swapRoute.toAmount.toString(),
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: "No routes found for this swap"
        }));
      }
    } catch (error) {
      console.error("Error getting quote:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to get quote"
      }));
    }
  };

  const executeSwap = async (): Promise<string | null> => {
    if (!activeWallet || !state.swapRoutes || !signTransaction) {
      setState(prev => ({ ...prev, error: "Swap not ready or wallet not connected" }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const userPublicKey = new PublicKey(activeWallet.address);
      const txId = await swapService.executeSwap(
        { quoteResponse: state.swapRoutes.quote, userPublicKey },
        signTransaction
      );

      setState(prev => ({
        ...prev,
        loading: false,
        swapRoutes: null,
        fromAmount: "",
        toAmount: ""
      }));

      return txId;
    } catch (error) {
      console.error("Error executing swap:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to execute swap"
      }));
      return null;
    }
  };

  const clearSwap = () => {
    setState(prev => ({
      ...prev,
      fromAmount: "",
      toAmount: "",
      swapRoutes: null,
      error: null
    }));
  };

  const actions: SwapActions = {
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    setPriorityFee,
    switchTokens,
    getQuote,
    executeSwap,
    clearSwap
  };

  return [state, actions];
};