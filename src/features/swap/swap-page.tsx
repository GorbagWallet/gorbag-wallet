"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, ArrowDown, Maximize2, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useWallet } from "~/lib/wallet-context"
import { useI18n } from "~/i18n/context"
import { useSwap } from "~/lib/use-swap"

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

interface SwapPageProps {
  onBack: () => void
}

export default function SwapPage({ onBack }: SwapPageProps) {
  const { t } = useI18n()
  const { activeWallet, tokens, balance, network } = useWallet()
  const [swapState, swapActions] = useSwap()
  const [showSettings, setShowSettings] = useState(false)
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)

  // Check network when component mounts
  useEffect(() => {
    if (network === "gorbagana") {
      setShowNetworkWarning(true)
    } else {
      setShowNetworkWarning(false)
    }
  }, [network])

  const handlePercentage = (percent: number) => {
    // Calculate the max amount based on the selected token balance
    const selectedToken = tokens.find(token => 
      token.content.metadata.symbol === swapState.fromToken
    )
    
    if (selectedToken) {
      const maxAmount = selectedToken.token_info.balance / (10 ** selectedToken.token_info.decimals)
      swapActions.setFromAmount(((maxAmount * percent) / 100).toFixed(6))
    }
  }

  // Get the token icon based on symbol
  const getTokenIcon = (symbol: string) => {
    return localTokenIcons[symbol.toUpperCase()] || solIcon
  }

  // Get the token balance based on symbol
  const getTokenBalance = (symbol: string) => {
    const token = tokens.find(t => t.content.metadata.symbol === symbol)
    if (token) {
      return (token.token_info.balance / (10 ** token.token_info.decimals)).toFixed(6)
    }
    return "0"
  }

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl plasmo-animate-pop">
          <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("swap.title")}</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)}
          className="plasmo-rounded-xl plasmo-animate-pop"
          disabled={showNetworkWarning}
        >
          <Settings className="plasmo-h-5 plasmo-w-5" />
        </Button>
      </header>

      {showSettings && (
        <div className="plasmo-mx-4 plasmo-mt-4 plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-space-y-4">
          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">
              {t("swap.slippage")}
            </Label>
            <div className="plasmo-relative">
              <div className="plasmo-absolute plasmo-left-3 plasmo-top-1/2 plasmo-transform plasmo--translate-y-1/2 plasmo-text-muted-foreground plasmo-text-sm">
                %
              </div>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={swapState.slippage}
                onChange={(e) => swapActions.setSlippage(Number.parseFloat(e.target.value))}
                className="plasmo-h-10 plasmo-rounded-lg plasmo-pl-8"
                disabled={showNetworkWarning}
              />
            </div>
            <div className="plasmo-flex plasmo-gap-2 plasmo-mt-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <Button
                  key={value}
                  variant={swapState.slippage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => swapActions.setSlippage(value)}
                  className="plasmo-flex-1"
                  disabled={showNetworkWarning}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("swap.priorityFee")}</Label>
            <Switch 
              checked={swapState.priorityFee} 
              onCheckedChange={swapActions.setPriorityFee} 
              disabled={showNetworkWarning}
            />
          </div>
        </div>
      )}

      {/* Network Warning Drawer - Full page overlay */}
      {showNetworkWarning && (
        <>
          <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-black/50 plasmo-z-40 plasmo-transition-opacity" />
          <div className="plasmo-fixed plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-bg-background plasmo-rounded-t-2xl plasmo-z-50 plasmo-max-w-md plasmo-mx-auto plasmo-shadow-lg plasmo-animate-in plasmo-slide-in-from-bottom-5">
            <div className="plasmo-p-4 plasmo-border-b plasmo-border-border plasmo-flex plasmo-items-center plasmo-justify-between">
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("swap.networkNotice")}</h2>
            </div>

            <div className="plasmo-p-6 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-text-center">
              <div className="plasmo-w-12 plasmo-h-12 plasmo-bg-primary/10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
                <img src={infoIcon} className="plasmo-h-6 plasmo-w-6 plasmo-text-primary" alt={t("common.settings")} />
              </div>
              <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
                {t("swap.swappingNotAvailable")}
              </h3>
              <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">
                {t("swap.swapNetworkNotice")}
              </p>
              <Button
                onClick={() => onBack()}
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-animate-pop"
              >
                {t("common.goBackHome")}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Show swap content only if not on Gorbagana network */}
      {network !== "gorbagana" && (
        <div className="plasmo-px-4 plasmo-py-4 plasmo-space-y-6">
          <div className="plasmo-space-y-4">
            <div>
              <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
                <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("swap.from")}</Label>
                <span className="plasmo-text-xs plasmo-text-muted-foreground">
                  Balance: {getTokenBalance(swapState.fromToken)}
                </span>
              </div>
              <div className="plasmo-flex plasmo-gap-2">
                <div className="plasmo-flex-1 plasmo-flex plasmo-flex-col">
                  <div className="plasmo-flex plasmo-gap-2 plasmo-mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePercentage(25)} 
                      className="plasmo-text-xs plasmo-h-8 plasmo-flex-1"
                      disabled={showNetworkWarning}
                    >
                      {t("swap.twentyFivePercent")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePercentage(50)} 
                      className="plasmo-text-xs plasmo-h-8 plasmo-flex-1"
                      disabled={showNetworkWarning}
                    >
                      {t("send.fiftyPercent")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePercentage(100)} 
                      className="plasmo-text-xs plasmo-h-8 plasmo-flex-1"
                      disabled={showNetworkWarning}
                    >
                      {t("common.max")}
                    </Button>
                  </div>
                  <div className="plasmo-flex plasmo-gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={swapState.fromAmount}
                      onChange={(e) => swapActions.setFromAmount(e.target.value)}
                      className="plasmo-h-14 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1 plasmo-text-lg plasmo-font-medium"
                      disabled={showNetworkWarning}
                    />
                    <Button 
                      variant="outline" 
                      className="plasmo-h-14 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent plasmo-flex plasmo-items-center plasmo-gap-2"
                      onClick={() => swapActions.setFromToken(swapState.fromToken === "GOR" ? "SOL" : "GOR")}
                      disabled={showNetworkWarning}
                    >
                      <img 
                        src={getTokenIcon(swapState.fromToken)} 
                        alt={swapState.fromToken} 
                        className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full" 
                      />
                      <span>{swapState.fromToken}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="plasmo-flex plasmo-justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapActions.switchTokens}
                className="plasmo-rounded-full plasmo-h-10 plasmo-w-10 plasmo-bg-transparent plasmo-border plasmo-border-muted-foreground"
                disabled={showNetworkWarning}
              >
                <ArrowDown className="plasmo-h-4 plasmo-w-4" />
              </Button>
            </div>

            <div>
              <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
                <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("swap.to")}</Label>
                <span className="plasmo-text-xs plasmo-text-muted-foreground">{t("swap.rate")}</span>
              </div>
              <div className="plasmo-flex plasmo-gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={swapState.toAmount}
                  readOnly
                  className="plasmo-h-14 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1 plasmo-text-lg plasmo-font-medium"
                />
                <Button 
                  variant="outline" 
                  className="plasmo-h-14 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent plasmo-flex plasmo-items-center plasmo-gap-2"
                  onClick={() => swapActions.setToToken(swapState.toToken === "SOL" ? "GOR" : "SOL")}
                  disabled={showNetworkWarning}
                >
                  <img 
                    src={getTokenIcon(swapState.toToken)} 
                    alt={swapState.toToken} 
                    className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full" 
                  />
                  <span>{swapState.toToken}</span>
                </Button>
              </div>
            </div>
          </div>

          {swapState.swapRoutes && (
            <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-text-sm plasmo-text-muted-foreground">
              <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
                <span>{t("swap.rate")}</span>
                <span>1 {swapState.fromToken} = {(parseFloat(swapState.toAmount) / parseFloat(swapState.fromAmount)).toFixed(6)} {swapState.toToken}</span>
              </div>
              <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
                <span>{t("swap.slippage")}</span>
                <span>{swapState.slippage}%</span>
              </div>
              <div className="plasmo-flex plasmo-justify-between">
                <span>{t("swap.networkFee")}</span>
                <span>~{swapState.swapRoutes.route.marketInfos[0]?.feeAmount || 0.000005} {swapState.fromToken}</span>
              </div>
            </div>
          )}

          {swapState.error && (
            <div className="plasmo-p-3 plasmo-bg-destructive/20 plasmo-rounded-lg plasmo-text-sm plasmo-text-destructive">
              {swapState.error}
            </div>
          )}

          <Button 
            className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-text-lg plasmo-animate-pop"
            onClick={swapActions.getQuote}
            disabled={showNetworkWarning || swapState.loading}
          >
            {swapState.loading ? (
              <>
                <Loader2 className="plasmo-h-4 plasmo-w-4 plasmo-mr-2 plasmo-animate-spin" />
                {t("swap.loading")}
              </>
            ) : (
              <>
                <Maximize2 className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
                {t("swap.swapButton")}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
