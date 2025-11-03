"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useWallet } from "~/lib/wallet-context"

interface ActivityItem {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmations: number | null;
  transaction: any;
  fee: number | undefined;
  status: string;
  type?: "sent" | "received" | "unknown";
  token?: string;
  amount?: string;
  address?: string;
  timestamp?: string;
  tokenMint?: string;
  decimals?: number;
}

export default function ActivityPage({ onBack }: { onBack: () => void }) {
  const { getTransactionHistory, network, activeWallet } = useWallet();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const history = await getTransactionHistory();
        
        if (history.length === 0) {
          setActivities([]);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Process raw transaction data into activity format using the parsing function
        const solanaModule = await import("~/lib/solana");
        const parsedActivities = await Promise.all(
          history.map(async (tx: any) => {
            const parsedInfo = solanaModule.parseTransactionForActivity(
              tx.transaction, 
              activeWallet?.address || "", 
              network
            );
            
            const timestamp = tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : "Unknown";
            
            return {
              ...tx,
              type: parsedInfo.type,
              token: parsedInfo.tokenSymbol,
              amount: parsedInfo.amount,
              address: parsedInfo.counterparty ? `${parsedInfo.counterparty.slice(0, 4)}...${parsedInfo.counterparty.slice(-4)}` : "Unknown",
              timestamp,
              status: tx.status
            };
          })
        );

        setActivities(parsedActivities);
        setError(null);
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError("Failed to load transaction history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getTransactionHistory, network, activeWallet]);

  const filtered = activities.filter((a) => filter === "all" || a.type === filter);

  // Function to get explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const explorerBase = network === "gorbagana" 
      ? "https://trashscan.io/tx/" 
      : "https://solscan.io/tx/";
    return `${explorerBase}${signature}`;
  };

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
        {loading ? (
          <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-h-40">
            <p className="plasmo-text-muted-foreground">Loading transaction history...</p>
          </div>
        ) : error ? (
          <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-h-40">
            <p className="plasmo-text-destructive">{error}</p>
          </div>
        ) : (
          <>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="plasmo-w-full">
              <TabsList className="plasmo-grid plasmo-w-full plasmo-grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
              <TabsContent value={filter} className="plasmo-space-y-3 plasmo-mt-4">
                {filtered.length === 0 ? (
                  <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-h-40 plasmo-text-muted-foreground">
                    No transaction history found
                  </div>
                ) : (
                  filtered.map((activity) => (
                    <a 
                      key={activity.signature} 
                      href={getExplorerUrl(activity.signature)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="plasmo-no-underline"
                    >
                      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl hover:plasmo-bg-accent plasmo-transition-colors">
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
                          <ExternalLink className="plasmo-ml-2 plasmo-h-3 plasmo-w-3 plasmo-text-muted-foreground" />
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
