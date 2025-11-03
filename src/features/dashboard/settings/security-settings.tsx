"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { AlertCircle } from "lucide-react"
import { useI18n } from "~/i18n/context"
import { useWallet } from "~/lib/wallet-context"

export function SecuritySettings() {
  const { t } = useI18n()
  const { setPassword, passwordHash, autoLockTimer, setAutoLockTimer, lockWallet, verifyPassword } = useWallet()
  const [password, setPasswordState] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [autoLock, setAutoLock] = useState("immediately")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false) // Step 1: verify old password
  const [hasVerifiedOldPassword, setHasVerifiedOldPassword] = useState(false) // Step 2: show new password fields
  const [passwordStatus, setPasswordStatus] = useState<'unknown' | 'set' | 'not_set'>('unknown')
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Update local state when context values change - this reflects global password status
  useEffect(() => {
    setAutoLock(autoLockTimer)
    
    // Update password status based on hash
    if (passwordHash == null || passwordHash === "") {
      setPasswordStatus('not_set')
    } else {
      setPasswordStatus('set')
    }
  }, [passwordHash, autoLockTimer])

  const handleVerifyOldPassword = async () => {
    if (!oldPassword) {
      setError(t("settings.security.enterCurrentPassword"))
      return
    }

    const isValid = await verifyPassword(oldPassword)
    if (!isValid) {
      setError(t("settings.security.invalidCurrentPassword"))
      return
    }

    // Old password is correct, proceed to change password form
    setHasVerifiedOldPassword(true)
    setError("")
  }

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setError(t("settings.security.passwordsDoNotMatch"))
      return
    }
    
    if (password.length < 6) {
      setError(t("settings.security.passwordTooShort"))
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      const success = await setPassword(password)
      if (success) {
        setPasswordState("")
        setConfirmPassword("")
        setOldPassword("")
        setShowPasswordForm(false)
        setIsChangingPassword(false)
        setHasVerifiedOldPassword(false)
        // Status will update via useEffect when passwordHash changes
        setError("")
      } else {
        setError(t("settings.security.setPasswordError"))
      }
    } catch (err) {
      setError(t("settings.security.setPasswordError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePassword = async () => {
    if (window.confirm(t("settings.security.removePasswordConfirm"))) {
      setIsLoading(true)
      setError("")
      try {
        await setPassword("")
        setPasswordStatus('not_set') // Update status after removing password
      } catch (err) {
        setError(t("settings.security.removePasswordError"))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAutoLockChange = (value: string) => {
    setAutoLock(value)
    setAutoLockTimer(value)
  }

  const handleCancel = () => {
    setShowPasswordForm(false)
    setPasswordState("")
    setConfirmPassword("")
    setOldPassword("")
    setError("")
    setIsChangingPassword(false)
    setHasVerifiedOldPassword(false)
  }

  const handleStartChangePassword = () => {
    if (passwordStatus === 'set') {
      // If password is already set, start with old password verification
      setIsChangingPassword(true)
      setShowPasswordForm(true)
      setHasVerifiedOldPassword(false)
    } else {
      // If no password is set, go directly to set password form
      setIsChangingPassword(false)
      setHasVerifiedOldPassword(false)
      setShowPasswordForm(true)
    }
  }

  const isPasswordSet = passwordStatus === 'set'

  return (
    <div className="plasmo-space-y-6">
      <div>
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-3">
          <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground">{t("settings.security.walletPassword")}</Label>
          {isPasswordSet && <span className="plasmo-text-xs plasmo-text-green-500">{t("settings.security.passwordSet")}</span>}
        </div>
        {!showPasswordForm ? (
          <div className="plasmo-flex plasmo-flex-col plasmo-gap-2">
            <Button
              variant="outline"
              className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-transparent"
              onClick={handleStartChangePassword}>
              {isPasswordSet ? t("settings.security.changePassword") : t("settings.security.setPassword")}
            </Button>
            {isPasswordSet && (
              <Button
                variant="outline"
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-transparent plasmo-text-destructive hover:plasmo-bg-destructive/10"
                onClick={handleRemovePassword}
                disabled={isLoading}>
                {t("settings.security.removePassword")}
              </Button>
            )}
            {isPasswordSet && (
              <Button
                variant="outline"
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-transparent plasmo-text-destructive hover:plasmo-bg-destructive/10"
                onClick={lockWallet}
                disabled={isLoading}>
                {t("settings.security.lockNow")}
              </Button>
            )}
          </div>
        ) : (
          <div className="plasmo-space-y-3">
            {/* Step 1: Verify old password (when changing password) */}
            {isChangingPassword && !hasVerifiedOldPassword && (
              <div>
                <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-block">
                  {t("settings.security.currentPassword")}
                </Label>
                <Input
                  type="password"
                  placeholder={t("settings.security.enterCurrentPassword")}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="plasmo-h-12 plasmo-rounded-xl"
                  disabled={isLoading}
                />
                <div className="plasmo-flex plasmo-gap-2 plasmo-mt-4">
                  <Button
                    variant="outline"
                    className="plasmo-flex-1 plasmo-h-10 plasmo-rounded-lg plasmo-bg-transparent"
                    onClick={handleCancel}
                    disabled={isLoading}>
                    {t("settings.security.cancel")}
                  </Button>
                  <Button
                    className="plasmo-flex-1 plasmo-h-10 plasmo-rounded-lg"
                    onClick={handleVerifyOldPassword}
                    disabled={isLoading || !oldPassword}>
                    {t("common.continue")}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Enter new password and confirm (after old password is verified) or for setting initial password */}
            {((!isChangingPassword && showPasswordForm) || (isChangingPassword && hasVerifiedOldPassword)) && (
              <>
                <Input
                  type="password"
                  placeholder={isChangingPassword ? t("settings.security.newPassword") : t("settings.security.enterPassword")}
                  value={password}
                  onChange={(e) => setPasswordState(e.target.value)}
                  className="plasmo-h-12 plasmo-rounded-xl"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder={t("settings.security.confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="plasmo-h-12 plasmo-rounded-xl"
                  disabled={isLoading}
                />
                {error && (
                  <div className="plasmo-flex plasmo-items-start plasmo-gap-2 plasmo-p-3 plasmo-bg-destructive/10 plasmo-rounded-lg">
                    <AlertCircle className="plasmo-h-4 plasmo-w-4 plasmo-text-destructive plasmo-mt-0.5 plasmo-flex-shrink-0" />
                    <p className="plasmo-text-xs plasmo-text-destructive">{error}</p>
                  </div>
                )}
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
                    onClick={handleCancel}
                    disabled={isLoading}>
                    {t("settings.security.cancel")}
                  </Button>
                  <Button
                    className="plasmo-flex-1 plasmo-h-10 plasmo-rounded-lg"
                    onClick={handleChangePassword}
                    disabled={isLoading || password !== confirmPassword || password.length < 6}>
                    {isLoading ? t("common.loading") : t("settings.security.save")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">{t("settings.security.autoLockTimer")}</Label>
        <Select value={autoLock} onValueChange={handleAutoLockChange}>
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
