import { useState, useEffect } from "react";
import { ImportNicknameStep } from "./steps/import-nickname-step";
import { ImportKeyStep, type ImportedWallet } from "./steps/import-key-step";
import { SetupLoadingStep } from "./steps/setup-loading-step";
import { PostOnboarding } from "./post-onboarding";
import { useWallet, type Wallet } from "~/lib/wallet-context";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

type ImportStep = "nickname" | "key" | "loading" | "postOnboarding";

interface ImportWalletFlowProps {
  onBack: () => void;
  onDashboard: () => void;
}

export function ImportWalletFlow({ onBack, onDashboard }: ImportWalletFlowProps) {
  const [step, setStep] = useState<ImportStep>("nickname");
  const [nickname, setNickname] = useState("");
  const [importedWallet, setImportedWallet] = useState<ImportedWallet | null>(null);
  const { addWallet } = useWallet();

  useEffect(() => {
    if (step === "loading" && importedWallet) {
      const wallet: Wallet = {
        id: Math.random().toString(36).slice(2),
        nickname,
        address: importedWallet.address,
        seedPhrase: importedWallet.seedPhrase?.join(" "),
        privateKey: bs58.encode(importedWallet.keypair.secretKey),
        createdAt: Date.now(),
      };
      addWallet(wallet);
      setStep("postOnboarding");
    }
  }, [step, importedWallet]);

  return (
    <div className="plasmo-w-full plasmo-max-w-md plasmo-p-4">
      {step === "nickname" && (
        <ImportNicknameStep
          onNext={(name) => {
            setNickname(name);
            setStep("key");
          }}
          onBack={onBack}
        />
      )}
      {step === "key" && (
        <ImportKeyStep
          onImport={(wallet) => {
            setImportedWallet(wallet);
            setStep("loading");
          }}
          onBack={() => setStep("nickname")}
        />
      )}
      {step === "loading" && <SetupLoadingStep />}
      {step === "postOnboarding" && (
        <PostOnboarding onComplete={onDashboard} />
      )}
    </div>
  );
}