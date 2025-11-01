"use client"

import { useWallet } from "~/lib/wallet-context"
import { DashboardHeader } from "~/features/dashboard/dashboard-header"
import { PortfolioBalance } from "~/features/dashboard/portfolio-balance"
import { ActionButtons } from "~/features/dashboard/action-buttons"
import { TokenList } from "~/features/dashboard/token-list"
import { BottomNav } from "~/features/dashboard/bottom-nav"
import { SendModal } from "~/features/dashboard/send-modal"
import { ReceiveModal } from "~/features/dashboard/receive-modal"
import { SwapModal } from "~/features/dashboard/swap-modal"
import { useState } from "react"

export default function DashboardPage() {
  const { activeWallet } = useWallet()
  const [activeModal, setActiveModal] = useState<"send" | "receive" | "swap" | null>(null)
  const [balanceHidden, setBalanceHidden] = useState(false)

  if (!activeWallet) {
    // Handle redirection to onboarding if no active wallet
    return null
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-min-h-screen plasmo-max-w-md plasmo-mx-auto plasmo-bg-background plasmo-p-4">
      <DashboardHeader balanceHidden={balanceHidden} onBalanceToggle={setBalanceHidden} />
      <div className="plasmo-flex-1 plasmo-px-4 plasmo-pb-24">
        <PortfolioBalance hidden={balanceHidden} />
        <ActionButtons onAction={setActiveModal} />
        <TokenList />
      </div>
      <BottomNav />

      <SendModal open={activeModal === "send"} onClose={() => setActiveModal(null)} />
      <ReceiveModal open={activeModal === "receive"} onClose={() => setActiveModal(null)} />
      <SwapModal open={activeModal === "swap"} onClose={() => setActiveModal(null)} />
    </div>
  )
}
