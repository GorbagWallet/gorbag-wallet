"use client"

import { useWallet } from "~/lib/wallet-context"
import { TokenCard } from "~/components/token-card"
import { Button } from "~/components/ui/button"
import { Eye } from "lucide-react"
import { useState } from "react"
import { HideTokenDrawer } from "./hide-token-drawer"

import { gorbaganaTokens, solanaTokens } from "~/lib/token-data"

interface TokenListProps {
  loading?: boolean
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

export function TokenList({ loading = false }: TokenListProps) {
  const { isTokenHidden, network } = useWallet()
  const [showHideDrawer, setShowHideDrawer] = useState(false)

  const tokens = network === "solana" ? solanaTokens : gorbaganaTokens

  const visibleTokens = tokens.filter((token) => !isTokenHidden(token.id))

  return (
    <>
      <div className="">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-3">
          <h2 className="plasmo-text-sm plasmo-font-medium plasmo-text-muted-foreground">Your Tokens</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHideDrawer(true)}
            className="plasmo-h-6 plasmo-px-2 plasmo-rounded-lg plasmo-text-xs hover:plasmo-bg-secondary">
            <Eye className="plasmo-h-3.5 plasmo-w-3.5 plasmo-mr-1" />
            Hide
          </Button>
        </div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <TokenCardSkeleton key={i} />)
        ) : (
          <div>
            {visibleTokens.map((token) => (
              <div key={token.id} onClick={() => { /* Handle navigation to token details */ }} className="plasmo-mb-2">
                <TokenCard {...token} />
              </div>
            ))}
          </div>
        )}
      </div>

      <HideTokenDrawer open={showHideDrawer} onOpenChange={setShowHideDrawer} tokens={tokens} />
    </>
  )
}
