"use client"

import { useState } from "react"
import { X, ArrowLeftRight, Settings } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"

interface SwapModalProps {
  open: boolean
  onClose: () => void
}

export function SwapModal({ open, onClose }: SwapModalProps) {
  const [fromToken, setFromToken] = useState("GOR")
  const [toToken, setToToken] = useState("SOL")
  const [fromAmount, setFromAmount] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [priorityFee, setPriorityFee] = useState(false)

  const handleSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  const handlePercentage = (percent: number) => {
    const maxAmount = 589.28
    setFromAmount(((maxAmount * percent) / 100).toFixed(2))
  }

  if (!open) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-from-bottom-0">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
          <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">Swap Tokens</h2>
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="plasmo-rounded-xl">
              <Settings className="plasmo-h-5 plasmo-w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
              <X className="plasmo-h-5 plasmo-w-5" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-4 plasmo-mb-6 plasmo-space-y-4">
            <div>
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                Slippage Tolerance: {slippage}%
              </Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(Number.parseFloat(e.target.value))}
                className="plasmo-h-10 plasmo-rounded-lg"
              />
            </div>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground">Priority Fee</Label>
              <Switch checked={priorityFee} onCheckedChange={setPriorityFee} />
            </div>
          </div>
        )}

        <div className="plasmo-space-y-4">
          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">From</Label>
            <div className="plasmo-flex plasmo-gap-2 plasmo-mb-2">
              <Button variant="outline" size="sm" onClick={() => handlePercentage(25)} className="plasmo-text-xs plasmo-h-8">
                25%
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePercentage(50)} className="plasmo-text-xs plasmo-h-8">
                50%
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePercentage(100)} className="plasmo-text-xs plasmo-h-8">
                Max
              </Button>
            </div>
            <div className="plasmo-flex plasmo-gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1"
              />
              <Button variant="outline" className="plasmo-h-12 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent">
                {fromToken}
              </Button>
            </div>
          </div>

          <div className="plasmo-flex plasmo-justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwitch}
              className="plasmo-rounded-full plasmo-h-10 plasmo-w-10 plasmo-bg-transparent"
            >
              <ArrowLeftRight className="plasmo-h-4 plasmo-w-4" />
            </Button>
          </div>

          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">To</Label>
            <div className="plasmo-flex plasmo-gap-2">
              <Input
                type="number"
                placeholder="0.00"
                readOnly
                className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-flex-1"
              />
              <Button variant="outline" className="plasmo-h-12 plasmo-rounded-xl plasmo-px-4 plasmo-bg-transparent">
                {toToken}
              </Button>
            </div>
          </div>

          <Button className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium">
            Swap
          </Button>
        </div>
      </div>
    </div>
  )
}
