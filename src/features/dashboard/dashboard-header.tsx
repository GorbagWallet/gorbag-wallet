"use client"

import { useState } from "react"
import { useWallet } from "~/lib/wallet-context"
import { Button } from "~/components/ui/button"
import { ChevronDown, MoreVertical } from "lucide-react"
import { useI18n } from "~/i18n/context"
import activityIcon from "data-base64:~assets/icons/icons8-history-24.png"
import settingsIcon from "data-base64:~assets/icons/icons8-settings-24.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  balanceHidden: boolean;
  onBalanceToggle: (hidden: boolean) => void;
  onNavigate: (view: string, walletId?: string) => void; // New prop
}

interface WalletOptionsDropdownProps {
  walletId: string;
  onNavigate: (view: string, walletId?: string) => void;
}

function WalletOptionsDropdown({ walletId, onNavigate }: WalletOptionsDropdownProps) {
  const { t } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="plasmo-h-6 plasmo-w-6">
          <MoreVertical className="plasmo-h-4 plasmo-w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="plasmo-w-40">
        <DropdownMenuItem onClick={() => onNavigate("walletManagement", walletId)}>
          {t("wallet.viewDetails")}
        </DropdownMenuItem>
        {/* Add other options here later if needed */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardHeader({ balanceHidden, onBalanceToggle, onNavigate }: DashboardHeaderProps) {
  const { wallets, activeWallet, setActiveWallet, deleteWallet } = useWallet()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const handleAddWallet = () => {
    setActiveWallet(null);
  }

  const handleLogout = () => {
    if (activeWallet) {
      deleteWallet(activeWallet.id)
    }
  }

  return (
    <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-py-6">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-auto plasmo-p-0">
            <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
              <div className="plasmo-w-8 plasmo-h-8 plasmo-rounded-full plasmo-bg-primary plasmo-flex plasmo-items-center plasmo-justify-center">
                <span className="plasmo-text-primary-foreground plasmo-font-bold plasmo-text-sm">
                  {activeWallet?.nickname ? activeWallet.nickname.charAt(0).toUpperCase() : 'G'}
                </span>
              </div>
              <div className="plasmo-text-left">
                <p className="plasmo-text-sm plasmo-font-semibold plasmo-text-foreground">{activeWallet?.nickname}</p>
                <p className="plasmo-text-xs plasmo-text-muted-foreground">
                  {activeWallet?.address.slice(0, 6)}...{activeWallet?.address.slice(-4)}
                </p>
              </div>
              <ChevronDown className="plasmo-h-4 plasmo-w-4 plasmo-text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="plasmo-w-56">
          {wallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.id}
              className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-cursor-pointer plasmo-pr-2" // Added plasmo-pr-2 for spacing
            >
              <div
                onClick={() => { // This div handles the primary click to select wallet
                  setActiveWallet(wallet);
                  setOpen(false);
                }}
                className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-flex-1" // Take up available space
              >
                <div className="plasmo-w-6 plasmo-h-6 plasmo-rounded-full plasmo-bg-primary plasmo-flex plasmo-items-center plasmo-justify-center">
                  <span className="plasmo-text-primary-foreground plasmo-font-bold plasmo-text-xs">
                    {wallet.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="plasmo-flex-1">
                  <p className="plasmo-text-sm plasmo-font-medium">{wallet.nickname}</p>
                  <p className="plasmo-text-xs plasmo-text-muted-foreground">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                </div>
                {wallet.id === activeWallet?.id && <div className="plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-bg-primary" />}
              </div>
              <WalletOptionsDropdown walletId={wallet.id} onNavigate={onNavigate} />
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddWallet} className="plasmo-cursor-pointer">
            <span className="plasmo-text-primary">{t("wallet.addWallet")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
        <Button variant="ghost" size="icon" className="plasmo-rounded-xl" onClick={() => onNavigate("activity")}>
          <img src={activityIcon} className="plasmo-h-5 plasmo-w-5" alt={t("wallet.activity")} />
        </Button>
        <Button variant="ghost" size="icon" className="plasmo-rounded-xl" onClick={() => onNavigate("settings")}>
          <img src={settingsIcon} className="plasmo-h-5 plasmo-w-5" alt={t("settings.title")} />
        </Button>
      </div>
    </header>
  )
}