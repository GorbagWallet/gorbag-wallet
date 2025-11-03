import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { importWallet } from "~/lib/utils/wallet-utils";
import { Keypair } from "@solana/web3.js";
import { useI18n } from "~/i18n/context";

export interface ImportedWallet {
  seedPhrase: string[] | null;
  address: string;
  keypair: Keypair;
}

interface ImportKeyStepProps {
  onImport: (wallet: ImportedWallet) => void;
  onBack: () => void;
}

export function ImportKeyStep({ onImport, onBack }: ImportKeyStepProps) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setAnimating] = useState(false);

  const handleImportClick = async () => {
    if (!input.trim()) return;

    setAnimating(true);
    setIsLoading(true);
    setError("");

    setTimeout(async () => {
      try {
        const importedWallet = await importWallet(input);
        onImport(importedWallet);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
        setAnimating(false);
      }
    }, 300);
  };

  return (
    <div className="plasmo-w-full">
      <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
        <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
        {t("onboarding.importKey.back")}
      </button>

      <div className="plasmo-mb-8">
        <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">{t("onboarding.importKey.title")}</h2>
        <p className="plasmo-text-muted-foreground plasmo-text-sm">
          {t("onboarding.importKey.description")}
        </p>
      </div>

      <div className="plasmo-space-y-4">
        <div>
          <Label htmlFor="key" className="plasmo-text-foreground plasmo-mb-2 plasmo-block">
            {t("onboarding.importKey.label")}
          </Label>
          <Textarea
            id="key"
            placeholder={t("onboarding.importKey.placeholder")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            className="plasmo-min-h-24 plasmo-resize-none"
          />
        </div>

        {error && (
          <div className="plasmo-flex plasmo-items-start plasmo-gap-2 plasmo-p-3 plasmo-bg-destructive/10 plasmo-rounded-lg">
            <AlertCircle className="plasmo-h-4 plasmo-w-4 plasmo-text-destructive plasmo-mt-0.5 plasmo-flex-shrink-0" />
            <p className="plasmo-text-sm plasmo-text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleImportClick}
          disabled={!input.trim() || isLoading}
          size="lg"
          className={`plasmo-w-full plasmo-h-12 ${
            isAnimating ? "animate-pop" : ""
          }`}>
          {isLoading ? (
            <Loader2 className="plasmo-h-6 plasmo-w-6 plasmo-animate-spin" />
          ) : (
            t("onboarding.importKey.importWallet")
          )}
        </Button>
      </div>
    </div>
  );
}