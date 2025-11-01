"use client"

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useState } from "react"

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
        className={`plasmo-flex-1 plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "send" ? "animate-pop" : ""
        }`}
      >
        <ArrowUpRight className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
        Send
      </Button>
      <Button
        onClick={() => handleClick("receive")}
        variant="secondary"
        className={`plasmo-flex-1 plasmo-h-12 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "receive" ? "animate-pop" : ""
        }`}
      >
        <ArrowDownLeft className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
        Receive
      </Button>
      <Button
        onClick={() => handleClick("swap")}
        variant="secondary"
        className={`plasmo-flex-1 plasmo-h-12 plasmo-rounded-xl plasmo-font-medium plasmo-transition-transform ${
          animatingButton === "swap" ? "animate-pop" : ""
        }`}
      >
        <ArrowLeftRight className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
        Swap
      </Button>
    </div>
  )
}
