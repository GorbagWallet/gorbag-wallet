"use client"

export default function SwapPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="plasmo-min-h-screen plasmo-bg-background plasmo-max-w-md plasmo-mx-auto plasmo-pb-24">
      <header className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-4 plasmo-py-4 plasmo-border-b plasmo-border-border">
        <h1 className="plasmo-text-lg plasmo-font-semibold plasmo-text-foreground">Swap</h1>
      </header>
      <div className="plasmo-px-4 plasmo-py-4">
        <p>Swap page content goes here.</p>
      </div>
    </div>
  )
}
