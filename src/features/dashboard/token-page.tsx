"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, TrendingUp, Activity, Wallet, Plus, Minus, Maximize2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useWallet } from "~/lib/wallet-context"
import { useI18n } from "~/i18n/context"
import { TokenCard } from "~/components/token-card"
import { ActionButtons } from "../dashboard/action-buttons"
import { TokenDetailsSkeleton } from "./token-details-skeleton"
import { InteractiveChart } from "~/components/interactive-chart"

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
  const { tokens, network, preferredCurrency, getTransactionHistory } = useWallet()
  const [token, setToken] = useState<any>(null)
  const [tokenDetails, setTokenDetails] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("activity")
  const [tokenDetailsLoading, setTokenDetailsLoading] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  
  useEffect(() => {
    const foundToken = tokens.find(token => 
      token.content.metadata.symbol === tokenSymbol
    )
    if (foundToken) {
      setToken(foundToken)
    }
  }, [tokens, tokenSymbol])

  useEffect(() => {
    if (token && tokenSymbol) {
      // Fetch detailed token information using the new crypto data service
      const fetchTokenDetails = async () => {
        setTokenDetailsLoading(true);
        try {
          const { cryptoDataService, Network } = await import("~/lib/crypto-data-service");
          
          // Determine the mint address based on token structure
          let mintAddress: string | undefined;
          if (token.id) {
            mintAddress = token.id;
          } else if (token.content?.metadata?.symbol === "SOL") {
            // Special handling for SOL native token
            mintAddress = "So11111111111111111111111111111111111111112";
          }
          
          console.log("Fetching token details for:", { tokenSymbol, mintAddress, network, token });
          
          const details = await cryptoDataService.getTokenDetails(tokenSymbol, preferredCurrency, network as Network, mintAddress);
          setTokenDetails(details);
        } catch (error) {
          console.error("Error fetching token details:", error);
          setTokenDetails(null);
        } finally {
          setTokenDetailsLoading(false);
        }
      };

      fetchTokenDetails();
    }
  }, [token, tokenSymbol, preferredCurrency, network]);

  useEffect(() => {
    if (token) {
      // Fetch transaction history for the token
      const fetchTransactionHistory = async () => {
        setHistoryLoading(true);
        try {
          const history = await getTransactionHistory();
          // Filter transactions related to this token
          const tokenAddress = token.id; // This might need adjustment based on actual token format
          const filteredHistory = history.filter(tx => {
            // This is a simplified filter - in reality, you'd need to check if the transaction involves the token
            // For now, return all transactions; you can enhance this logic later
            return true;
          }).slice(0, 10); // Limit to 10 most recent
          setTransactionHistory(filteredHistory);
        } catch (error) {
          console.error("Error fetching transaction history:", error);
          setTransactionHistory([]);
        } finally {
          setHistoryLoading(false);
        }
      };

      fetchTransactionHistory();
    }
  }, [token, getTransactionHistory]);

  

  if (!token) {
    return (
      <div className="plasmo-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-overflow-y-auto custom-scrollbar">
        <div className="plasmo-min-h-screen plasmo-flex plasmo-flex-col">
          <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
            <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl plasmo-animate-pop">
              <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
            </Button>
            <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("token.title")}</h1>
            <div className="plasmo-w-10" />
          </header>
          <div className="plasmo-flex-1 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-pt-16">
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
        </div>
      </div>
    )
  }

  const tokenIcon = getTokenIcon(token.content.metadata.symbol, token.content.links.image)
  const tokenAmount = formatTokenAmount(token.token_info.balance, token.token_info.decimals)
  const tokenValue = token.value ? `${token.value.toFixed(2)}` : (tokenDetails && tokenDetails.price && tokenAmount !== '0') ? 
    `${(parseFloat(tokenAmount) * tokenDetails.price).toFixed(2)}` : '$0.00'

  return (
    <div className="plasmo-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-overflow-y-auto custom-scrollbar">
      <div className="plasmo-min-h-screen plasmo-flex plasmo-flex-col">
        <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border plasmo-flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl plasmo-animate-pop">
            <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
          </Button>
          <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("token.title")}</h1>
          <Button variant="ghost" size="icon" className="plasmo-rounded-xl plasmo-animate-pop">
            <Settings className="plasmo-h-5 plasmo-w-5" />
          </Button>
        </header>

        <div className="plasmo-flex-1 plasmo-px-4 plasmo-pt-6 plasmo-pb-6">
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
            {/* Chart Section */}
            <InteractiveChart 
              symbol={token.content.metadata.symbol}
              currency={preferredCurrency}
              network={network as "solana" | "gorbagana"}
              initialDays={7}
              title={`${token.content.metadata.symbol} Price Chart`}
            />
            
            {tokenDetailsLoading ? (
              <TokenDetailsSkeleton 
                tokenSymbol={token.content.metadata.symbol}
                tokenAmount={token.token_info.balance}
                tokenDecimals={token.token_info.decimals}
                preferredCurrency={preferredCurrency}
              />
            ) : (
              <>
                {network === "gorbagana" ? (
                  <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-6">
                    <div className="plasmo-text-center">
                      <div className="plasmo-text-foreground plasmo-font-medium plasmo-mb-2">
                        Token Details
                      </div>
                      <p className="plasmo-text-muted-foreground plasmo-text-sm">
                        Detailed token information coming soon for Gorbagana network
                      </p>
                      <div className="plasmo-mt-4 plasmo-text-xs plasmo-text-muted-foreground">
                        <p>Symbol: {token.content.metadata.symbol}</p>
                        <p>Name: {token.content.metadata.name}</p>
                        <p>Decimals: {token.token_info.decimals}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
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
                          <span className="plasmo-text-foreground">
                            {tokenDetails && tokenDetails.totalSupply ? 
                              (tokenDetails.totalSupply > 1e9 ? 
                                `${(tokenDetails.totalSupply / 1e9).toFixed(2)}B` : 
                                tokenDetails.totalSupply.toLocaleString()) : 
                              'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4">
                      <h3 className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3">{t("token.priceInfo")}</h3>
                      <div className="plasmo-space-y-3">
                        <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                          <span className="plasmo-text-muted-foreground">{t("token.price")}</span>
                          <span className="plasmo-text-foreground">
                            {tokenDetails && tokenDetails.price ? 
                              `${tokenDetails.price.toLocaleString(undefined, { 
                                style: 'currency', 
                                currency: preferredCurrency 
                              })}` : 
                              'N/A'}
                          </span>
                        </div>
                        <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                          <span className="plasmo-text-muted-foreground">{t("token.24hChange")}</span>
                          <span className={`plasmo-text-foreground ${tokenDetails && tokenDetails.priceChange24h !== undefined && tokenDetails.priceChange24h >= 0 ? "plasmo-text-green-500" : "plasmo-text-destructive"}`}>
                            {tokenDetails && tokenDetails.priceChange24h !== undefined ? 
                              `${tokenDetails.priceChange24h > 0 ? '+' : ''}${tokenDetails.priceChange24h.toFixed(2)}%` : 
                              'N/A'}
                          </span>
                        </div>
                        <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                          <span className="plasmo-text-muted-foreground">{t("token.marketCap")}</span>
                          <span className="plasmo-text-foreground">
                            {tokenDetails && tokenDetails.marketCap ? 
                              `${tokenDetails.marketCap.toLocaleString(undefined, { 
                                style: 'currency', 
                                currency: preferredCurrency,
                                notation: tokenDetails.marketCap >= 1e9 ? 'compact' : 'standard'
                              })}` : 
                              'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

          {activeTab === "activity" && (
            <div className="plasmo-space-y-4">
              {historyLoading ? (
                <div className="plasmo-text-center plasmo-py-8">
                  <div className="plasmo-flex plasmo-justify-center plasmo-mb-3">
                    <div className="plasmo-h-12 plasmo-w-12 plasmo-bg-muted plasmo-animate-pulse plasmo-rounded-full"></div>
                  </div>
                  <p className="plasmo-text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : transactionHistory.length === 0 ? (
                <div className="plasmo-text-center plasmo-py-8">
                  <Activity className="plasmo-h-12 plasmo-w-12 plasmo-text-muted-foreground plasmo-mx-auto plasmo-mb-3" />
                  <p className="plasmo-text-muted-foreground">{t("token.noActivity")}</p>
                </div>
              ) : (
                <div className="plasmo-space-y-3">
                  {transactionHistory.map((tx, index) => (
                    <div key={index} className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-flex plasmo-items-center plasmo-justify-between">
                      <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
                        <div className={`plasmo-w-10 plasmo-h-10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center ${
                          tx.transaction?.message?.instructions?.[0]?.programId?.toString?.().includes?.('SystemProgram') 
                            ? 'plasmo-bg-green-500/10' 
                            : 'plasmo-bg-destructive/10'
                        }`}>
                          {tx.transaction?.message?.instructions?.[0]?.programId?.toString?.().includes?.('SystemProgram') ? (
                            <Maximize2 className="plasmo-h-5 plasmo-w-5 plasmo-text-green-500" />
                          ) : (
                            <Maximize2 className="plasmo-h-5 plasmo-w-5 plasmo-text-destructive" transform="rotate(180)" />
                          )}
                        </div>
                        <div>
                          <p className="plasmo-font-medium plasmo-text-foreground">
                            {tx.transaction?.message?.instructions?.[0]?.programId?.toString?.().includes?.('SystemProgram') 
                              ? t("activity.sent") 
                              : t("activity.received")}
                          </p>
                          <p className="plasmo-text-xs plasmo-text-muted-foreground">
                            {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleDateString() : 'Date unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="plasmo-text-right">
                        <p className="plasmo-font-medium plasmo-text-foreground">
                          {tx.transaction?.message?.instructions?.[0]?.programId?.toString?.().includes?.('SystemProgram') 
                            ? '-' 
                            : '+'}
                          {tx.transaction?.meta?.fee 
                            ? (tx.transaction.meta.fee / 1_000_000_000).toFixed(6) 
                            : '0.000000'} {network === "gorbagana" ? "GOR" : "SOL"}
                        </p>
                        <p className="plasmo-text-xs plasmo-text-muted-foreground">
                          {tx.signature?.substring(0, 6)}...{tx.signature?.substring(tx.signature.length - 4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="plasmo-pt-6">
            <div className="plasmo-grid plasmo-grid-cols-3 plasmo-gap-3">
              <Button 
                className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary/10 hover:plasmo-bg-primary/20 plasmo-text-primary plasmo-animate-pop"
                onClick={() => window.open(`https://www.moonpay.com/buy/${tokenSymbol.toLowerCase()}`, '_blank')}
              >
                <Plus className="plasmo-h-4 plasmo-w-4" />
                {t("token.buy")}
              </Button>
              <Button 
                className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-destructive/10 hover:plasmo-bg-destructive/20 plasmo-text-destructive plasmo-animate-pop"
                onClick={() => {
                  // For sell, we'll use swap with SOL as default receive token if on SOL network
                  if (network === "solana") {
                    // This would need to navigate to swap page with token pre-selected
                    // For now, we can't navigate from here without router hooks
                    // We'll implement this when we add proper routing
                    window.open(`https://www.moonpay.com/sell/${tokenSymbol.toLowerCase()}`, '_blank');
                  } else {
                    // For other networks, use a generic sell approach
                    window.open(`https://www.moonpay.com/sell/${tokenSymbol.toLowerCase()}`, '_blank');
                  }
                }}
              >
                <Minus className="plasmo-h-4 plasmo-w-4" />
                {t("token.sell")}
              </Button>
              <Button 
                className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-animate-pop"
                onClick={() => {
                  // This would trigger the send modal with this token pre-selected
                  // For now we'll just log that the send action was initiated
                  console.log("Initiating send for token:", token.content.metadata.symbol, 
                    "Balance:", token.token_info.balance, 
                    "Decimals:", token.token_info.decimals);
                  // In a real implementation, this would communicate with the parent component
                  // to open the send modal with this token pre-filled
                  alert(`Sending ${token.content.metadata.symbol} - ${formatTokenAmount(token.token_info.balance, token.token_info.decimals)}`);
                }}
              >
                <Maximize2 className="plasmo-h-4 plasmo-w-4" />
                {t("token.send")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}