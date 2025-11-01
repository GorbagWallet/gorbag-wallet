import { useState, useEffect } from "react";
import { NicknameStep } from "./steps/nickname-step";
import { SeedPhraseStep } from "./steps/seed-phrase-step";
import { VerifySeedStep } from "./steps/verify-seed-step";
import { SetupLoadingStep } from "./steps/setup-loading-step";
import { PostOnboarding } from "./post-onboarding";
import { useWallet, type Wallet } from "~/lib/wallet-context";
import { generateWalletAddress } from "~/lib/utils/wallet-utils";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

type CreateStep = "nickname" | "seed" | "verify" | "loading" | "postOnboarding";

interface CreateWalletFlowProps {
  onBack: () => void;
  onDashboard: () => void;
}

export function CreateWalletFlow({ onBack, onDashboard }: CreateWalletFlowProps) {
  const [step, setStep] = useState<CreateStep>("nickname");
  const [nickname, setNickname] = useState("");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const { addWallet } = useWallet();

  useEffect(() => {
    if (step === "loading") {
      const createWallet = async () => {
        try {
          const seedPhraseStr = seedPhrase.join(" ");
          const address = await generateWalletAddress(seedPhraseStr);
          const seed = await bip39.mnemonicToSeed(seedPhraseStr);
          const derivedSeed = derivePath(`m/44'/501'/0'/0'`, seed.toString('hex')).key;
          const keypair = Keypair.fromSeed(derivedSeed);

          const wallet: Wallet = {
            id: Math.random().toString(36).slice(2),
            nickname,
            address,
            seedPhrase: seedPhraseStr,
            privateKey: bs58.encode(keypair.secretKey),
            createdAt: Date.now(),
          };
          addWallet(wallet);
          setStep("postOnboarding");
        } catch (error) {
          console.error("Error creating wallet:", error);
          // Handle error appropriately
        }
      };
      createWallet();
    }
  }, [step]);

  return (
    <div className="plasmo-w-full plasmo-max-w-md plasmo-p-4">
      {step === "nickname" && (
        <NicknameStep
          onNext={(name) => {
            setNickname(name);
            setStep("seed");
          }}
          onBack={onBack}
        />
      )}
      {step === "seed" && (
        <SeedPhraseStep
          onSeedGenerated={(phrase) => {
            setSeedPhrase(phrase);
            setStep("verify");
          }}
          onBack={() => setStep("nickname")}
        />
      )}
      {step === "verify" && (
        <VerifySeedStep
          seedPhrase={seedPhrase}
          onVerified={() => setStep("loading")}
          onBack={() => setStep("seed")}
        />
      )}
      {step === "loading" && <SetupLoadingStep />}
      {step === "postOnboarding" && (
        <PostOnboarding onComplete={onDashboard} />
      )}
    </div>
  );
}