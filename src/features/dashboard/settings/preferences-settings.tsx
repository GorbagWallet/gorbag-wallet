"use client"

import { useWallet } from "~/lib/wallet-context"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useI18n } from "~/i18n/context"
import type { Locale } from "~/i18n/config"

export function PreferencesSettings() {
  const { preferredCurrency, setPreferredCurrency } = useWallet()
  const { locale, setLocale, availableLocales, t } = useI18n()

  return (
    <div className="plasmo-space-y-6">
      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">
          {t("settings.currency")}
        </Label>
        <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
          <SelectTrigger className="plasmo-h-12 plasmo-rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">{t("settings.currencies.usd")}</SelectItem>
            <SelectItem value="gbp">{t("settings.currencies.gbp")}</SelectItem>
            <SelectItem value="ngn">{t("settings.currencies.ngn")}</SelectItem>
            <SelectItem value="eur">{t("settings.currencies.eur")}</SelectItem>
            <SelectItem value="jpy">{t("settings.currencies.jpy")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="plasmo-text-sm plasmo-font-medium plasmo-text-foreground plasmo-mb-3 plasmo-block">
          {t("settings.language")}
        </Label>
        <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
          <SelectTrigger className="plasmo-h-12 plasmo-rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLocales.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {t(`languages.${loc}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </select>
      </div>
    </div>
  )
}
