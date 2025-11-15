import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { getBalance, getWalletTokens } from "./solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { networks } from "./config";
import { getPortfolioValue, getTokenValue } from "./currency";
import { encryptData, decryptData } from "./security-utils";

export interface Wallet {
  id: string;
  nickname: string;
  address: string;
  seedPhrase: string;
  privateKey: string;
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
  portfolioChange24h: number;
  preferredCurrency: string;
  setPreferredCurrency: (currency: string) => void;
  setNetwork: (network: Network) => void;
  setActiveWallet: (wallet: Wallet | null) => void;
  addWallet: (wallet: Wallet, password: string) => Promise<void>;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (id: string) => void;
  toggleHiddenToken: (tokenId: string) => void;
  isTokenHidden: (tokenId: string) => boolean;
  signTransaction: (transaction: any, password?: string) => Promise<any>;
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

import { Storage } from "@plasmohq/storage";
import { createSession, getSession, deleteSession, isSessionExpired, updateSessionLastActive } from "./session-manager";

const storage = new Storage({ area: "local" });

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useStorage<Wallet[]>({key: "gorbag_wallets", instance: storage}, []);
  const [activeWalletId, setActiveWalletId] = useStorage<string | null>(
    {key: "gorbag_active_wallet", instance: storage},
    null
  );
  const [network, setNetwork] = useStorage<Network>(
    {key: "gorbagana_network", instance: storage},
    "gorbagana"
  );
  const [preferredCurrency, setPreferredCurrency] = useStorage<string>(
    {key: "gorbag_preferred_currency", instance: storage},
    "usd"
  );
  // Security features  
  const [passwordHash, setPasswordHash] = useStorage<string | null>({key: "gorbag_password_hash", instance: storage}, null);
  const [autoLockTimer, setAutoLockTimer] = useStorage<string>({key: "gorbag_auto_lock_timer", instance: storage}, "immediately");
  const [lastActiveTimeStorage, setLastActiveTimeStorage] = useStorage<number | null>({key: "gorbag_last_active_time", instance: storage}, null);
  const [lastActiveTime, setLastActiveTimeState] = useState<number | null>(lastActiveTimeStorage); // Use useState for immediate updates
  const [isLocked, setIsLocked] = useState(false); // Start unlocked by default, will be updated by session check
  const [isUnlocking, setIsUnlocking] = useState(false); // Prevent auto-lock during unlock
  
  // Sync internal state with storage when storage changes
  useEffect(() => {
    setLastActiveTimeState(lastActiveTimeStorage);
  }, [lastActiveTimeStorage]);
  const [activeWallet, setActiveWalletState] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange24h, setPortfolioChange24h] = useState(0);
  const [rawTokens, setRawTokens] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);

  

  // Add signing functionality that works for both seed phrase and private key imported wallets
  async function signTransaction(transaction: any, password?: string): Promise<any> {
    if (!activeWallet) {
      throw new Error("No active wallet available for signing");
    }

    // If no password is provided, try to get it from the current session
    let signingPassword = password || "";
    if (!signingPassword) {
      const session = await getSession();
      if (session) {
        signingPassword = session.password;
      }
    }

    if (!signingPassword) {
      throw new Error("Password is required for signing");
    }

    // Helper function to determine if transaction is versioned - moved to be accessible by all branches
    const isVersionedTransaction = (tx: any): boolean => {
      return 'version' in tx;
    };

    let keypair: any;

    // Get the keypair based on wallet type
    if (activeWallet.seedPhrase && activeWallet.seedPhrase.length > 0) {
      const decryptedSeedPhrase = await decryptData(activeWallet.seedPhrase, signingPassword);
      const { importWallet } = await import("~/lib/utils/wallet-utils");
      const walletData = await importWallet(decryptedSeedPhrase);
      keypair = walletData.keypair;
    } 
    // Check if we have the private key (for private key imported wallets)
    else if (activeWallet.privateKey) {
      const decryptedPrivateKey = await decryptData(activeWallet.privateKey, signingPassword);
      const { importWallet } = await import("~/lib/utils/wallet-utils");
      try {
        const walletData = await importWallet(decryptedPrivateKey);
        keypair = walletData.keypair;
      } catch (err) {
        console.error("Error getting private key for signing:", err);
        throw new Error("Error signing transaction with private key");
      }
    } else {
      throw new Error("No seed phrase or private key available for signing");
    }

    // Perform the signing with the obtained keypair
    if (isVersionedTransaction(transaction)) {
      transaction.sign([keypair]);
    } else {
      transaction.partialSign(keypair);
    }
    
    return transaction;
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
    if (!activeWallet || isLocked) {
      console.error("No active wallet available or wallet is locked for balance refresh");
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
    console.log("WalletContext: setPassword called with password length:", password ? password.length : 0); // DEBUG
    if (!password) {
      setPasswordHash(null);
      console.log("WalletContext: Cleared password hash, setting isLocked to false"); // DEBUG
      setIsLocked(false);
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
      
      console.log("WalletContext: Setting password hash, setting isLocked to false"); // DEBUG
      setPasswordHash(hashString);
      setIsLocked(false); // After setting a password, we're not locked (until first actual lock)
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

  const lockWallet = async () => {
    console.log("WalletContext: lockWallet called"); // DEBUG
    setIsLocked(true);
    await deleteSession(); // Clear the session when locking
    // Set lastActiveTime when locking so we know when it was locked
    const now = Date.now();
    setLastActiveTimeState(now); // Update immediate state
    setLastActiveTimeStorage(now); // Update persistent storage
  };

  const unlockWallet = async (password: string) => {
    console.log("WalletContext: unlockWallet called"); // DEBUG
    setIsUnlocking(true); // Prevent auto-lock interference during unlock
    
    try {
      const isValid = await verifyPassword(password);
      console.log("WalletContext: unlockWallet - password valid:", isValid); // DEBUG
      if (isValid) {
        // Create a new session with the password and current auto-lock timer
        await createSession(password, autoLockTimer);
        console.log("WalletContext: unlockWallet - session created, setting locked to false"); // DEBUG
        setIsLocked(false);
        setLastActiveTimeState(null); // Update immediate state
        setLastActiveTimeStorage(null); // Update persistent storage
        
        // Update session last active time periodically
        updateSessionLastActive();
        
        return true;
      }
      return false;
    } finally {
      // Small delay to ensure state is properly updated before clearing flag
      setTimeout(() => {
        console.log("WalletContext: unlockWallet - clearing unlock flag"); // DEBUG
        setIsUnlocking(false); // Always clear the flag
      }, 100);
    }
  };

  // Check session expiration periodically instead of using the old auto-lock mechanism
  useEffect(() => {
    const checkSession = async () => {
      console.log("WalletContext: Periodic session check - passwordHash:", !!passwordHash, "isLocked:", isLocked, "isUnlocking:", isUnlocking, "wallets length:", wallets.length); // DEBUG
      // Don't check session expiration if no password is set, wallet is locked, 
      // currently unlocking, or no wallets exist (still onboarding)
      if (!passwordHash || isLocked || isUnlocking || wallets.length === 0) return;
      
      try {
        const isExpired = await isSessionExpired();
        console.log("WalletContext: Periodic check - isExpired:", isExpired); // DEBUG
        if (isExpired) {
          console.log("WalletContext: Periodic check - session expired, locking wallet"); // DEBUG
          await lockWallet();
        }
      } catch (error) {
        console.error("Error checking session expiration:", error);
      }
    };

    // Check session initially
    checkSession();
    
    // Set up interval to check session regularly
    const interval = setInterval(checkSession, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [passwordHash, isLocked, isUnlocking, wallets.length]);

  // Check for existing session on mount and setup visibility tracking
  useEffect(() => {
    const checkExistingSession = async () => {
      console.log("WalletContext: checkExistingSession - passwordHash:", passwordHash, "wallets length:", wallets?.length); // DEBUG
      if (passwordHash) {
        // If there are no wallets, user is still in onboarding process - keep unlocked
        if (wallets?.length === 0) {
          console.log("WalletContext: Password set but no wallets exist, keeping unlocked (still onboarding)"); // DEBUG
          setIsLocked(false);
        } else {
          // Wallets exist, check for session
          const session = await getSession();
          console.log("WalletContext: checkExistingSession - session exists:", !!session); // DEBUG
          if (session) {
            // Check if the session is expired
            const isExpired = await isSessionExpired();
            console.log("WalletContext: checkExistingSession - isExpired:", isExpired); // DEBUG
            if (isExpired) {
              // Session expired, remove it and lock the wallet
              await deleteSession();
              console.log("WalletContext: Session expired, locking wallet"); // DEBUG
              setIsLocked(true);
            } else {
              // Valid session exists, keep wallet unlocked
              console.log("WalletContext: Valid session exists, keeping unlocked"); // DEBUG
              setIsLocked(false);
            }
          } else {
            // No session exists but wallets exist, wallet should be locked
            console.log("WalletContext: No session exists, setting locked (wallets exist but no active session)"); // DEBUG
            setIsLocked(true);
          }
        }
      } else {
        // No password set, wallet is not locked (no need to lock)
        console.log("WalletContext: No passwordHash, keeping unlocked (new user setup)"); // DEBUG
        setIsLocked(false);
      }
    };

    // Use a small delay to ensure other initializations complete first
    setTimeout(() => {
      checkExistingSession();
    }, 100);
  }, [passwordHash, wallets?.length]);

  // Track popup visibility and update session activity
  useEffect(() => {
    let activityInterval: NodeJS.Timeout | null = null;

    // Calculate interval based on autoLockTimer to ensure session doesn't expire
    // Set interval to be half of the auto-lock time, with minimum of 5 seconds and maximum of 30 seconds
    const getIntervalTime = () => {
      switch (autoLockTimer) {
        case "immediately": 
          return 500; // Update every 0.5 seconds for "immediately" setting
        case "10mins": 
          return 30000; // Update every 30 seconds (reasonable for 10 min timer)
        case "30mins": 
          return 60000; // Update every minute
        case "1hr": 
          return 120000; // Update every 2 minutes
        case "4hrs": 
          return 300000; // Update every 5 minutes
        default: 
          return 500; // Default to 0.5 seconds
      }
    };

    const handleVisibilityChange = () => {
      console.log("WalletContext: Visibility change - hidden:", document.hidden, "isLocked:", isLocked, "passwordHash exists:", !!passwordHash); // DEBUG
      if (document.hidden) {
        // When the popup is hidden, update the session last active time to current
        updateSessionLastActive();
        
        // Clear the activity interval when popup is hidden
        if (activityInterval) {
          clearInterval(activityInterval);
          activityInterval = null;
        }
      } else {
        // When the popup is shown again, check if we need to lock
        setTimeout(async () => {
          console.log("WalletContext: Popup shown - checking session, isLocked:", isLocked, "passwordHash:", !!passwordHash); // DEBUG
          if (!isLocked && passwordHash) {
            const isExpired = await isSessionExpired();
            console.log("WalletContext: Session check - isExpired:", isExpired); // DEBUG
            if (isExpired) {
              console.log("WalletContext: Session expired, locking wallet"); // DEBUG
              await lockWallet();
            } else {
              // Update last active time when popup is shown
              console.log("WalletContext: Session valid, updating last active time and starting activity interval"); // DEBUG
              updateSessionLastActive();
              
              // Restart the activity interval with appropriate timing when popup is shown
              if (!activityInterval) {
                const intervalTime = getIntervalTime();
                activityInterval = setInterval(() => {
                  updateSessionLastActive();
                }, intervalTime);
              }
            }
          }
        }, 100); // Small delay to ensure state is updated
      }
    };

    // Set up the activity interval when the component mounts and wallet is unlocked
    if (!isLocked && passwordHash) {
      const intervalTime = getIntervalTime();
      activityInterval = setInterval(() => {
        updateSessionLastActive();
      }, intervalTime);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [isLocked, passwordHash, autoLockTimer]);

  useEffect(() => {
    setLoading(true);
    if (activeWalletId) {
      const foundWallet = wallets.find((w) => w.id === activeWalletId);
      console.log("WalletContext: Found wallet by ID", foundWallet ? foundWallet.id : "null"); // DEBUG
      setActiveWalletState(foundWallet || null);
    } else if (wallets && wallets.length > 0) {
      // If no active wallet is set, default to the first one
      console.log("WalletContext: No active wallet ID, defaulting to first wallet in array", wallets[0]?.id); // DEBUG
      setActiveWalletState(wallets[0]);
      setActiveWalletId(wallets[0].id);
    } else {
      console.log("WalletContext: No wallets found, setting active wallet to null"); // DEBUG
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

  // Calculate portfolio change based on 24h changes of individual tokens
  useEffect(() => {
    const calculatePortfolioChange = async () => {
      if (tokens.length === 0 || portfolioValue <= 0) {
        setPortfolioChange24h(0);
        return;
      }

      try {
        // Import the crypto data service to get 24h changes
        const { cryptoDataService, Network } = await import("./crypto-data-service");
        
        let totalWeightedChange = 0;
        let totalValue = 0;

        for (const token of tokens) {
          const tokenValue = token.value || 0;
          if (tokenValue <= 0) continue; // Skip tokens with no value

          // Get 24h change for this token
          const tokenDetails = await cryptoDataService.getTokenDetails(
            token.content.metadata.symbol,
            preferredCurrency,
            network as Network
          );

          const priceChange24h = tokenDetails.priceChange24h || 0;
          // Calculate weighted contribution to portfolio change
          const weightedChange = (tokenValue / portfolioValue) * priceChange24h;
          totalWeightedChange += weightedChange;
          totalValue += tokenValue;
        }

        // Only use the calculated value if we have tokens with valid values
        if (totalValue > 0) {
          setPortfolioChange24h(totalWeightedChange);
        } else {
          setPortfolioChange24h(0);
        }
      } catch (error) {
        console.error("Error calculating portfolio change:", error);
        // Set to 0 if there's an error fetching token details
        setPortfolioChange24h(0);
      }
    };

    calculatePortfolioChange();
  }, [tokens, portfolioValue, preferredCurrency, network]);

  const setActiveWallet = (wallet: Wallet | null) => {
    setActiveWalletId(wallet ? wallet.id : null);
  };

  const addWallet = async (wallet: Wallet, password: string, setActive: boolean = true) => {
    if (!password) {
      throw new Error("Password is required to add a wallet");
    }

    const encryptedWallet = { ...wallet };

    if (wallet.seedPhrase) {
      encryptedWallet.seedPhrase = await encryptData(wallet.seedPhrase, password);
    }
    if (wallet.privateKey) {
      encryptedWallet.privateKey = await encryptData(wallet.privateKey, password);
    }

    setWallets((prevWallets) => {
      const updatedWallets = [...prevWallets, encryptedWallet];
      if (setActive) {
        setActiveWalletId(encryptedWallet.id);
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
        portfolioChange24h: isLocked ? 0 : portfolioChange24h,
        tokens: isLocked ? [] : tokens,
        preferredCurrency,
        setPreferredCurrency,
        signTransaction: isLocked 
          ? async (transaction: any, password?: string) => { throw new Error("Wallet is locked"); } 
          : signTransaction,
        getTransactionHistory: isLocked ? async () => [] : getTransactionHistory,
        clearTransactionHistoryCache,
        refreshBalances: isLocked ? async () => {} : refreshBalances,
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