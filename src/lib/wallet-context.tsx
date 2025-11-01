import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";

export interface Wallet {
  id: string;
  nickname: string;
  address: string;
  seedPhrase?: string;
  privateKey?: string;
  createdAt: number;
  hiddenTokens?: string[];
}

interface WalletContextType {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  loading: boolean;
  setActiveWallet: (wallet: Wallet | null) => void;
  addWallet: (wallet: Wallet) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (id: string) => void;
  toggleHiddenToken: (tokenId: string) => void;
  isTokenHidden: (tokenId: string) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useStorage<Wallet[]>("gorbag_wallets", []);
  const [activeWalletId, setActiveWalletId] = useStorage<string | null>("gorbag_active_wallet", null);
  const [activeWallet, setActiveWalletState] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

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
        setActiveWallet,
        addWallet,
        updateWallet,
        deleteWallet,
        toggleHiddenToken,
        isTokenHidden,
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
