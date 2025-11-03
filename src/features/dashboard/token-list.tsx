"use client"

import { useWallet } from "~/lib/wallet-context"
import { TokenCard } from "~/components/token-card"
import { Button } from "~/components/ui/button"
import { useState } from "react"
import { useI18n } from "~/i18n/context"
import { HideTokenDrawer } from "./hide-token-drawer"

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
import eyeIcon from "data-base64:~assets/icons/icons8-eye-24.png"

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



interface TokenListProps {
  loading?: boolean
  onNavigateToToken?: (tokenSymbol: string) => void
}

function TokenCardSkeleton() {
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-p-2 plasmo-rounded-lg">
      <div className="plasmo-w-10 plasmo-h-10 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded-full"></div>
      <div className="plasmo-flex-1 plasmo-ml-3">
        <div className="plasmo-h-4 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
        <div className="plasmo-h-3 plasmo-w-16 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mt-1"></div>
      </div>
      <div className="plasmo-text-right">
        <div className="plasmo-h-4 plasmo-w-20 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded"></div>
        <div className="plasmo-h-3 plasmo-w-12 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mt-1"></div>
      </div>
    </div>
  )
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

export function TokenList({ loading = false, onNavigateToToken }: TokenListProps) {
  const { t } = useI18n()
  const { tokens, isTokenHidden } = useWallet()
  const [showHideDrawer, setShowHideDrawer] = useState(false)

  const visibleTokens = tokens.filter((token) => !isTokenHidden(token.id))

  return (
    <>
      <div className="">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-3">
          <h2 className="plasmo-text-sm plasmo-font-medium plasmo-text-muted-foreground">{t("wallet.yourTokens")}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHideDrawer(true)}
            className="plasmo-h-6 plasmo-px-2 plasmo-rounded-lg plasmo-text-xs hover:plasmo-bg-secondary">
            <img src={eyeIcon} className="plasmo-h-3.5 plasmo-w-3.5 plasmo-mr-1" alt={t("wallet.hideTokens")} />
            {t("wallet.hideTokens")}
          </Button>
        </div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <TokenCardSkeleton key={i} />)
        ) : (
          <div>
            {visibleTokens.map((token) => (
              <div key={token.id} className="plasmo-mb-2">
                <TokenCard 
                  symbol={token.content.metadata.symbol} 
                  name={token.content.metadata.name} 
                  amount={formatTokenAmount(token.token_info.balance, token.token_info.decimals)} 
                  value={token.value ? `${token.value.toFixed(2)}` : '$0.00'} 
                  icon={getTokenIcon(token.content.metadata.symbol, token.content.links.image)} 
                  onClick={onNavigateToToken ? () => onNavigateToToken(token.content.metadata.symbol) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <HideTokenDrawer 
        open={showHideDrawer} 
        onOpenChange={setShowHideDrawer} 
        tokens={tokens.map(token => ({
          id: token.id,
          symbol: token.content.metadata.symbol,
          name: token.content.metadata.name,
          icon: getTokenIcon(token.content.metadata.symbol, token.content.links.image)
        }))} 
      />
    </>
  )
}
