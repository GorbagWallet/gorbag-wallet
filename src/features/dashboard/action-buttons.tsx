"use client"

import { Button } from "~/components/ui/button"
import { useState } from "react"
import { useWallet } from "~/lib/wallet-context"
import sendIcon from "data-base64:~assets/icons/icons8-telegram-app-24.png"
import receiveIcon from "data-base64:~assets/icons/icons8-down-left-arrow-24.png"
import swapIcon from "data-base64:~assets/icons/icons8-thunder-24.png"
import infoIcon from "data-base64:~assets/icons/icons8-info-24.png"
import { useI18n } from "~/i18n/context"

interface ActionButtonsProps {
  onAction: (action: "send" | "receive" | "swap") => void
}

export function ActionButtons({ onAction }: ActionButtonsProps) {
  const { t } = useI18n()
  const { network } = useWallet()
  const [animatingButton, setAnimatingButton] = useState<string | null>(null)
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)

  const handleClick = (action: "send" | "receive" | "swap") => {
    if (action === "swap" && network === "gorbagana") {
      // Show the network warning instead of navigating
      setShowNetworkWarning(true)
      return
    }

    setAnimatingButton(action)
    setTimeout(() => setAnimatingButton(null), 300)
    onAction(action)
  }

  return (
    <>
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
                <img src={infoIcon} className="plasmo-h-6 plasmo-w-6 plasmo-text-primary" alt="Info" />
              </div>
              <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
                {t("swap.swappingNotAvailable")}
              </h3>
              <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">
                {t("swap.swapNetworkNotice")}
              </p>
              <Button
                onClick={() => setShowNetworkWarning(false)}
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-animate-pop">
                {t("common.goBackHome")}
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="plasmo-flex plasmo-gap-3 plasmo-mb-8">
        <Button
          onClick={() => handleClick("send")}
          className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-transition-transform ${
            animatingButton === "send" ? "animate-pop" : ""
          }`}>
          <img src={sendIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Send" />
          {t("common.send")}
        </Button>
        <Button
          onClick={() => handleClick("receive")}
          variant="secondary"
          className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
            animatingButton === "receive" ? "animate-pop" : ""
          }`}>
          <img src={receiveIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Receive" />
          {t("common.receive")}
        </Button>
        <Button
          onClick={() => handleClick("swap")}
          variant="secondary"
          className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
            animatingButton === "swap" ? "animate-pop" : ""
          }`}>
          <img src={swapIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Swap" />
          {t("common.swap")}
        </Button>
      </div>
    </>
  )
}
