"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import closeIcon from "data-base64:~assets/icons/icons8-close-24.png"
import settingsIcon from "data-base64:~assets/icons/icons8-settings-24.png"
import swapIcon from "data-base64:~assets/icons/icons8-thunder-24.png"
import transferIcon from "data-base64:~assets/icons/icons8-data-transfer-24.png"
import { useI18n } from "~/i18n/context"

interface SwapModalProps {
  open: boolean
  onClose: () => void
}

export function SwapModal({ open, onClose }: SwapModalProps) {
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

  if (!open) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-from-bottom-0">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
          <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">{t("swap.title")}</h2>
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="plasmo-rounded-xl">
              <img src={settingsIcon} className="plasmo-h-5 plasmo-w-5" alt={t("common.settings")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
              <img src={closeIcon} className="plasmo-h-5 plasmo-w-5" alt={t("common.close")} />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-4 plasmo-mb-6 plasmo-space-y-4">
            <div>
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                {t("swap.slippageTolerance", { slippage })}
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
              <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground">{t("swap.priorityFee")}</Label>
              <Switch checked={priorityFee} onCheckedChange={setPriorityFee} />
            </div>
          </div>
        )}

        <div className="plasmo-space-y-4">
          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">{t("swap.from")}</Label>
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
              <img src={transferIcon} className="plasmo-h-4 plasmo-w-4" alt={t("common.swap")} />
            </Button>
          </div>

          <div>
            <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">{t("swap.to")}</Label>
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
            <img src={swapIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt={t("common.swap")} />
            {t("swap.swapButton")}
          </Button>
        </div>
      </div>
    </div>
  )
}
