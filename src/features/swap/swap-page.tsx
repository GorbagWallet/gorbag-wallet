"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, ArrowDown, Maximize2, Minus, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useWallet } from "~/lib/wallet-context"

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
  const { activeWallet, tokens, balance, network } = useWallet()
  const [fromToken, setFromToken] = useState("GOR")
  const [toToken, setToToken] = useState("SOL")
  const [fromAmount, setFromAmount] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [priorityFee, setPriorityFee] = useState(false)
  const [slippageOpen, setSlippageOpen] = useState(false)
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)

  // Check network when component mounts
  useEffect(() => {
    if (network === "gorbagana") {
      setShowNetworkWarning(true)
    }
  }, [network])

  const handleSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("") // Clear the amount when switching
  }

  const handlePercentage = (percent: number) => {
    // Calculate the max amount based on the selected token balance
    const selectedToken = tokens.find(token => 
      token.content.metadata.symbol === fromToken
    )
    
    if (selectedToken) {
      const maxAmount = selectedToken.token_info.balance / (10 ** selectedToken.token_info.decimals)
      setFromAmount(((maxAmount * percent) / 100).toFixed(6))
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

  // Calculate toAmount based on fromAmount (placeholder calculation)
  const toAmount = fromAmount ? (parseFloat(fromAmount) * 0.95).toFixed(6) : ""

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl">
          <ArrowLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">Swap</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)}
          className="plasmo-rounded-xl"
        >
          <Settings className="plasmo-h-5 plasmo-w-5" />
        </Button>
      </header>

      {showSettings && (
        <div className="plasmo-mx-4 plasmo-mt-4 plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-space-y-4">
          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">
              Slippage Tolerance
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
                value={slippage}
                onChange={(e) => setSlippage(Number.parseFloat(e.target.value))}
                className="plasmo-h-10 plasmo-rounded-lg plasmo-pl-8"
              />
            </div>
            <div className="plasmo-flex plasmo-gap-2 plasmo-mt-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlippage(value)}
                  className="plasmo-flex-1"
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">Priority Fee</Label>
            <Switch checked={priorityFee} onCheckedChange={setPriorityFee} />
          </div>
        </div>
      )}

      {/* Network Warning Drawer - Full page overlay */}
      {showNetworkWarning && (
        <>
          <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-black/50 plasmo-z-40 plasmo-transition-opacity" />
          <div className="plasmo-fixed plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-bg-background plasmo-rounded-t-2xl plasmo-z-50 plasmo-max-w-md plasmo-mx-auto plasmo-shadow-lg plasmo-animate-in plasmo-slide-in-from-bottom-5">
            <div className="plasmo-p-4 plasmo-border-b plasmo-border-border plasmo-flex plasmo-items-center plasmo-justify-between">
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">Network Notice</h2>
            </div>

            <div className="plasmo-p-6 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-text-center">
              <div className="plasmo-w-12 plasmo-h-12 plasmo-bg-primary/10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
                <img src={infoIcon} className="plasmo-h-6 plasmo-w-6 plasmo-text-primary" alt="Info" />
              </div>
              <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
                Swapping Not Available
              </h3>
              <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">
                Swapping is not yet available on the Gorbagana network. Please switch to the Solana network to use swap features.
              </p>
              <Button
                onClick={() => onBack()}
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium"
              >
                Go Back Home
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
                <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">From</Label>
                <span className="plasmo-text-xs plasmo-text-muted-foreground">
                  Balance: {getTokenBalance(fromToken)}
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
                    >
                      25%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePercentage(50)} 
                      className="plasmo-text-xs plasmo-h-8 plasmo-flex-1"
                    >
                      50%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePercentage(100)} 
                      className="plasmo-text-xs plasmo-h-8 plasmo-flex-1"
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="plasmo-flex plasmo-gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="plasmo-h-14 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1 plasmo-text-lg plasmo-font-medium"
                    />
                    <Button 
                      variant="outline" 
                      className="plasmo-h-14 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent plasmo-flex plasmo-items-center plasmo-gap-2"
                      onClick={() => setFromToken(fromToken === "GOR" ? "SOL" : "GOR")}
                    >
                      <img 
                        src={getTokenIcon(fromToken)} 
                        alt={fromToken} 
                        className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full" 
                      />
                      <span>{fromToken}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="plasmo-flex plasmo-justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwitch}
                className="plasmo-rounded-full plasmo-h-10 plasmo-w-10 plasmo-bg-transparent plasmo-border plasmo-border-muted-foreground"
              >
                <ArrowDown className="plasmo-h-4 plasmo-w-4" />
              </Button>
            </div>

            <div>
              <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
                <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">To</Label>
                <span className="plasmo-text-xs plasmo-text-muted-foreground">Price</span>
              </div>
              <div className="plasmo-flex plasmo-gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="plasmo-h-14 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1 plasmo-text-lg plasmo-font-medium"
                />
                <Button 
                  variant="outline" 
                  className="plasmo-h-14 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent plasmo-flex plasmo-items-center plasmo-gap-2"
                  onClick={() => setToToken(toToken === "SOL" ? "GOR" : "SOL")}
                >
                  <img 
                    src={getTokenIcon(toToken)} 
                    alt={toToken} 
                    className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full" 
                  />
                  <span>{toToken}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-text-sm plasmo-text-muted-foreground">
            <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
              <span>Rate</span>
              <span>1 {fromToken} = 0.95 {toToken}</span>
            </div>
            <div className="plasmo-flex plasmo-justify-between plasmo-mb-2">
              <span>Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
            <div className="plasmo-flex plasmo-justify-between">
              <span>Network Fee</span>
              <span>0.000005 {fromToken}</span>
            </div>
          </div>

          <Button className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-text-lg">
            <Maximize2 className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
            Swap
          </Button>
        </div>
      )}
    </div>
  )
}
