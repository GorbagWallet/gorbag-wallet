import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Wallet, Zap, ImageIcon } from "lucide-react"

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("wallet")

  return (
    <div className="plasmo-absolute plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-flex plasmo-justify-center plasmo-pb-4 plasmo-bg-transparent">
      <div className="plasmo-w-11/12 plasmo-flex plasmo-items-center plasmo-justify-around plasmo-h-20 plasmo-rounded-2xl" style={{ backgroundColor: '#12140e' }}>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${activeTab === "wallet" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => setActiveTab("wallet")}
        >
          <Wallet className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${activeTab === "swap" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => setActiveTab("swap")}
        >
          <Zap className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <Button
          size="icon"
          className={`plasmo-bg-transparent hover:plasmo-bg-transparent plasmo-rounded-xl plasmo-transition-all plasmo-duration-300 ${activeTab === "nft" ? "-plasmo-translate-y-1 plasmo-text-accent" : "plasmo-text-accent/50"}`}
          onClick={() => setActiveTab("nft")}
        >
          <ImageIcon className="plasmo-h-5 plasmo-w-5" />
        </Button>
      </div>
    </div>
  )
}

