"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useI18n } from "~/i18n/context"

export function SecuritySettings() {
  const { t } = useI18n()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [autoLock, setAutoLock] = useState("immediately")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)

  const handleSetPassword = () => {
    if (password === confirmPassword && password.length >= 6) {
      setPasswordSet(true)
      setPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    }
  }

  return (
    <div className="plasmo-space-y-6">
      <div>
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-3">
          <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("settings.security.walletPassword")}</Label>
          {passwordSet && <span className="plasmo-text-xs plasmo-text-green-500">{t("settings.security.passwordSet")}</span>}
        </div>
        {!showPasswordForm ? (
          <Button
            variant="outline"
            className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-transparent"
            onClick={() => setShowPasswordForm(true)}>
            {passwordSet ? t("settings.security.changePassword") : t("settings.security.setPassword")}
          </Button>
        ) : (
          <div className="plasmo-space-y-3">
            <Input
              type="password"
              placeholder={t("settings.security.enterPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="plasmo-h-12 plasmo-rounded-xl"
            />
            <Input
              type="password"
              placeholder={t("settings.security.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="plasmo-h-12 plasmo-rounded-xl"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <div className="plasmo-flex plasmo-items-start plasmo-gap-2 plasmo-p-3 plasmo-bg-destructive/10 plasmo-rounded-lg">
                <AlertCircle className="plasmo-h-4 plasmo-w-4 plasmo-text-destructive plasmo-mt-0.5 plasmo-flex-shrink-0" />
                <p className="plasmo-text-xs plasmo-text-destructive">{t("settings.security.passwordsDoNotMatch")}</p>
              </div>
            )}
            {password && password.length < 6 && (
              <div className="plasmo-flex plasmo-items-start plasmo-gap-2 plasmo-p-3 plasmo-bg-destructive/10 plasmo-rounded-lg">
                <AlertCircle className="plasmo-h-4 plasmo-w-4 plasmo-text-destructive plasmo-mt-0.5 plasmo-flex-shrink-0" />
                <p className="plasmo-text-xs plasmo-text-destructive">{t("settings.security.passwordTooShort")}</p>
              </div>
            )}
            <div className="plasmo-flex plasmo-gap-2">
              <Button
                variant="outline"
                className="plasmo-flex-1 plasmo-h-10 plasmo-rounded-lg plasmo-bg-transparent"
                onClick={() => setShowPasswordForm(false)}>
                {t("settings.security.cancel")}
              </Button>
              <Button
                className="plasmo-flex-1 plasmo-h-10 plasmo-rounded-lg"
                onClick={handleSetPassword}
                disabled={password !== confirmPassword || password.length < 6}>
                {t("settings.security.save")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">{t("settings.security.autoLockTimer")}</Label>
        <Select value={autoLock} onValueChange={setAutoLock}>
          <SelectTrigger className="plasmo-h-12 plasmo-rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediately">{t("settings.security.immediately")}</SelectItem>
            <SelectItem value="10mins">{t("settings.security.minutes", { count: 10 })}</SelectItem>
            <SelectItem value="30mins">{t("settings.security.minutes", { count: 30 })}</SelectItem>
            <SelectItem value="1hr">{t("settings.security.hour", { count: 1 })}</SelectItem>
            <SelectItem value="4hrs">{t("settings.security.hours", { count: 4 })}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
