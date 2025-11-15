"use client"

import { currencySymbols } from "~/lib/currency";
import { TrendingUp } from "lucide-react"
import { useWallet } from "~/lib/wallet-context"
import { useI18n } from "~/i18n/context"

interface PortfolioBalanceProps {
  hidden?: boolean;
  loading?: boolean;
}

export function PortfolioBalance({ hidden = false, loading = false }: PortfolioBalanceProps) {
  const { t } = useI18n()
  const { portfolioValue, portfolioChange24h, preferredCurrency } = useWallet();

  const formattedBalance = portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedChange = Math.abs(portfolioChange24h).toFixed(2);
  const changeIsPositive = portfolioChange24h >= 0;
  const currencySymbol = currencySymbols[preferredCurrency] || "$";

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
      <p className="plasmo-text-muted-foreground plasmo-text-sm plasmo-mb-2">{t("wallet.totalBalance")}</p>
      <h1 className="plasmo-text-5xl plasmo-font-bold plasmo-text-foreground plasmo-mb-3 plasmo-text-balance plasmo-font-sans">
        {hidden ? "****" : `${currencySymbol}${formattedBalance}`}
      </h1>
      <div className={`plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 ${changeIsPositive ? 'plasmo-text-green-500' : 'plasmo-text-destructive'}`}>
        <TrendingUp 
          className="plasmo-h-4 plasmo-w-4" 
          style={{ transform: changeIsPositive ? 'rotate(0deg)' : 'rotate(180deg)' }}
        />
        <span className="plasmo-text-sm plasmo-font-medium">
          {hidden ? "****" : t("wallet.todayChange", { change: `${changeIsPositive ? '+' : ''}${formattedChange}` })}
        </span>
      </div>
    </div>
  );
}
