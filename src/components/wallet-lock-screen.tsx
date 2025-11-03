import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useWallet } from "~/lib/wallet-context";
import { useI18n } from "~/i18n/context";
import lockIcon from "data-base64:~assets/icons/icons8-lock-96.png";

export function WalletLockScreen() {
  const { t } = useI18n();
  const { unlockWallet, isLocked, activeWallet } = useWallet();
  const [password, setPasswordState] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const unlockSuccess = await unlockWallet(password);
      if (!unlockSuccess) {
        setError(t("settings.security.invalidPassword"));
      } else {
        // On successful unlock, clear the password field
        setPasswordState("");
      }
    } catch (err) {
      setError(t("settings.security.unlockError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-focus the password input when the component mounts
  useEffect(() => {
    const input = document.getElementById("unlock-password");
    if (input) {
      input.focus();
    }
  }, []);

  if (!isLocked) {
    return null;
  }

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background plasmo-z-50 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4">
      <div className="plasmo-w-full plasmo-max-w-sm plasmo-bg-card plasmo-rounded-xl plasmo-p-6 plasmo-shadow-lg">
        <div className="plasmo-text-center plasmo-mb-6">
          <div className="plasmo-w-16 plasmo-h-16 plasmo-bg-primary/10 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mx-auto plasmo-mb-4">
            <img src={lockIcon} className="plasmo-h-8 plasmo-w-8 plasmo-text-primary" alt={t("settings.security.walletLocked")} />
          </div>
          <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">
            {t("settings.security.walletLocked")}
          </h2>
          <p className="plasmo-text-muted-foreground plasmo-text-sm">
            {activeWallet 
              ? t("settings.security.enterPasswordToUnlock", { nickname: activeWallet.nickname })
              : t("settings.security.enterPasswordToAccess")}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="plasmo-space-y-4">
          <div>
            <Label htmlFor="unlock-password" className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">
              {t("settings.security.enterPassword")}
            </Label>
            <Input
              id="unlock-password"
              type="password"
              placeholder={t("settings.security.enterPassword")}
              value={password}
              onChange={(e) => setPasswordState(e.target.value)}
              className="plasmo-h-12 plasmo-rounded-xl"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="plasmo-bg-destructive/10 plasmo-rounded-lg plasmo-p-3 plasmo-text-destructive plasmo-text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl"
            disabled={isLoading || !password.trim()}>
            {isLoading ? (
              <span className="plasmo-flex plasmo-items-center plasmo-gap-2">
                <span className="plasmo-animate-spin plasmo-inline-block plasmo-w-4 plasmo-h-4 plasmo-border plasmo-border-current plasmo-border-t-transparent plasmo-rounded-full"></span>
                {t("common.loading")}
              </span>
            ) : (
              t("settings.security.unlock")
            )}
          </Button>
        </form>

        <div className="plasmo-mt-6 plasmo-text-center plasmo-text-xs plasmo-text-muted-foreground">
          <p>{t("settings.security.passwordNotice")}</p>
        </div>
      </div>
    </div>
  );
}