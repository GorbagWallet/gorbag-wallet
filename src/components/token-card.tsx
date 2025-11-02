import { ChevronRight } from "lucide-react"

interface TokenCardProps {
  symbol: string
  name: string
  amount: string
  value: string
  change?: string
  positive?: boolean
  icon: string
}

export function TokenCard({ symbol, name, amount, value, change, positive, icon }: TokenCardProps) {
  return (
    <button className="plasmo-w-full plasmo-bg-card hover:plasmo-bg-card/80 plasmo-rounded-2xl plasmo-p-4 plasmo-transition-colors plasmo-group">
      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-w-full">
        <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
          <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-primary/10 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-text-2xl plasmo-flex-shrink-0">
            <img src={icon} alt={name} className="plasmo-w-8 plasmo-h-8 plasmo-rounded-full" />
          </div>
          <div className="plasmo-text-left">
            <p className="plasmo-font-semibold plasmo-text-card-foreground">{symbol}</p>
            <p className="plasmo-text-sm plasmo-text-muted-foreground">{name}</p>
          </div>
        </div>

        <div className="plasmo-text-right">
          <p className="plasmo-font-semibold plasmo-text-card-foreground">{value}</p>
          <p className="plasmo-text-sm plasmo-text-muted-foreground">{amount}</p>
          {change !== undefined && positive !== undefined && (
            <p className={`plasmo-text-xs plasmo-font-medium ${positive ? "plasmo-text-primary" : "plasmo-text-destructive"}`}>{change}</p>
          )}
        </div>
      </div>
    </button>
  )
}
