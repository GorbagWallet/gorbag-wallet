"use client"

import { useWallet, Network } from "~/lib/wallet-context"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"

export function NetworkSettings() {
  const { network, setNetwork } = useWallet()

  const handleNetworkChange = (newNetwork: Network) => {
    if (network !== newNetwork) {
      setNetwork(newNetwork)
    }
  }

  return (
    <div className="plasmo-space-y-4">
      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl">
        <Label htmlFor="gorbagana-network" className="plasmo-text-base plasmo-font-medium plasmo-text-foreground">
          Gorbagana
        </Label>
        <Switch
          id="gorbagana-network"
          checked={network === "gorbagana"}
          onCheckedChange={() => handleNetworkChange("gorbagana")}
        />
      </div>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl">
        <Label htmlFor="solana-network" className="plasmo-text-base plasmo-font-medium plasmo-text-foreground">
          Solana
        </Label>
        <Switch
          id="solana-network"
          checked={network === "solana"}
          onCheckedChange={() => handleNetworkChange("solana")}
        />
      </div>
    </div>
  )
}
