import { Button } from "~/components/ui/button"
import { useI18n } from "~/i18n/context"
import homeIcon from "data-base64:~assets/icons/icons8-home-24.png"
import thunderIcon from "data-base64:~assets/icons/icons8-thunder-24.png"
import galleryIcon from "data-base64:~assets/icons/icons8-gallery-24.png"

export function BottomNav({ onNavigate, view }: { onNavigate: (view: string) => void, view: string }) {
  const { t } = useI18n()

  return (
    <div className="plasmo-absolute plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-flex plasmo-justify-center plasmo-pb-4 plasmo-bg-transparent">
      <div className="plasmo-w-11/12 plasmo-flex plasmo-items-center plasmo-justify-around plasmo-h-20 plasmo-rounded-2xl" style={{ backgroundColor: '#12140e' }}>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${view === "dashboard" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => onNavigate("dashboard")}
        >
          <img src={homeIcon} className="plasmo-h-5 plasmo-w-5" alt={t("wallet.dashboard")} />
        </Button>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${view === "swap" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => onNavigate("swap")}
        >
          <img src={thunderIcon} className="plasmo-h-5 plasmo-w-5" alt={t("wallet.swapTokens")} />
        </Button>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${view === "nft" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => onNavigate("nft")}
        >
          <img src={galleryIcon} className="plasmo-h-5 plasmo-w-5" alt={t("nft.title")} />
        </Button>
      </div>
    </div>
  )
}

