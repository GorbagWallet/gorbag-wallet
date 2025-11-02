"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

const activities = [
  {
    id: 1,
    type: "sent",
    token: "GOR",
    amount: "100.00",
    address: "0x742d...8f2a",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "received",
    token: "SOL",
    amount: "5.50",
    address: "0x1234...5678",
    timestamp: "5 hours ago",
    status: "completed",
  },
  {
    id: 3,
    type: "sent",
    token: "USDC",
    amount: "1000.00",
    address: "0xabcd...ef01",
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: 4,
    type: "received",
    token: "GOR",
    amount: "250.00",
    address: "0x5678...9abc",
    timestamp: "2 days ago",
    status: "completed",
  },
]

export default function ActivityPage({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all")

  const filtered = activities.filter((a) => filter === "all" || a.type === filter)

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="plasmo-rounded-xl">
          <ChevronLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">Recent Activity</h1>
        <div className="plasmo-w-10" />
      </header>

      <div className="plasmo-px-4 plasmo-py-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="plasmo-w-full">
          <TabsList className="plasmo-grid plasmo-w-full plasmo-grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="plasmo-space-y-3 plasmo-mt-4">
            {filtered.map((activity) => (
              <div key={activity.id} className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl">
                <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
                  <div
                    className={`plasmo-w-10 plasmo-h-10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center ${
                      activity.type === "sent" ? "plasmo-bg-destructive/20" : "plasmo-bg-green-500/20"
                    }`}
                  >
                    {activity.type === "sent" ? (
                      <ArrowUpRight className={`plasmo-h-5 plasmo-w-5 plasmo-text-destructive`} />
                    ) : (
                      <ArrowDownLeft className="plasmo-h-5 plasmo-w-5 plasmo-text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="plasmo-font-semibold plasmo-text-foreground plasmo-capitalize">
                      {activity.type} {activity.token}
                    </p>
                    <p className="plasmo-text-xs plasmo-text-muted-foreground">{activity.address}</p>
                  </div>
                </div>
                <div className="plasmo-text-right">
                  <p className={`plasmo-font-semibold ${activity.type === "sent" ? "plasmo-text-destructive" : "plasmo-text-green-500"}`}>
                    {activity.type === "sent" ? "-" : "+"}
                    {activity.amount}
                  </p>
                  <p className="plasmo-text-xs plasmo-text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
