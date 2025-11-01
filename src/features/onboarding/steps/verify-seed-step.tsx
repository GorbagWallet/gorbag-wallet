import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ChevronLeft, Check, X } from "lucide-react";
import { getRandomSeedIndices } from "~/lib/utils/wallet-utils";

interface VerifySeedStepProps {
  seedPhrase: string[];
  onVerified: () => void;
  onBack: () => void;
}

export function VerifySeedStep({ seedPhrase, onVerified, onBack }: VerifySeedStepProps) {
  const [indices, setIndices] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [verified, setVerified] = useState<Record<number, boolean>>({});
  const [isAnimating, setAnimating] = useState(false);

  useEffect(() => {
    const randomIndices = getRandomSeedIndices();
    setIndices(randomIndices);
  }, []);

  const handleVerify = () => {
    const allCorrect = indices.every((idx) => answers[idx]?.toLowerCase() === seedPhrase[idx].toLowerCase());

    if (allCorrect) {
      onVerified();
    } else {
      const newVerified: Record<number, boolean> = {};
      indices.forEach((idx) => {
        newVerified[idx] = answers[idx]?.toLowerCase() === seedPhrase[idx].toLowerCase();
      });
      setVerified(newVerified);
    }
  };

  const handleVerifyClick = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      handleVerify();
    }, 300);
  };

  const allAnswered = indices.every((idx) => answers[idx]?.trim());

  return (
    <div className="plasmo-w-full">
      <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
        <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
        Back
      </button>

      <div className="plasmo-mb-8">
        <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">Verify Your Seed Phrase</h2>
        <p className="plasmo-text-muted-foreground plasmo-text-sm">Enter the words at the positions shown below</p>
      </div>

      <div className="plasmo-space-y-4 plasmo-mb-6">
        {indices.map((idx) => (
          <div key={idx}>
            <Label className="plasmo-text-foreground plasmo-mb-2 plasmo-block">Word #{idx + 1}</Label>
            <div className="plasmo-relative">
              <Input
                placeholder={`Enter word #${idx + 1}`}
                value={answers[idx] || ""}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                className="plasmo-h-12 plasmo-pr-10"
              />
              {verified[idx] !== undefined && (
                <div className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2">
                  {verified[idx] ? (
                    <Check className="plasmo-h-5 plasmo-w-5 plasmo-text-green-500" />
                  ) : (
                    <X className="plasmo-h-5 plasmo-w-5 plasmo-text-destructive" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleVerifyClick}
        disabled={!allAnswered}
        size="lg"
        className={`plasmo-w-full plasmo-h-12 ${
          isAnimating ? "animate-pop" : ""
        }`}>
        Verify Phrase
      </Button>
    </div>
  );
}
