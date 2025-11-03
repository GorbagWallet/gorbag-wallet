"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, TrendingUp, Activity, Wallet, Plus, Minus, Maximize2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useWallet } from "~/lib/wallet-context"
import { useI18n } from "~/i18n/context"
import { TokenCard } from "~/components/token-card"
import { ActionButtons } from "../dashboard/action-buttons"

// Import local token icons
import solIcon from "data-base64:~assets/token-icons/sol.png"
import gorIcon from "data-base64:~assets/token-icons/gor.jpg"
import usdcIcon from "data-base64:~assets/token-icons/usdc.png"
import usdtIcon from "data-base64:~assets/token-icons/usdt.png"
import rayIcon from "data-base64:~assets/token-icons/ray.jpg"
import jupIcon from "data-base64:~assets/token-icons/jup.png"
import bonkIcon from "data-base64:~assets/token-icons/bonk.png"
import eurcIcon from "data-base64:~assets/token-icons/eurc.jpg"

// Import icons
import infoIcon from "data-base64:~assets/icons/icons8-info-24.png"

// Mapping of token symbols to imported icon data
const localTokenIcons: Record<string, string> = {
  SOL: solIcon,
  GOR: gorIcon,
  USDC: usdcIcon,
  USDT: usdtIcon,
  RAY: rayIcon,
  JUP: jupIcon,
  BONK: bonkIcon,
  EURC: eurcIcon,
};

interface TokenPageProps {
  tokenSymbol: string;
  onBack: () => void;
}

// Function to format token amount with proper decimals
function formatTokenAmount(balance: number, decimals: number): string {
  const amount = balance / (10 ** decimals);
  // Format to show up to 6 decimal places, but remove trailing zeros
  if (amount === 0) {
    return '0';
  } else if (amount < 0.000001 && amount > 0) {
    return '<0.000001';
  } else {
    // Format with up to 6 decimal places, removing unnecessary trailing zeros
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
}

// Function to get token icon with fallbacks
function getTokenIcon(symbol: string, imageUrl?: string): string {
  // First, try to use the local icon if available
  const localIcon = localTokenIcons[symbol.toUpperCase()];
  if (localIcon) {
    return localIcon;
  }

  // If no local icon, try the provided image URL
  if (imageUrl) {
    return imageUrl;
  }

  // Fallback to a generic token icon or return a placeholder
  return solIcon; // Use SOL as generic placeholder
}

export default function TokenPage({ tokenSymbol, onBack }: TokenPageProps) {
  const { t } = useI18n()
  const { tokens, network } = useWallet()
  const [token, setToken] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview")
  
  useEffect(() => {
    const foundToken = tokens.find(token => 
      token.content.metadata.symbol === tokenSymbol
    )
    if (foundToken) {
      setToken(foundToken)
    }
  }, [tokens, tokenSymbol])

  if (!token) {
    return (
      <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-pb-24">
        <header className="plasmo-absolute plasmo-top-0 plasmo-left-0 plasmo-right-0 plasmo-flex plasmo-items-center plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border plasmo-max-w-md plasmo-mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl">
            <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
          </Button>
          <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-flex-1 plasmo-text-center">{t("token.title")}</h1>
          <div className="plasmo-w-10" />
        </header>
        <div className="plasmo-text-center plasmo-p-4">
          <div className="plasmo-w-12 plasmo-h-12 plasmo-bg-primary/10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mx-auto plasmo-mb-4">
            <img src={infoIcon} className="plasmo-h-6 plasmo-w-6 plasmo-text-primary" alt={t("common.settings")} />
          </div>
          <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
            {t("token.tokenNotFound")}
          </h3>
          <p className="plasmo-text-sm plasmo-text-muted-foreground">
            {t("token.tokenNotFoundDescription")}
          </p>
        </div>
      </div>
    )
  }

  const tokenIcon = getTokenIcon(token.content.metadata.symbol, token.content.links.image)
  const tokenAmount = formatTokenAmount(token.token_info.balance, token.token_info.decimals)
  const tokenValue = token.value ? `$${token.value.toFixed(2)}` : '$0.00'

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl plasmo-animate-pop">
          <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("token.title")}</h1>
        <Button variant="ghost" size="icon" className="plasmo-rounded-xl plasmo-animate-pop">
          <Settings className="plasmo-h-5 plasmo-w-5" />
        </Button>
      </header>

      <div className="plasmo-px-4 plasmo-pt-6">
        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-mb-6">
          <img 
            src={tokenIcon} 
            alt={token.content.metadata.symbol} 
            className="plasmo-w-16 plasmo-h-16 plasmo-rounded-full plasmo-mb-3" 
          />
          <div className="plasmo-text-center">
            <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground">{tokenAmount}</h2>
            <p className="plasmo-text-sm plasmo-text-muted-foreground">{token.content.metadata.symbol}</p>
            <p className="plasmo-text-lg plasmo-text-foreground plasmo-mt-1">{tokenValue}</p>
          </div>
        </div>

        <div className="plasmo-flex plasmo-bg-card plasmo-rounded-xl plasmo-p-1 plasmo-mb-6">
          <button 
            className={`plasmo-flex-1 plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-text-sm plasmo-font-medium ${
              activeTab === "overview" 
                ? "plasmo-bg-primary plasmo-text-primary-foreground" 
                : "plasmo-text-foreground"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            {t("token.overview")}
          </button>
          <button 
            className={`plasmo-flex-1 plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-text-sm plasmo-font-medium ${
              activeTab === "activity" 
                ? "plasmo-bg-primary plasmo-text-primary-foreground" 
                : "plasmo-text-foreground"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            {t("token.activity")}
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="plasmo-space-y-4">
            <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
              <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3">{t("token.tokenInfo")}</h3>
              <div className="plasmo-space-y-3">
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.symbol")}</span>
                  <span className="plasmo-text-foreground">{token.content.metadata.symbol}</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.name")}</span>
                  <span className="plasmo-text-foreground">{token.content.metadata.name}</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.decimals")}</span>
                  <span className="plasmo-text-foreground">{token.token_info.decimals}</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.totalSupply")}</span>
                  <span className="plasmo-text-foreground">N/A</span>
                </div>
              </div>
            </div>

            <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
              <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3">{t("token.priceInfo")}</h3>
              <div className="plasmo-space-y-3">
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.price")}</span>
                  <span className="plasmo-text-foreground">N/A</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.24hChange")}</span>
                  <span className="plasmo-text-foreground text-green-500">+2.5%</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("token.marketCap")}</span>
                  <span className="plasmo-text-foreground">N/A</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="plasmo-space-y-4">
            <div className="plasmo-text-center plasmo-py-8">
              <Activity className="plasmo-h-12 plasmo-w-12 plasmo-text-muted-foreground plasmo-mx-auto plasmo-mb-3" />
              <p className="plasmo-text-muted-foreground">{t("token.noActivity")}</p>
            </div>
          </div>
        )}

        <div className="plasmo-pt-6">
          <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-3">
            <Button className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary/10 hover:plasmo-bg-primary/20 plasmo-text-primary plasmo-animate-pop">
              <Plus className="plasmo-h-4 plasmo-w-4" />
              {t("token.buy")}
            </Button>
            <Button className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary/10 hover:plasmo-bg-primary/20 plasmo-text-primary plasmo-animate-pop">
              <Minus className="plasmo-h-4 plasmo-w-4" />
              {t("token.sell")}
            </Button>
          </div>
          <div className="plasmo-mt-3">
            <Button className="plasmo-w-full plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-animate-pop">
              <Maximize2 className="plasmo-h-4 plasmo-w-4" />
              {t("swap.swapButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}