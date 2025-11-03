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
import NftPage from "~/features/nft/nft-page"

import "~style.css"

function DashboardPage({ onNavigate, view }: { onNavigate: (view: string, walletId?: string) => void, view: string }) {
  const { activeWallet, loading } = useWallet()
  const [activeModal, setActiveModal] = useState<"send" | "receive" | "swap" | null>(null)
  const [balanceHidden, setBalanceHidden] = useState(false)

  return (
    <div className="plasmo-h-full plasmo-px-4 plasmo-flex plasmo-flex-col plasmo-relative">
      <DashboardHeader balanceHidden={balanceHidden} onBalanceToggle={setBalanceHidden} onNavigate={onNavigate} />
      <div className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-min-h-0 custom-scrollbar plasmo-bg-background plasmo-pb-24">
        <div>
          <PortfolioBalance hidden={balanceHidden} loading={loading} />
          <ActionButtons onAction={setActiveModal} />
          <TokenList loading={loading} />
        </div>
      </div>
      <BottomNav onNavigate={onNavigate} view={view} />

      <SendModal open={activeModal === "send"} onClose={() => setActiveModal(null)} />
      <ReceiveModal open={activeModal === "receive"} onClose={() => setActiveModal(null)} />
      <SwapModal open={activeModal === "swap"} onClose={() => setActiveModal(null)} />
    </div>
  )
}

const App = () => {
  const { activeWallet, loading } = useWallet()
  const [view, setView] = useState<
    "loading" | "onboarding" | "dashboard" | "walletManagement" | "activity" | "settings" | "swap" | "nft"
  >("loading")
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined)

  const handleNavigate = (newView: string, walletId?: string) => {
    setSelectedWalletId(walletId)
    setView(newView as "loading" | "onboarding" | "dashboard" | "walletManagement" | "activity" | "settings")
  }

  useEffect(() => {
    if (loading) {
      setView("loading")
    } else if (activeWallet === null) {
      setView("onboarding")
    } else {
      setView("dashboard")
    }
  }, [activeWallet, loading])

  const renderView = () => {
    switch (view) {
      case "loading":
        return <DashboardPage onNavigate={handleNavigate} view={view} />;
      case "onboarding":
        return <Onboarding onDashboard={() => handleNavigate("dashboard")} />
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} view={view} />
      case "walletManagement":
        return <WalletManagementPage walletId={selectedWalletId} onBack={() => handleNavigate("dashboard")} />
      case "activity":
        return <ActivityPage onBack={() => handleNavigate("dashboard")} />
      case "settings":
        return <SettingsPage onBack={() => handleNavigate("dashboard")} />
      case "swap":
        return <SwapPage onBack={() => handleNavigate("dashboard")} />
      case "nft":
        return <NftPage onBack={() => handleNavigate("dashboard")} />
      default:
        return <div>Loading...</div>
    }
  }

  return <div className="plasmo-w-[400px] plasmo-h-screen plasmo-bg-background plasmo-fixed">{renderView()}</div>
}

const IndexPopup = () => {
  return (
    <I18nProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </I18nProvider>
  )
}

export default IndexPopup

