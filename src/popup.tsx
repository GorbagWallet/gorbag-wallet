"use client"

import { useEffect, useState } from "react"
import { WalletProvider, useWallet } from "~lib/wallet-context"
import { I18nProvider } from "~i18n/context"
import { Onboarding } from "~features/onboarding"
import { DashboardHeader } from "~/features/dashboard/dashboard-header"
import { PortfolioBalance } from "~/features/dashboard/portfolio-balance"
import { ActionButtons } from "~/features/dashboard/action-buttons"
import { TokenList } from "~/features/dashboard/token-list"
import { BottomNav } from "~/features/dashboard/bottom-nav"
import { SendModal } from "~/features/dashboard/send-modal"
import { ReceiveModal } from "~/features/dashboard/receive-modal"
import { SwapModal } from "~/features/dashboard/swap-modal"
import { WalletManagementPage } from "~/features/wallet-management/wallet-management-page"
import ActivityPage from "~/features/dashboard/activity-page"
import SettingsPage from "~/features/dashboard/settings/settings-page"
import SwapPage from "~/features/swap/swap-page"
import NftPage from "~/features/dashboard/nft-page"
import { WalletLockScreen } from "~/components/wallet-lock-screen"
import TokenPage from "~/features/dashboard/token-page"
import { BannerSection } from "~/features/dashboard/banner-section"
import { DappConnectionProvider, useDappConnection } from "~/features/dapp-connection/context"
import { DappConnectionModal } from "~/features/dapp-connection/dapp-connection-modal"

import "~style.css"

function DashboardPage({ onNavigate, onRefresh, view }: { onNavigate: (view: string, walletId?: string, shouldRefresh?: boolean, tokenSymbol?: string) => void, onRefresh?: () => void, view: string }) {
  const { activeWallet, loading } = useWallet()
  const [activeModal, setActiveModal] = useState<"send" | "receive" | "swap" | null>(null)
  const [balanceHidden, setBalanceHidden] = useState(false)

  const navigateToToken = (tokenSymbol: string) => {
    onNavigate("token", undefined, false, tokenSymbol);
  }

  return (
    <div className="plasmo-h-full plasmo-px-4 plasmo-flex plasmo-flex-col plasmo-relative">
      <DashboardHeader balanceHidden={balanceHidden} onBalanceToggle={setBalanceHidden} onNavigate={onNavigate} />
      <div className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-min-h-0 custom-scrollbar plasmo-bg-background plasmo-pb-24">
        <div>
          <PortfolioBalance hidden={balanceHidden} loading={loading} />
          <ActionButtons onAction={setActiveModal} />
          <BannerSection />
          <TokenList loading={loading} onNavigateToToken={navigateToToken} />
        </div>
      </div>
      <BottomNav onNavigate={onNavigate} onRefresh={onRefresh} view={view} />

      <SendModal open={activeModal === "send"} onClose={() => setActiveModal(null)} />
      <ReceiveModal open={activeModal === "receive"} onClose={() => setActiveModal(null)} />
      <SwapModal open={activeModal === "swap"} onClose={() => setActiveModal(null)} />
    </div>
  )
}

const App = () => {
  const { activeWallet, loading, refreshBalances, isLocked } = useWallet()
  const [view, setView] = useState<
    "loading" | "onboarding" | "dashboard" | "walletManagement" | "activity" | "settings" | "swap" | "nft" | "token"
  >("loading")
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined)
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | undefined>(undefined)
  const [isDuringOnboarding, setIsDuringOnboarding] = useState(false) // Track if we're in the middle of onboarding

  const handleNavigate = (newView: string, walletId?: string, shouldRefresh?: boolean, tokenSymbol?: string) => {
    setSelectedWalletId(walletId)
    setSelectedTokenSymbol(tokenSymbol)
    setView(newView as "loading" | "onboarding" | "dashboard" | "walletManagement" | "activity" | "settings" | "token")
    if (shouldRefresh && newView === "dashboard") {
      refreshBalances();
    }
  }

  // Detect when onboarding starts (but not when just showing lock screen)
  useEffect(() => {
    if (view === "onboarding" && isLocked === false) {
      // Only set onboarding state if we're in onboarding view but not locked
      // This means we're actually in an onboarding flow, not just showing lock screen
      setIsDuringOnboarding(true);
      console.log("App: Onboarding started, setting isDuringOnboarding to true"); // DEBUG
    } else if (view !== "onboarding") {
      // If we're not in onboarding view, ensure onboarding flag is false
      setIsDuringOnboarding(false);
      console.log("App: Not in onboarding view, setting isDuringOnboarding to false"); // DEBUG
    }
  }, [view, isLocked]);

  useEffect(() => {
    console.log("App useEffect: activeWallet", activeWallet ? activeWallet.id : null, "loading", loading, "view", view, "isDuringOnboarding", isDuringOnboarding, "isLocked", isLocked); // DEBUG
    
    // Don't change view automatically if we're in the middle of onboarding
    if (isDuringOnboarding) {
      console.log("App: During onboarding, skipping automatic view change"); // DEBUG
      return;
    }
    
    if (loading) {
      console.log("App: Loading, setting view to loading"); // DEBUG
      setView("loading")
    } else if (isLocked) {
      console.log("App: Wallet is locked, keeping onboarding view (lock screen will overlay)"); // DEBUG
      // Wallet is locked, show onboarding view so lock screen appears
      if (view !== "loading") {
        setView("onboarding"); // Show onboarding view as default when locked, regardless of active wallet
      }
    } else if (activeWallet === null) {
      console.log("App: No active wallet, setting view to onboarding"); // DEBUG
      setView("onboarding")
    } else {
      console.log("App: Active wallet exists and not locked, setting view to dashboard"); // DEBUG
      setView("dashboard")
    }
  }, [activeWallet, loading, isDuringOnboarding, isLocked]) // Removed view from dependency to prevent conflicts with manual navigation

  // Reset onboarding flag when leaving onboarding or when wallet is unlocked after onboarding
  useEffect(() => {
    if (view !== "onboarding" && isDuringOnboarding) {
      console.log("App: Leaving onboarding, setting isDuringOnboarding to false"); // DEBUG
      setIsDuringOnboarding(false);
    }
  }, [view, isDuringOnboarding]);

  // Also reset onboarding flag when wallet is unlocked if not in onboarding view
  useEffect(() => {
    if (isLocked === false && view !== "onboarding" && isDuringOnboarding) {
      console.log("App: Wallet unlocked and not in onboarding view, setting isDuringOnboarding to false"); // DEBUG
      setIsDuringOnboarding(false);
    }
  }, [isLocked, view, isDuringOnboarding]);

  const renderView = () => {
    switch (view) {
      case "loading":
        return <DashboardPage onNavigate={handleNavigate} view={view} />;
      case "onboarding":
        return <Onboarding onDashboard={() => {
          setIsDuringOnboarding(false); // Mark onboarding as completed
          handleNavigate("dashboard");
        }} />;
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} onRefresh={refreshBalances} view={view} />;
      case "walletManagement":
        return <WalletManagementPage walletId={selectedWalletId} onBack={() => handleNavigate("dashboard") } />;
      case "activity":
        return <ActivityPage onBack={() => handleNavigate("dashboard") } />;
      case "settings":
        return <SettingsPage onBack={() => handleNavigate("dashboard") } />;
      case "swap":
        return <SwapPage onBack={() => handleNavigate("dashboard") } />;
      case "nft":
        return <NftPage onBack={() => handleNavigate("dashboard") } />;
      case "token":
        if (selectedTokenSymbol) {
          return <TokenPage tokenSymbol={selectedTokenSymbol} onBack={() => handleNavigate("dashboard") } />;
        }
        return <div>Loading...</div>;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="plasmo-w-[400px] plasmo-h-screen plasmo-bg-background plasmo-fixed">
      <WalletLockScreen />
      {renderView()}
    </div>
  );
}

const AppWithDappConnection = () => {
  const { pendingRequest, approveConnection, rejectConnection } = useDappConnection();
  
  return (
    <>
      <App />
      <DappConnectionModal 
        isOpen={!!pendingRequest}
        request={pendingRequest}
        onApprove={approveConnection}
        onReject={rejectConnection}
      />
    </>
  );
}

const IndexPopup = () => {
  return (
    <I18nProvider>
      <DappConnectionProvider>
        <WalletProvider>
          <AppWithDappConnection />
        </WalletProvider>
      </DappConnectionProvider>
    </I18nProvider>
  )
}

export default IndexPopup