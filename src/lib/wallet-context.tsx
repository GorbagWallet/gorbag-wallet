import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { getBalance, getWalletTokens } from "./solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { networks } from "./config";
import { getPortfolioValue, getTokenValue } from "./currency";

export interface Wallet {
  id: string;
  nickname: string;
  address: string;
  seedPhrase?: string;
  privateKey?: string;
  createdAt: number;
  hiddenTokens?: string[];
}

export type Network = "gorbagana" | "solana"

interface WalletContextType {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  loading: boolean;
  network: Network;
  balance: number;
  portfolioValue: number;
  tokens: any[];
  preferredCurrency: string;
  setPreferredCurrency: (currency: string) => void;
  setNetwork: (network: Network) => void;
  setActiveWallet: (wallet: Wallet | null) => void;
  addWallet: (wallet: Wallet) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (id: string) => void;
  toggleHiddenToken: (tokenId: string) => void;
  isTokenHidden: (tokenId: string) => boolean;
  signTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useStorage<Wallet[]>("gorbag_wallets", []);
  const [activeWalletId, setActiveWalletId] = useStorage<string | null>(
    "gorbag_active_wallet",
    null
  );
  const [network, setNetwork] = useStorage<Network>(
    "gorbagana_network",
    "gorbagana"
  );
  const [preferredCurrency, setPreferredCurrency] = useStorage<string>(
    "gorbag_preferred_currency",
    "usd"
  );
  const [activeWallet, setActiveWalletState] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [rawTokens, setRawTokens] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);

  // Add signing functionality that works for both seed phrase and private key imported wallets
  async function signTransaction(transaction: any) {
    if (!activeWallet) {
      throw new Error("No active wallet available for signing");
    }

    // Check if we have the seed phrase (for created wallets or seed phrase imported wallets)
    if (activeWallet.seedPhrase && activeWallet.seedPhrase.length > 0) {
      // Derive the keypair from the seed phrase when needed
      const { importWallet } = await import("~/lib/utils/wallet-utils");
      const walletData = await importWallet(activeWallet.seedPhrase.join(" "));
      const keypair = walletData.keypair;
      
      // Sign the transaction with the derived keypair
      transaction.sign(keypair);
      return transaction;
    } 
    // Check if we have the private key (for private key imported wallets)
    else if (activeWallet.privateKey) {
      // Derive the keypair from the private key
      const { importWallet } = await import("~/lib/utils/wallet-utils");
      try {
        const walletData = await importWallet(activeWallet.privateKey);
        const keypair = walletData.keypair;
        
        // Sign the transaction with the keypair
        transaction.sign(keypair);
        return transaction;
      } catch (err) {
        console.error("Error signing with private key:", err);
        throw new Error("Error signing transaction with private key");
      }
    } else {
      throw new Error("No seed phrase or private key available for signing");
    }
  }

  useEffect(() => {
    setLoading(true);
    if (activeWalletId) {
      const foundWallet = wallets.find((w) => w.id === activeWalletId);
      setActiveWalletState(foundWallet || null);
    } else {
      setActiveWalletState(null);
    }
    setLoading(false);
  }, [activeWalletId, wallets]);

  useEffect(() => {
    if (activeWallet) {
      setBalance(0);
      setPortfolioValue(0);
      setLoading(true);
      const rpcUrl = networks[network].rpc;
      getBalance(activeWallet.address, rpcUrl).then((balance) => {
        setBalance(balance);
        
        // Create the native token based on the current network
        let nativeToken;
        if (network === "gorbagana") {
          // GOR is the native currency for gorbagana network (similar to SOL)
          nativeToken = {
            id: "So11111111111111111111111111111111111111112", // Same ID as SOL since it's the native token
            content: {
              metadata: {
                name: "Gorbagana",
                symbol: "GOR",
              },
              links: {
                image:
                  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", // Using same logo for now
              },
            },
            token_info: {
              balance: balance * LAMPORTS_PER_SOL,
              decimals: 9,
            },
          };
        } else {
          // SOL is the native currency for solana network
          nativeToken = {
            id: "So11111111111111111111111111111111111111112",
            content: {
              metadata: {
                name: "Solana",
                symbol: "SOL",
              },
              links: {
                image:
                  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
              },
            },
            token_info: {
              balance: balance * LAMPORTS_PER_SOL,
              decimals: 9,
            },
          };
        }

        // Fetch other tokens and create the raw tokens array with the native token included
        // Only fetch tokens if on the solana network (gorbagana doesn't have other tokens like USDC)
        if (network === "solana") {
          const heliusApiKey = networks.solana.rpc.split("=")[1];
          getWalletTokens(activeWallet.address, heliusApiKey).then(fetchedTokens => {
            setRawTokens([nativeToken, ...fetchedTokens]);
            setLoading(false);
          });
        } else {
          // On gorbagana network, only show the native token (GOR)
          setRawTokens([nativeToken]);
          setLoading(false);
        }
      });

      const interval = setInterval(() => {
        getBalance(activeWallet.address, rpcUrl).then((balance) => {
          setBalance(balance);
          
          // Update the native token with the new balance in rawTokens
          setRawTokens(prevRawTokens => {
            if (prevRawTokens.length > 0) {
              const updatedTokens = [...prevRawTokens];
              const nativeTokenIndex = updatedTokens.findIndex(token => token.id === "So11111111111111111111111111111111111111112");
              if (nativeTokenIndex !== -1) {
                updatedTokens[nativeTokenIndex] = {
                  ...updatedTokens[nativeTokenIndex],
                  token_info: {
                    ...updatedTokens[nativeTokenIndex].token_info,
                    balance: balance * LAMPORTS_PER_SOL,
                  }
                };
                return updatedTokens;
              }
            }
            return prevRawTokens;
          });
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeWallet, network]);

  useEffect(() => {
    if (tokens.length > 0) {
      setLoading(true);
      const portfolio = tokens.map((token) => ({
        symbol: token.content.metadata.symbol,
        amount: token.token_info.balance / 10 ** token.token_info.decimals,
      }));
      getPortfolioValue(portfolio, preferredCurrency).then((value) => {
        setPortfolioValue(value);
        setLoading(false);
      });
    }
  }, [tokens, preferredCurrency]);

  useEffect(() => {
    if (rawTokens.length > 0) {
      const updatedTokens = Promise.all(
        rawTokens.map(async (token) => {
          const amount = token.token_info.balance / (10 ** token.token_info.decimals);
          console.log("Token amount debug:", token.content.metadata.symbol, "balance:", token.token_info.balance, "decimals:", token.token_info.decimals, "calculated amount:", amount);
          const value = await getTokenValue({ symbol: token.content.metadata.symbol, amount }, preferredCurrency);
          return { ...token, value };
        })
      );
      updatedTokens.then(setTokens);
    }
  }, [rawTokens, preferredCurrency]);

  const setActiveWallet = (wallet: Wallet | null) => {
    setActiveWalletId(wallet ? wallet.id : null);
  };

  const addWallet = (wallet: Wallet) => {
    setWallets((prevWallets) => {
      const updatedWallets = [...prevWallets, wallet];
      setActiveWalletId(wallet.id);
      return updatedWallets;
    });
  };

  const updateWallet = (wallet: Wallet) => {
    setWallets(wallets.map((w) => (w.id === wallet.id ? wallet : w)));
    if (activeWallet?.id === wallet.id) {
      setActiveWalletState(wallet);
    }
  };

  const deleteWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    if (activeWallet?.id === id) {
      const newActive = updated[0] || null;
      setActiveWallet(newActive);
    }
  };

  const toggleHiddenToken = (tokenId: string) => {
    if (!activeWallet) return;
    const hiddenTokens = activeWallet.hiddenTokens || [];
    const updatedHidden = hiddenTokens.includes(tokenId)
      ? hiddenTokens.filter((id) => id !== tokenId)
      : [...hiddenTokens, tokenId];
    updateWallet({ ...activeWallet, hiddenTokens: updatedHidden });
  };

  const isTokenHidden = (tokenId: string) => {
    return activeWallet?.hiddenTokens?.includes(tokenId) || false;
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        activeWallet,
        loading,
        network,
        setNetwork,
        setActiveWallet,
        addWallet,
        updateWallet,
        deleteWallet,
        toggleHiddenToken,
        isTokenHidden,
        balance,
        portfolioValue,
        tokens,
        preferredCurrency,
        setPreferredCurrency,
        signTransaction,
      }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}