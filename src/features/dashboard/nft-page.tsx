"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useI18n } from "~/i18n/context"

export default function NFTPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-pb-24">
      <header className="plasmo-absolute plasmo-top-0 plasmo-left-0 plasmo-right-0 plasmo-flex plasmo-items-center plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border plasmo-max-w-md plasmo-mx-auto">
        <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl">
          <ChevronLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground plasmo-flex-1 plasmo-text-center">{t("nft.title")}</h1>
        <div className="plasmo-w-10" />
      </header>

      <div className="plasmo-text-center">
        <div className="plasmo-text-6xl plasmo-mb-4">🎨</div>
        <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">{t("nft.comingSoon")}</h2>
        <p className="plasmo-text-muted-foreground">{t("nft.description")}</p>
      </div>
    </div>
  )
}
