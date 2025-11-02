"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { PreferencesSettings } from "./preferences-settings"
import { SecuritySettings } from "./security-settings"
import { NetworkSettings } from "./network-settings"

type SettingsView = "main" | "preferences" | "security" | "networks"

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<SettingsView>("main")

  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (view === "main" ? onBack() : setView("main"))}
          className="plasmo-rounded-xl"
        >
          <ChevronLeft className="plasmo-h-5 plasmo-w-5" />
        </Button>
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">
          {view === "main" && "Settings"}
          {view === "preferences" && "Preferences"}
          {view === "security" && "Security"}
          {view === "networks" && "Active Networks"}
        </h1>
        <div className="plasmo-w-10" />
      </header>

      <div className="plasmo-px-4 plasmo-py-4">
        {view === "main" && (
          <div className="plasmo-space-y-2">
            <button
              onClick={() => setView("preferences")}
              className="plasmo-w-full plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl hover:plasmo-bg-card/80 plasmo-transition-colors"
            >
              <span className="plasmo-font-medium plasmo-text-foreground">Preferences</span>
              <ChevronRight className="plasmo-h-5 plasmo-w-5 plasmo-text-muted-foreground" />
            </button>
            <button
              onClick={() => setView("security")}
              className="plasmo-w-full plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl hover:plasmo-bg-card/80 plasmo-transition-colors"
            >
              <span className="plasmo-font-medium plasmo-text-foreground">Security</span>
              <ChevronRight className="plasmo-h-5 plasmo-w-5 plasmo-text-muted-foreground" />
            </button>
            <button
              onClick={() => setView("networks")}
              className="plasmo-w-full plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-4 plasmo-bg-card plasmo-rounded-xl hover:plasmo-bg-card/80 plasmo-transition-colors"
            >
              <span className="plasmo-font-medium plasmo-text-foreground">Active Networks</span>
              <ChevronRight className="plasmo-h-5 plasmo-w-5 plasmo-text-muted-foreground" />
            </button>
          </div>
        )}

        {view === "preferences" && <PreferencesSettings />}
        {view === "security" && <SecuritySettings />}
        {view === "networks" && <NetworkSettings />}
      </div>
    </div>
  )
}
