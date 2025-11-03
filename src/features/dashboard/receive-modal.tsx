"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { useWallet } from "~/lib/wallet-context"
import QRCode from "qrcode"
import closeIcon from "data-base64:~assets/icons/icons8-close-24.png"
import successIcon from "data-base64:~assets/icons/icons8-success-24.png"
import copyIcon from "data-base64:~assets/icons/icons8-copy-24.png"
import gorLogo from "data-base64:~assets/token-icons/gor.jpg"
import solLogo from "data-base64:~assets/token-icons/sol.png"
import { useI18n } from "~/i18n/context"

interface ReceiveModalProps {
  open: boolean
  onClose: () => void
}

export function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { t } = useI18n()
  const { activeWallet, network } = useWallet()
  const [copied, setCopied] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const copyAddress = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (activeWallet) {
      // Generate QR code data URL
      QRCode.toDataURL(activeWallet.address, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(error => {
        console.error("Error generating QR code:", error);
      });
    }
  }, [activeWallet]);

  if (!open || !activeWallet) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-bottom-0">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
          <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">{t("receive.title")}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
            <img src={closeIcon} className="plasmo-h-5 plasmo-w-5" alt="Close" />
          </Button>
        </div>

        <div className="plasmo-space-y-4">
          <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-8 plasmo-flex plasmo-items-center plasmo-justify-center">
            <div className="plasmo-relative">
              {qrCodeDataUrl ? (
                <div className="plasmo-relative">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="plasmo-w-48 plasmo-h-48 plasmo-bg-background plasmo-rounded-lg"
                  />
                  {/* Network logo in the center of QR code */}
                  <div className="plasmo-absolute plasmo-top-1/2 plasmo-left-1/2 plasmo-transform plasmo--translate-x-1/2 plasmo--translate-y-1/2 plasmo-bg-white plasmo-rounded-full plasmo-p-2 plasmo-border plasmo-border-gray-200">
                    <img 
                      src={network === "gorbagana" ? gorLogo : solLogo} 
                      alt={network === "gorbagana" ? "GOR" : "SOL"} 
                      className="plasmo-w-8 plasmo-h-8 plasmo-rounded-full plasmo-object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="plasmo-w-48 plasmo-h-48 plasmo-bg-background plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-justify-center">
                  <span className="plasmo-text-muted-foreground">{t("receive.generatingQR")}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2">{t("receive.yourAddress")}</p>
            <div className="plasmo-bg-background plasmo-rounded-xl plasmo-p-4 plasmo-font-mono plasmo-text-sm plasmo-text-foreground plasmo-overflow-x-auto plasmo-whitespace-nowrap plasmo-text-ellipsis">
              {activeWallet?.address}
            </div>
          </div>

          <Button
            onClick={copyAddress}
            className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-flex plasmo-items-center plasmo-justify-center">
            {copied ? (
              <>
                <img src={successIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Copied" />
                {t("common.copied")}
              </>
            ) : (
              <>
                <img src={copyIcon} className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" alt="Copy" />
                {t("receive.copyAddress")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
