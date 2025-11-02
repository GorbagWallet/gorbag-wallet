"use client"

import { useWallet } from "~/lib/wallet-context"
import { Button } from "~/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

interface HideTokenDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: Array<{
    id: string
    symbol: string
    name: string
    icon: string
  }>
}

export function HideTokenDrawer({ open, onOpenChange, tokens }: HideTokenDrawerProps) {
  const { isTokenHidden, toggleHiddenToken } = useWallet()
  const [animatingToken, setAnimatingToken] = useState<string | null>(null)

  const handleToggle = (tokenId: string) => {
    setAnimatingToken(tokenId)
    setTimeout(() => setAnimatingToken(null), 300)
    toggleHiddenToken(tokenId)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-black/50 plasmo-z-40 plasmo-transition-opacity" onClick={() => onOpenChange(false)} />

      {/* Drawer */}
      <div className="plasmo-fixed plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-bg-background plasmo-rounded-t-2xl plasmo-z-50 plasmo-max-w-md plasmo-mx-auto plasmo-shadow-lg plasmo-animate-in plasmo-slide-in-from-bottom-5">
        <div className="plasmo-p-4 plasmo-border-b plasmo-border-border plasmo-flex plasmo-items-center plasmo-justify-between">
          <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">Manage Tokens</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="plasmo-rounded-lg">
            <X className="plasmo-h-5 plasmo-w-5" />
          </Button>
        </div>

        <div className="plasmo-p-4 plasmo-space-y-2 plasmo-max-h-96 plasmo-overflow-y-auto">
          {tokens.map((token) => {
            const hidden = isTokenHidden(token.id)
            return (
              <button
                key={token.id}
                onClick={() => handleToggle(token.id)}
                className={`plasmo-w-full plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-3 plasmo-rounded-xl plasmo-transition-all ${
                  animatingToken === token.id ? "animate-pop" : ""
                } ${
                  hidden ? "plasmo-bg-muted/50 plasmo-opacity-60 hover:plasmo-bg-muted/70" : "plasmo-bg-card hover:plasmo-bg-card/80 plasmo-border plasmo-border-border"
                }`}
              >
                <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
                  <img src={token.icon} alt={token.name} className="plasmo-w-8 plasmo-h-8 plasmo-rounded-full" />
                  <div className="plasmo-text-left">
                    <p className="plasmo-font-medium plasmo-text-foreground">{token.symbol}</p>
                    <p className="plasmo-text-xs plasmo-text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                <div
                  className={`plasmo-w-5 plasmo-h-5 plasmo-rounded-full plasmo-border-2 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-transition-colors ${
                    hidden ? "plasmo-border-muted-foreground plasmo-bg-transparent" : "plasmo-border-primary plasmo-bg-primary"
                  }`}
                >
                  {!hidden && <div className="plasmo-w-2 plasmo-h-2 plasmo-bg-primary-foreground plasmo-rounded-full" />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="plasmo-p-4 plasmo-border-t plasmo-border-border">
          <Button
            onClick={() => onOpenChange(false)}
            className="plasmo-w-full plasmo-h-11 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  )
}
