"use client"

import { TrendingUp } from "lucide-react"
import { useWallet } from "~/lib/wallet-context"

interface PortfolioBalanceProps {
  hidden?: boolean;
  loading?: boolean;
}

const tokens = [
  { id: "gor", value: 283382 },
  { id: "sol", value: 89145 },
  { id: "usdc", value: 25000 },
  { id: "ray", value: 4313 },
];

export function PortfolioBalance({ hidden = false, loading = false }: PortfolioBalanceProps) {
  const { isTokenHidden } = useWallet();

  const totalBalance = tokens
    .filter((token) => !isTokenHidden(token.id))
    .reduce((sum, token) => sum + token.value, 0);

  const formattedBalance = (totalBalance / 1000).toFixed(2);

  if (loading) {
    return (
      <div className="plasmo-text-center plasmo-py-8">
        <div className="plasmo-h-4 plasmo-w-24 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mx-auto plasmo-mb-2"></div>
        <div className="plasmo-h-12 plasmo-w-48 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mx-auto plasmo-mb-3"></div>
        <div className="plasmo-h-4 plasmo-w-32 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded plasmo-mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="plasmo-text-center plasmo-pb-6">
      <p className="plasmo-text-muted-foreground plasmo-text-sm plasmo-mb-2">Total Balance</p>
      <h1 className="plasmo-text-5xl plasmo-font-bold plasmo-text-foreground plasmo-mb-3 plasmo-text-balance plasmo-font-sans">
        {hidden ? "****" : `${formattedBalance}K`}
      </h1>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-text-primary">
        <TrendingUp className="plasmo-h-4 plasmo-w-4" />
        <span className="plasmo-text-sm plasmo-font-medium">{hidden ? "****" : "+2.34% Today"}</span>
      </div>
    </div>
  );
}
