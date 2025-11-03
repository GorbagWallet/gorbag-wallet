import { Loader2 } from "lucide-react";
import { useI18n } from "~/i18n/context";

export function SetupLoadingStep() {
  const { t } = useI18n();
  return (
    <div className="plasmo-w-full plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
      <Loader2 className="plasmo-h-12 plasmo-w-12 plasmo-animate-spin plasmo-text-primary plasmo-mb-4" />
      <h2 className="plasmo-text-xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">{t("onboarding.setupLoading.title")}</h2>
      <p className="plasmo-text-muted-foreground plasmo-text-sm">{t("onboarding.setupLoading.description")}</p>
    </div>
  );
}
