"use client"

import { useWallet } from "~/lib/wallet-context"
import { TokenCard } from "~/components/token-card"
import { Button } from "~/components/ui/button"
import { Eye } from "lucide-react"
import { useState } from "react"
import { HideTokenDrawer } from "./hide-token-drawer"

const tokens = [
  {
    id: "gor",
    symbol: "GOR",
    name: "Gorbagana",
    amount: "589.28K",
    value: "$283,382.00",
    change: "+8.42%",
    positive: true,
    icon: "🌿",
    price: 0.48,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    amount: "842.15",
    value: "$89,145.00",
    change: "+2.15%",
    positive: true,
    icon: "◎",
    price: 105.89,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    amount: "25,000",
    value: "$25,000.00",
    change: "0.00%",
    positive: true,
    icon: "💵",
    price: 1.0,
  },
  {
    id: "ray",
    symbol: "RAY",
    name: "Raydium",
    amount: "1,245.67",
    value: "$4,313.00",
    change: "-1.23%",
    positive: false,
    icon: "⚡",
    price: 3.46,
  },
  {
    id: "gor2",
    symbol: "GOR",
    name: "Gorbagana",
    amount: "589.28K",
    value: "$283,382.00",
    change: "+8.42%",
    positive: true,
    icon: "🌿",
    price: 0.48,
  },
  {
    id: "sol2",
    symbol: "SOL",
    name: "Solana",
    amount: "842.15",
    value: "$89,145.00",
    change: "+2.15%",
    positive: true,
    icon: "◎",
    price: 105.89,
  },
  {
    id: "usdc2",
    symbol: "USDC",
    name: "USD Coin",
    amount: "25,000",
    value: "$25,000.00",
    change: "0.00%",
    positive: true,
    icon: "💵",
    price: 1.0,
  },
  {
    id: "ray2",
    symbol: "RAY",
    name: "Raydium",
    amount: "1,245.67",
    value: "$4,313.00",
    change: "-1.23%",
    positive: false,
    icon: "⚡",
    price: 3.46,
  },
]

interface TokenListProps {
  loading?: boolean;
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
  );
}

export function TokenList({ loading = false }: TokenListProps) {
  const { isTokenHidden } = useWallet();
  const [showHideDrawer, setShowHideDrawer] = useState(false);

  const visibleTokens = tokens.filter((token) => !isTokenHidden(token.id));

  return (
    <>
      <div className="plasmo-space-y-2">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-1 plasmo-mb-3">
          <h2 className="plasmo-text-sm plasmo-font-medium plasmo-text-muted-foreground">Your Tokens</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHideDrawer(true)}
            className="plasmo-h-6 plasmo-px-2 plasmo-rounded-lg plasmo-text-xs hover:plasmo-bg-secondary"
          >
            <Eye className="plasmo-h-3.5 plasmo-w-3.5 plasmo-mr-1" />
            Hide
          </Button>
        </div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <TokenCardSkeleton key={i} />)
        ) : (
          visibleTokens.map((token) => (
            <div key={token.id} onClick={() => { /* Handle navigation to token details */ }}>
              <TokenCard {...token} />
            </div>
          ))
        )}
      </div>

      <HideTokenDrawer open={showHideDrawer} onOpenChange={setShowHideDrawer} tokens={tokens} />
    </>
  );
}