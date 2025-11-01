import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ChevronLeft, Copy, Download, Check, Eye, EyeOff } from "lucide-react";
import { generateSeedPhrase } from "~/lib/utils/wallet-utils";

interface SeedPhraseStepProps {
  onSeedGenerated: (phrase: string[]) => void;
  onBack: () => void;
}

export function SeedPhraseStep({ onSeedGenerated, onBack }: SeedPhraseStepProps) {
  const [copied, setCopied] = useState(false);
  const [phrase, setPhrase] = useState<string[]>([]);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const generated = generateSeedPhrase();
    setPhrase(generated);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phrase.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSeedPhrase = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 42);
    const content = phrase.join("\n");
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `gorbag-wallet-${mockAddress}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="plasmo-w-full">
      <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
        <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
        Back
      </button>

      <div className="plasmo-mb-8">
        <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">Your Seed Phrase</h2>
        <p className="plasmo-text-muted-foreground plasmo-text-sm">
          Save this phrase in a safe place. Never share it with anyone. You'll need it to recover your wallet.
        </p>
      </div>

      <div className="plasmo-relative">
        <Button
          variant="ghost"
          size="icon"
          className="plasmo-absolute plasmo-top-2 plasmo-right-2 plasmo-z-10"
          onClick={() => setIsHidden(!isHidden)}>
          {isHidden ? <EyeOff className="plasmo-h-4 plasmo-w-4" /> : <Eye className="plasmo-h-4 plasmo-w-4" />}
        </Button>
        <Card className="plasmo-p-6 plasmo-mb-6 plasmo-bg-card/50 plasmo-border-primary/20">
          {isHidden && (
            <div className="plasmo-absolute plasmo-inset-0 plasmo-bg-card/80 plasmo-backdrop-blur-sm plasmo-flex plasmo-items-center plasmo-justify-center plasmo-rounded-lg">
              <p className="plasmo-text-muted-foreground">Click to reveal</p>
            </div>
          )}
          <div className={`plasmo-grid plasmo-grid-cols-3 plasmo-gap-3 ${ 
            isHidden ? "blur-sm" : "" 
          }`}>
            {phrase.map((word, index) => (
              <div key={index} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-background/50 plasmo-rounded-lg plasmo-p-3">
                <span className="plasmo-text-xs plasmo-text-muted-foreground plasmo-font-medium">{index + 1}</span>
                <span className="plasmo-text-sm plasmo-font-mono plasmo-text-foreground">{word}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="plasmo-flex plasmo-gap-3 plasmo-mb-6">
        <Button onClick={copyToClipboard} variant="outline" size="lg" className="plasmo-flex-1 plasmo-h-12 plasmo-bg-transparent">
          {copied ? (
            <>
              <Check className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
              Copy Phrase
            </>
          )}
        </Button>
        <Button onClick={downloadSeedPhrase} variant="outline" size="lg" className="plasmo-flex-1 plasmo-h-12 plasmo-bg-transparent">
          <Download className="plasmo-h-4 plasmo-w-4 plasmo-mr-2" />
          Download as File
        </Button>
      </div>

      <Button onClick={() => onSeedGenerated(phrase)} size="lg" className="plasmo-w-full plasmo-h-12">
        I've Saved My Phrase
      </Button>
    </div>
  );
}
