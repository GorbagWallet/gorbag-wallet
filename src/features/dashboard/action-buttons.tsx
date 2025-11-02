"use client"

import { Button } from "~/components/ui/button"
import { useState } from "react"
import sendIcon from "data-base64:~assets/icons/icons8-telegram-app-24.png"
import receiveIcon from "data-base64:~assets/icons/icons8-down-left-arrow-24.png"
import swapIcon from "data-base64:~assets/icons/icons8-thunder-24.png"

interface ActionButtonsProps {
  onAction: (action: "send" | "receive" | "swap") => void
}

export function ActionButtons({ onAction }: ActionButtonsProps) {
  const [animatingButton, setAnimatingButton] = useState<string | null>(null)

  const handleClick = (action: "send" | "receive" | "swap") => {
    setAnimatingButton(action)
    setTimeout(() => setAnimatingButton(null), 300)
    onAction(action)
  }

  return (
    <div className="plasmo-flex plasmo-gap-3 plasmo-mb-8">
      <Button
        onClick={() => handleClick("send")}
        className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "send" ? "animate-pop" : ""
        }`}
      >
        <img src={sendIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Send" />
        Send
      </Button>
      <Button
        onClick={() => handleClick("receive")}
        variant="secondary"
        className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "receive" ? "animate-pop" : ""
        }`}
      >
        <img src={receiveIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Receive" />
        Receive
      </Button>
      <Button
        onClick={() => handleClick("swap")}
        variant="secondary"
        className={`plasmo-flex-1 plasmo-h-12 plasmo-py-6 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "swap" ? "animate-pop" : ""
        }`}
      >
        <img src={swapIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Swap" />
        Swap
      </Button>
    </div>
  )
}
