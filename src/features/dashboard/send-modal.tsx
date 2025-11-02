"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { validateWalletAddress } from "~/lib/utils/wallet-utils"
import successIcon from "data-base64:~assets/icons/icons8-success-24.png"
import cancelIcon from "data-base64:~assets/icons/icons8-cancel-24.png"
import closeIcon from "data-base64:~assets/icons/icons8-close-24.png"
import continueIcon from "data-base64:~assets/icons/icons8-telegram-app-24.png"
import validIcon from "data-base64:~assets/icons/icons8-success-24.png"  // Using success icon for valid status
import invalidIcon from "data-base64:~assets/icons/icons8-cancel-24.png" // Using cancel icon for invalid status

interface SendModalProps {
  open: boolean
  onClose: () => void
}

type SendStep = "input" | "sending" | "success" | "failed"

export function SendModal({ open, onClose }: SendModalProps) {
  const [step, setStep] = useState<SendStep>("input")
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [addressValid, setAddressValid] = useState<boolean | null>(null)
  const [isCheckingAddress, setIsCheckingAddress] = useState(false)
  const [useDollar, setUseDollar] = useState(false)

  const handleAddressChange = async (value: string) => {
    setAddress(value)
    if (value.trim()) {
      setIsCheckingAddress(true)
      // Simulate address validation
      await new Promise((resolve) => setTimeout(resolve, 800))
      setAddressValid(validateWalletAddress(value))
      setIsCheckingAddress(false)
    } else {
      setAddressValid(null)
    }
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
  }

  const handlePercentage = (percent: number) => {
    const maxAmount = 589.28 // Mock max amount
    setAmount(((maxAmount * percent) / 100).toFixed(2))
  }

  const handleSend = async () => {
    setStep("sending")
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setStep("success")
  }

  if (!open) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-from-bottom-0">
        {step === "input" && (
          <>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
              <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">Send Tokens</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
                <img src={closeIcon} className="plasmo-h-5 plasmo-w-5" alt="Close" />
              </Button>
            </div>

            <div className="plasmo-space-y-4">
              <div>
                <Label htmlFor="recipient" className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                  Recipient Address
                </Label>
                <div className="plasmo-relative">
                  <Input
                    id="recipient"
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-pr-10"
                  />
                  {isCheckingAddress && (
                    <Loader2 className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-animate-spin plasmo-text-muted-foreground" />
                  )}
                  {addressValid === true && (
                    <img src={validIcon} className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-text-green-500" alt="Valid" />
                  )}
                  {addressValid === false && (
                    <img src={invalidIcon} className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-text-destructive" alt="Invalid" />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                  Amount
                </Label>
                <div className="plasmo-flex plasmo-gap-2 plasmo-mb-2">
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(20)} className="plasmo-text-xs plasmo-h-8">
                    20%
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(50)} className="plasmo-text-xs plasmo-h-8">
                    50%
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(100)} className="plasmo-text-xs plasmo-h-8">
                    MAX
                  </Button>
                </div>
                <div className="plasmo-relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseDollar(!useDollar)}
                    className="plasmo-absolute plasmo-right-2 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-text-primary hover:plasmo-text-primary/80 plasmo-text-xs"
                  >
                    {useDollar ? "$" : "GOR"}
                  </Button>
                </div>
                <p className="plasmo-text-xs plasmo-text-muted-foreground plasmo-mt-2">Available: 589.28K GOR</p>
              </div>

              <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-4">
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm plasmo-mb-2">
                  <span className="plasmo-text-muted-foreground">Network Fee</span>
                  <span className="plasmo-text-card-foreground plasmo-font-medium">~0.000005 SOL</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">Total</span>
                  <span className="plasmo-text-card-foreground plasmo-font-semibold">{amount || "0.00"} GOR</span>
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={!address || !amount || addressValid !== true}
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium"
              >
                Continue
                <img src={continueIcon} className="plasmo-h-4 plasmo-w-4 plasmo-ml-2" alt="Continue" />
              </Button>
            </div>
          </>
        )}

        {step === "sending" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <Loader2 className="plasmo-h-12 plasmo-w-12 plasmo-animate-spin plasmo-text-primary plasmo-mb-4" />
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">Sending Transaction</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground">Please wait...</p>
          </div>
        )}

        {step === "success" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-green-500/20 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
              <img src={successIcon} className="plasmo-h-6 plasmo-w-6" alt="Success" />
            </div>
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">Transaction Sent!</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">Your tokens are on their way</p>
            <Button onClick={onClose} className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl">
              Done
            </Button>
          </div>
        )}

        {step === "failed" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-destructive/20 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
              <img src={cancelIcon} className="plasmo-h-6 plasmo-w-6" alt="Cancel" />
            </div>
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">Transaction Failed</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">Something went wrong</p>
            <Button onClick={() => setStep("input")} variant="outline" className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-mb-2">
              Try Again
            </Button>
            <Button onClick={onClose} variant="ghost" className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
