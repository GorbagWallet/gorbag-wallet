"use client"

import { Button } from "~/components/ui/button"
import { Wallet, Zap, ImageIcon } from "lucide-react"

export function BottomNav() {
  // const router = useRouter()
  // const pathname = usePathname()

  // const isActive = (path: string) => pathname === path

  return (
    <div className="plasmo-fixed plasmo-bottom-0 plasmo-left-0 plasmo-right-0 plasmo-max-w-md plasmo-mx-auto plasmo-bg-card plasmo-border-t plasmo-border-border plasmo-flex plasmo-items-center plasmo-justify-around plasmo-h-20">
      <Button
        // variant={isActive("/dashboard") ? "default" : "ghost"}
        size="icon"
        className="plasmo-rounded-xl"
        onClick={() => { /* router.push("/dashboard") */ }}
      >
        <Wallet className="plasmo-h-5 plasmo-w-5" />
      </Button>
      <Button
        // variant={isActive("/dashboard/swap") ? "default" : "ghost"}
        size="icon"
        className="plasmo-rounded-xl"
        onClick={() => { /* router.push("/dashboard/swap") */ }}
      >
        <Zap className="plasmo-h-5 plasmo-w-5" />
      </Button>
      <Button
        // variant={isActive("/dashboard/nft") ? "default" : "ghost"}
        size="icon"
        className="plasmo-rounded-xl"
        onClick={() => { /* router.push("/dashboard/nft") */ }}
      >
        <ImageIcon className="plasmo-h-5 plasmo-w-5" />
      </Button>
    </div>
  )
}
