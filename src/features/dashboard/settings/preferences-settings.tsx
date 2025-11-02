"use client"

import { useWallet } from "~/lib/wallet-context"
import { useState } from "react"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export function PreferencesSettings() {
  const { preferredCurrency, setPreferredCurrency } = useWallet()
  const [language, setLanguage] = useState("english")

  return (
    <div className="plasmo-space-y-6">
      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">Preferred Currency</Label>
        <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
          <SelectTrigger className="plasmo-h-12 plasmo-rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">USD - United States Dollar</SelectItem>
            <SelectItem value="gbp">GBP - British Pound</SelectItem>
            <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
            <SelectItem value="eur">EUR - Euro</SelectItem>
            <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">Display Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="plasmo-h-12 plasmo-rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="french">Français (French)</SelectItem>
            <SelectItem value="spanish">Español (Spanish)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
