import { Button } from "~/components/ui/button"
import icon from "data-base64:~assets/icon.png"
import { useState } from "react"

interface WelcomeProps {
  onSelectCreate: () => void
  onSelectImport: () => void
}

export function Welcome({ onSelectCreate, onSelectImport }: WelcomeProps) {
  const [isCreateAnimating, setCreateAnimating] = useState(false)
  const [isImportAnimating, setImportAnimating] = useState(false)

  const handleCreateClick = () => {
    setCreateAnimating(true)
    setTimeout(() => {
      setCreateAnimating(false)
      onSelectCreate()
    }, 300)
  }

  const handleImportClick = () => {
    setImportAnimating(true)
    setTimeout(() => {
      setImportAnimating(false)
      onSelectImport()
    }, 300)
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-screen plasmo-p-4">
      <div className="plasmo-w-full plasmo-max-w-md">
        <div className="plasmo-text-center plasmo-mb-8">
          <div className="plasmo-w-16 plasmo-h-16 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mx-auto plasmo-mb-4">
            <img src={icon} alt="Gorbag Logo" className="plasmo-w-16 plasmo-h-16 plasmo-rounded-xl" />
          </div>
          <h1 className="plasmo-text-3xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">
            Gorbag Wallet
          </h1>
          <p className="plasmo-text-muted-foreground">
            The Gorbagana Wallet 
          </p>
        </div>

        <div className="plasmo-space-y-3">
          <Button
            onClick={handleCreateClick}
            size="lg"
            className={`plasmo-w-full plasmo-h-12 plasmo-text-base ${
              isCreateAnimating ? "animate-pop" : ""
            }`}>
            Create New Wallet
          </Button>
          <Button
            onClick={handleImportClick}
            variant="outline"
            size="lg"
            className={`plasmo-w-full plasmo-h-12 plasmo-text-base plasmo-bg-transparent ${
              isImportAnimating ? "animate-pop" : ""
            }`}>
            Import Wallet
          </Button>
        </div>

        <p className="plasmo-text-xs plasmo-text-muted-foreground plasmo-text-center plasmo-mt-6">
          By using Gorbag, you agree to our{" "}
          <a
            href="https://gorbag.vercel.app/tos"
            target="_blank"
            rel="noopener noreferrer"
            className="plasmo-underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://gorbag.vercel.app/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="plasmo-underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
