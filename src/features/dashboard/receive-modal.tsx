"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useWallet } from "~/lib/wallet-context"
import closeIcon from "data-base64:~assets/icons/icons8-close-24.png"
import successIcon from "data-base64:~assets/icons/icons8-success-24.png"
import copyIcon from "data-base64:~assets/icons/icons8-copy-24.png"

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
            <img src={closeIcon} className="plasmo-h-5 plasmo-w-5" alt="Close" />
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
                {copied ? <img src={successIcon} className="plasmo-h-4 plasmo-w-4 plasmo-text-green-500" alt="Copied" /> : <img src={copyIcon} className="plasmo-h-4 plasmo-w-4" alt="Copy" />}
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
