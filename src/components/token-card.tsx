import { ChevronRight } from "lucide-react"

interface TokenCardProps {
  symbol: string
  name: string
  amount: string
  value: string
  change: string
  positive: boolean
  icon: string
}

export function TokenCard({ symbol, name, amount, value, change, positive, icon }: TokenCardProps) {
  return (
    <button className="plasmo-w-full plasmo-bg-card hover:plasmo-bg-card/80 plasmo-rounded-xl plasmo-p-4 plasmo-transition-colors plasmo-group">
      <div className="plasmo-flex plasmo-items-center plasmo-gap-4">
        <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-primary/10 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-text-2xl plasmo-flex-shrink-0">
          {icon}
        </div>
        <div className="plasmo-flex-1 plasmo-text-left plasmo-min-w-0">
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1">
            <span className="plasmo-font-semibold plasmo-text-card-foreground">{symbol}</span>
            <span className="plasmo-text-xs plasmo-text-muted-foreground plasmo-truncate">{name}</span>
          </div>
          <p className="plasmo-text-sm plasmo-text-muted-foreground">{amount}</p>
        </div>
        <div className="plasmo-text-right plasmo-flex-shrink-0">
          <p className="plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{value}</p>
          <p className={`plasmo-text-xs plasmo-font-medium ${positive ? "plasmo-text-primary" : "plasmo-text-destructive"}`}>{change}</p>
        </div>
        <ChevronRight className="plasmo-h-5 plasmo-w-5 plasmo-text-muted-foreground plasmo-opacity-0 plasmo-group-hover:plasmo-opacity-100 plasmo-transition-opacity plasmo-flex-shrink-0" />
      </div>
    </button>
  )
}
