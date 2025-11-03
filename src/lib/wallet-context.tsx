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
  getTransactionHistory: () => Promise<any[]>;
  clearTransactionHistoryCache: () => void;
  // Function to manually refresh balances
  refreshBalances: () => Promise<void>;
  // Security functions
  passwordHash: string | null;
  setPassword: (password: string) => Promise<boolean>;
  verifyPassword: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  unlockWallet: (password: string) => Promise<boolean>;
  isLocked: boolean;
  autoLockTimer: string;
  setAutoLockTimer: (timer: string) => void;
  lastActiveTime: number | null;  // Now using useState instead of storage
  setLastActiveTime: (time: number | null) => void;
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
  // Security features  
  const [passwordHash, setPasswordHash] = useStorage<string | null>("gorbag_password_hash", null);
  const [autoLockTimer, setAutoLockTimer] = useStorage<string>("gorbag_auto_lock_timer", "immediately");
  const [lastActiveTimeStorage, setLastActiveTimeStorage] = useStorage<number | null>("gorbag_last_active_time", null);
  const [lastActiveTime, setLastActiveTimeState] = useState<number | null>(lastActiveTimeStorage); // Use useState for immediate updates
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false); // Prevent auto-lock during unlock
  
  // Sync internal state with storage when storage changes
  useEffect(() => {
    setLastActiveTimeState(lastActiveTimeStorage);
  }, [lastActiveTimeStorage]);
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
      const walletData = await importWallet(activeWallet.seedPhrase);
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

  // Cache for transaction history
  const transactionHistoryCache = new Map();
  
  async function getTransactionHistory() {
    if (!activeWallet) {
      console.error("No active wallet available for fetching transaction history");
      return [];
    }

    try {
      const cacheKey = `${activeWallet.address}-${network}`;
      const now = Date.now();
      const cached = transactionHistoryCache.get(cacheKey);
      
      // Check if we have a valid cache (less than 10 minutes old)
      if (cached && (now - cached.timestamp) < 10 * 60 * 1000) { // 10 minutes
        console.log("Returning cached transaction history");
        return cached.data;
      }

      console.log("Fetching transaction history for wallet:", activeWallet.address);
      console.log("Using network:", network);
      console.log("RPC URL:", networks[network].rpc);
      
      const rpcUrl = networks[network].rpc;
      
      // Import the solana module and fetch transaction signatures for the active wallet
      const solanaModule = await import("~/lib/solana");
      const signatures = await solanaModule.getTransactionHistory(activeWallet.address, rpcUrl);
      
      console.log("Fetched signatures:", signatures);
      
      // Limit to the first 10 transactions for performance
      const transactionSignatures = signatures.slice(0, 10);
      console.log("Limited signatures:", transactionSignatures);
      
      // Fetch detailed transaction information for each signature
      const transactions = await Promise.all(
        transactionSignatures.map(async (signatureInfo) => {
          console.log("Fetching details for signature:", signatureInfo.signature);
          const transaction = await solanaModule.getTransactionDetails(signatureInfo.signature, rpcUrl);
          console.log("Transaction details:", transaction);
          
          // Return a simplified transaction object with relevant info
          if (transaction) {
            return {
              signature: signatureInfo.signature,
              slot: signatureInfo.slot,
              blockTime: signatureInfo.blockTime,
              confirmations: signatureInfo.confirmations,
              transaction: transaction,
              fee: transaction.meta?.fee,
              status: transaction.meta?.err ? "failed" : "confirmed"
            };
          }
          return null;
        })
      );

      // Filter out any null transactions
      const filteredTransactions = transactions.filter(tx => tx !== null);
      console.log("Filtered transactions:", filteredTransactions);

      // Cache the results
      transactionHistoryCache.set(cacheKey, {
        data: filteredTransactions,
        timestamp: now
      });

      return filteredTransactions;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }

  // Function to clear the transaction history cache (to be called after a transaction)
  function clearTransactionHistoryCache() {
    if (activeWallet) {
      const cacheKey = `${activeWallet.address}-${network}`;
      transactionHistoryCache.delete(cacheKey);
      console.log("Cleared transaction history cache for:", cacheKey);
    }
  }

  // Function to manually refresh balances
  async function refreshBalances() {
    if (!activeWallet) {
      console.error("No active wallet available for balance refresh");
      return;
    }

    setLoading(true);
    const rpcUrl = networks[network].rpc;
    
    try {
      const balance = await getBalance(activeWallet.address, rpcUrl);
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
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setLoading(false);
    }
  }

  // Security functions
  const setPassword = async (password: string) => {
    if (!password) {
      setPasswordHash(null);
      return true;
    }
    
    try {
      // Generate salt
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      // Hash password with salt using PBKDF2
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        data,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        256
      );
      
      const hashArray = new Uint8Array(derivedBits);
      const combined = new Uint8Array(salt.length + hashArray.length);
      combined.set(salt);
      combined.set(hashArray, salt.length);
      
      const hashString = Array.from(combined)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setPasswordHash(hashString);
      return true;
    } catch (error) {
      console.error("Error setting password:", error);
      return false;
    }
  };

  const verifyPassword = async (password: string) => {
    if (!passwordHash) return true; // No password set
    
    try {
      const encoder = new TextEncoder();
      const hashBytes = new Uint8Array(passwordHash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const salt = hashBytes.slice(0, 16);
      const storedHash = hashBytes.slice(16);
      
      const data = encoder.encode(password);
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        data,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        256
      );
      
      const hashArray = new Uint8Array(derivedBits);
      
      // Compare hashes
      for (let i = 0; i < hashArray.length; i++) {
        if (hashArray[i] !== storedHash[i]) return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  };

  const lockWallet = () => {
    setIsLocked(true);
    // Set lastActiveTime when locking so we know when it was locked
    const now = Date.now();
    setLastActiveTimeState(now); // Update immediate state
    setLastActiveTimeStorage(now); // Update persistent storage
  };

  const unlockWallet = async (password: string) => {
    setIsUnlocking(true); // Prevent auto-lock interference during unlock
    
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setIsLocked(false);
        setLastActiveTimeState(null); // Update immediate state
        setLastActiveTimeStorage(null); // Update persistent storage
        return true;
      }
      return false;
    } finally {
      setIsUnlocking(false); // Always clear the flag
    }
  };

  const checkAutoLock = () => {
    if (!passwordHash) return; // No password set
    if (isLocked) return; // Already locked
    if (isUnlocking) return; // Don't auto-lock during unlock
    
    const now = Date.now();
    const lastActive = lastActiveTime;
    
    // If lastActiveTime is null, user is actively using the wallet (just unlocked)
    if (lastActive === null) {
      return;
    }
    
    const timeDiff = now - lastActive;
    let lockTime = 0;
    
    switch (autoLockTimer) {
      case "immediately": 
        // Small grace period to allow popup close to be detected
        lockTime = 1000; // 1 second
        break;
      case "10mins": 
        lockTime = 10 * 60 * 1000; 
        break;
      case "30mins": 
        lockTime = 30 * 60 * 1000; 
        break;
      case "1hr": 
        lockTime = 60 * 60 * 1000; 
        break;
      case "4hrs": 
        lockTime = 4 * 60 * 60 * 1000; 
        break;
      default: 
        lockTime = 1000;
    }
    
    if (timeDiff >= lockTime) {
      lockWallet();
    }
  };

  // Track popup visibility to detect when user closes the extension
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Only set lastActiveTime if we're in an active session (not already set)
        if (lastActiveTime === null && !isLocked && !isUnlocking && passwordHash) {
          const now = Date.now();
          setLastActiveTimeState(now); // Update immediate state
          setLastActiveTimeStorage(now); // Update persistent storage
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastActiveTime, isLocked, isUnlocking, passwordHash]);

  // Check for auto-lock on mount (when extension reopens)
  useEffect(() => {
    if (passwordHash && lastActiveTimeStorage !== null) {
      const now = Date.now();
      const timeDiff = now - lastActiveTimeStorage;
      
      let lockTime = 0;
      switch (autoLockTimer) {
        case "immediately": lockTime = 1000; break;
        case "10mins": lockTime = 10 * 60 * 1000; break;
        case "30mins": lockTime = 30 * 60 * 1000; break;
        case "1hr": lockTime = 60 * 60 * 1000; break;
        case "4hrs": lockTime = 4 * 60 * 60 * 1000; break;
        default: lockTime = 1000;
      }
      
      if (timeDiff >= lockTime) {
        setIsLocked(true);
      }
    }
  }, []); // Only run on initial mount

  // Periodic auto-lock checking
  useEffect(() => {
    checkAutoLock();
    
    const interval = setInterval(checkAutoLock, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [passwordHash, autoLockTimer, isLocked, isUnlocking]); // Removed lastActiveTime to prevent re-triggering

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

  const addWallet = (wallet: Wallet, setActive: boolean = true) => {
    setWallets((prevWallets) => {
      const updatedWallets = [...prevWallets, wallet];
      if (setActive) {
        setActiveWalletId(wallet.id);
      }
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

  // Function to set last active time (both state and storage)
  const setLastActiveTimeCombined = (time: number | null) => {
    setLastActiveTimeState(time);
    setLastActiveTimeStorage(time);
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
        balance: isLocked ? 0 : balance,
        portfolioValue: isLocked ? 0 : portfolioValue,
        tokens: isLocked ? [] : tokens,
        preferredCurrency,
        setPreferredCurrency,
        signTransaction: isLocked ? async () => { throw new Error("Wallet is locked"); } : signTransaction,
        getTransactionHistory: isLocked ? async () => [] : getTransactionHistory,
        clearTransactionHistoryCache,
        refreshBalances,
        // Security functions
        passwordHash,
        setPassword,
        verifyPassword,
        lockWallet,
        unlockWallet,
        isLocked,
        autoLockTimer,
        setAutoLockTimer,
        lastActiveTime,
        setLastActiveTime: setLastActiveTimeCombined
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