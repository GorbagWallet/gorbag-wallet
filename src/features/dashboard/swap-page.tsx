"use client"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ChevronLeft, ArrowLeftRight, Settings } from "lucide-react"
import { useState } from "react"
import { Switch } from "~/components/ui/switch"
import { useI18n } from "~/i18n/context"

export default function SwapPage() {
  const { t } = useI18n()
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

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button variant="ghost" size="icon" onClick={() => {}} className="plasmo-rounded-xl">
          <ChevronLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">{t("swap.title")}</h1>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="plasmo-rounded-xl">
          <Settings className="plasmo-h-5 plasmo-w-5" />
        </Button>
      </header>

      <div className="plasmo-px-4 plasmo-py-6">
        {showSettings && (
          <div className="plasmo-bg-card plasmo-rounded-xl plasmo-p-4 plasmo-mb-6 plasmo-space-y-4 plasmo-border plasmo-border-border">
            <div>
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">{t("swap.slippageTolerance", { slippage })}</Label>
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
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("swap.priorityFee")}</Label>
              <Switch checked={priorityFee} onCheckedChange={setPriorityFee} />
            </div>
          </div>
        )}

        <div className="plasmo-space-y-4">
          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">{t("swap.from")}</Label>
            <div className="plasmo-flex plasmo-gap-2 plasmo-mb-2">
              <Button variant="outline" size="sm" onClick={() => handlePercentage(25)} className="plasmo-text-xs plasmo-h-8">
                {t("swap.twentyFivePercent")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePercentage(50)} className="plasmo-text-xs plasmo-h-8">
                {t("send.fiftyPercent")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePercentage(100)} className="plasmo-text-xs plasmo-h-8">
                {t("common.max")}
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
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">{t("swap.to")}</Label>
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

          <Button className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-mt-6">
            {t("swap.swapButton")}
          </Button>
        </div>
      </div>
    </div>
  )
}
