import React, { useState } from "react";
import { Button } from "./ui/button";
import { useI18n } from "~/i18n/context";
import successIcon from "data-base64:~assets/icons/icons8-success-24.png";
import copyIcon from "data-base64:~assets/icons/icons8-copy-24.png";

interface CopyToClipboardProps {
  text: string;
}

export function CopyToClipboard({ text }: CopyToClipboardProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="plasmo-h-8 plasmo-w-8">
      {copied ? (
        <img src={successIcon} className="plasmo-h-4 plasmo-w-4 plasmo-text-green-500" alt={t("common.copied")} />
      ) : (
        <img src={copyIcon} className="plasmo-h-4 plasmo-w-4" alt={t("common.copy")} />
      )}
    </Button>
  );
}
