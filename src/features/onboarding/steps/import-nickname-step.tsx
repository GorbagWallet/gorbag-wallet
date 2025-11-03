import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useI18n } from "~/i18n/context";

interface ImportNicknameStepProps {
  onNext: (nickname: string) => void;
  onBack: () => void;
}

export function ImportNicknameStep({ onNext, onBack }: ImportNicknameStepProps) {
  const { t } = useI18n();
  const [nickname, setNickname] = useState("");
  const [isAnimating, setAnimating] = useState(false);

  const handleNextClick = () => {
    if (!nickname.trim()) return;
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      onNext(nickname);
    }, 300);
  };

  return (
    <div className="plasmo-w-full">
      <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
        <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
        {t("onboarding.importNickname.back")}
      </button>

      <div className="plasmo-mb-8">
        <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">{t("onboarding.importNickname.title")}</h2>
        <p className="plasmo-text-muted-foreground plasmo-text-sm">{t("onboarding.importNickname.description")}</p>
      </div>

      <div className="plasmo-space-y-4">
        <div>
          <Label htmlFor="nickname" className="plasmo-text-foreground plasmo-mb-2 plasmo-block">
            {t("onboarding.importNickname.label")}
          </Label>
          <Input
            id="nickname"
            placeholder={t("onboarding.importNickname.placeholder")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="plasmo-h-12"
          />
        </div>

        <Button
          onClick={handleNextClick}
          disabled={!nickname.trim()}
          size="lg"
          className={`plasmo-w-full plasmo-h-12 ${
            isAnimating ? "animate-pop" : ""
          }`}>
          {t("onboarding.importNickname.continue")}
        </Button>
      </div>
    </div>
  );
}
