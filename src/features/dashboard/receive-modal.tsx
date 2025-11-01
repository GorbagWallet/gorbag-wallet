"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useWallet } from "~/lib/wallet-context"

interface ReceiveModalProps {
  open: boolean
  onClose: () => void
}

export function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { activeWallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!open || !activeWallet) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-from-bottom-0">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
          <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">Receive Tokens</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
            <X className="plasmo-h-5 plasmo-w-5" />
          </Button>
        </div>

        <div className="plasmo-space-y-4">
          <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-8 plasmo-flex plasmo-items-center plasmo-justify-center">
            <div className="plasmo-w-48 plasmo-h-48 plasmo-bg-background plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-justify-center">
              <span className="plasmo-text-muted-foreground">QR Code</span>
            </div>
          </div>

          <div>
            <p className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2">Your Address</p>
            <div className="plasmo-flex plasmo-gap-2">
              <div className="plasmo-flex-1 plasmo-bg-background plasmo-rounded-xl plasmo-p-3 plasmo-font-mono plasmo-text-sm plasmo-text-foreground plasmo-break-all">
                {activeWallet?.address}
              </div>
              <Button
                onClick={copyAddress}
                variant="outline"
                size="icon"
                className="plasmo-rounded-xl plasmo-flex-shrink-0 plasmo-bg-transparent"
              >
                {copied ? <Check className="plasmo-h-4 plasmo-w-4 plasmo-text-green-500" /> : <Copy className="plasmo-h-4 plasmo-w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={onClose} className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
