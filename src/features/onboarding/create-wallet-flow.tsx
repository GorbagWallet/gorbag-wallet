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
import { PasswordStep } from "./steps/password-step";
import { EnterExistingPasswordStep } from "./steps/enter-existing-password-step";

type CreateStepExtended = "password" | "enterExistingPassword" | "nickname" | "seed" | "verify" | "loading" | "postOnboarding";

interface CreateWalletFlowProps {
  onBack: () => void;
  onDashboard: () => void;
}

export function CreateWalletFlow({ onBack, onDashboard }: CreateWalletFlowProps) {
  const { addWallet, setActiveWallet, wallets, passwordHash, setPassword, verifyPassword, unlockWallet } = useWallet();
  // Add step for entering existing password when creating additional wallet
  type CreateStepExtended = "password" | "enterExistingPassword" | "nickname" | "seed" | "verify" | "loading" | "postOnboarding";
  const [step, setStep] = useState<CreateStepExtended>(passwordHash ? "enterExistingPassword" : "password");
  const [nickname, setNickname] = useState("");
  const [password, setPasswordState] = useState("");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);

  // Handle the case where we need to enter the existing password for additional wallet creation
  const handleEnterExistingPassword = async (enteredPassword: string) => {
    // Verify the entered password matches the existing password hash
    const isValid = await verifyPassword(enteredPassword);
    if (isValid) {
      setPasswordState(enteredPassword); // Set the verified password
      setStep("nickname");
    } else {
      alert("Incorrect password. Please try again.");
      // Could add more sophisticated error handling here
    }
  };

  useEffect(() => {
    if (step === "loading") {
      const createWallet = async () => {
        if (!password) {
          console.error("No password provided for wallet creation");
          return;
        }
        
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
          await addWallet(wallet, password, false); // Don't set as active yet, let user go through post-onboarding
          
          // Since this is a new wallet creation, we should create a session automatically
          // so the user doesn't get locked out during onboarding
          if (password) {
            try {
              // Wait a moment to ensure the wallet is properly added to the wallets array
              setTimeout(async () => {
                try {
                  // Try to unlock the wallet with the password to create a session
                  const unlockSuccess = await unlockWallet(password);
                  if (unlockSuccess) {
                    console.log("CreateWalletFlow: Automatically unlocked wallet and created session after creation"); // DEBUG
                  } else {
                    console.error("CreateWalletFlow: Failed to automatically unlock wallet after creation"); // DEBUG
                  }
                } catch (error) {
                  console.error("CreateWalletFlow: Error unlocking wallet after creation:", error); // DEBUG
                }
              }, 100); // Small delay to ensure wallet state is updated
            } catch (sessionError) {
              console.error("CreateWalletFlow: Error creating session:", sessionError); // DEBUG
            }
          }
          
          setStep("postOnboarding");
        } catch (error) {
          console.error("Error creating wallet:", error);
          // Handle error appropriately
        }
      };
      createWallet();
    }
  }, [step, password, seedPhrase, nickname, addWallet, unlockWallet]);

  useEffect(() => {
    console.log("CreateWalletFlow: Current step", step, "wallets length", wallets.length); // DEBUG
  }, [step, wallets.length]);

  return (
    <div className="plasmo-w-full plasmo-max-w-md plasmo-p-4">
      {step === "enterExistingPassword" && (
        <EnterExistingPasswordStep
          onNext={handleEnterExistingPassword}
          onBack={onBack}
        />
      )}
      {step === "password" && (
        <PasswordStep
          onNext={async (newPassword) => {
            console.log("CreateWalletFlow: Setting password, moving to nickname"); // DEBUG
            await setPassword(newPassword);
            setPasswordState(newPassword);
            setStep("nickname");
          }}
          onBack={onBack}
        />
      )}
      {step === "nickname" && (
        <NicknameStep
          onNext={(name) => {
            console.log("CreateWalletFlow: Setting nickname, moving to seed"); // DEBUG
            setNickname(name);
            setStep("seed");
          }}
          onBack={step === "enterExistingPassword" ? onBack : passwordHash ? onBack : () => setStep("password")}
        />
      )}
      {step === "seed" && (
        <SeedPhraseStep
          onSeedGenerated={(phrase) => {
            console.log("CreateWalletFlow: Seed generated, moving to verify"); // DEBUG
            setSeedPhrase(phrase);
            setStep("verify");
          }}
          onBack={() => setStep("nickname")}
        />
      )}
      {step === "verify" && (
        <VerifySeedStep
          seedPhrase={seedPhrase}
          onVerified={() => {
            console.log("CreateWalletFlow: onVerified called, moving to loading"); // DEBUG
            setStep("loading");
          }}
          onBack={() => setStep("seed")}
        />
      )}
      {step === "loading" && <SetupLoadingStep />}
      {step === "postOnboarding" && (
        <PostOnboarding 
          nickname={nickname}
          onComplete={async () => {
            console.log("CreateWalletFlow: PostOnboarding complete, setting active wallet"); // DEBUG
            // Set the most recently added wallet as active
            const lastWallet = wallets[wallets.length - 1];
            if (lastWallet) {
              console.log("CreateWalletFlow: Setting active wallet to", lastWallet.id); // DEBUG
              setActiveWallet(lastWallet);
            }
            
            onDashboard();
          }} 
        />
      )}
    </div>
  );
}