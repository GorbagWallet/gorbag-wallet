import { useState, useEffect } from "react";
import { ImportNicknameStep } from "./steps/import-nickname-step";
import { ImportKeyStep, type ImportedWallet } from "./steps/import-key-step";
import { SetupLoadingStep } from "./steps/setup-loading-step";
import { PostOnboarding } from "./post-onboarding";
import { useWallet, type Wallet } from "~/lib/wallet-context";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { PasswordStep } from "./steps/password-step";
import { EnterExistingPasswordStep } from "./steps/enter-existing-password-step";

type ImportStepExtended = "password" | "enterExistingPassword" | "nickname" | "key" | "loading" | "postOnboarding";

interface ImportWalletFlowProps {
  onBack: () => void;
  onDashboard: () => void;
}

export function ImportWalletFlow({ onBack, onDashboard }: ImportWalletFlowProps) {
  const { addWallet, setActiveWallet, wallets, passwordHash, setPassword, verifyPassword, unlockWallet } = useWallet();
  const [step, setStep] = useState<ImportStepExtended>(passwordHash ? "enterExistingPassword" : "password");
  const [nickname, setNickname] = useState("");
  const [password, setPasswordState] = useState("");
  const [importedWallet, setImportedWallet] = useState<ImportedWallet | null>(null);
  
  // Handle the case where we need to enter the existing password for importing additional wallet
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
    if (step === "loading" && importedWallet) {
      const createWallet = async () => {
        if (!password) {
          console.error("No password provided for wallet import");
          return;
        }
        
        const wallet: Wallet = {
          id: Math.random().toString(36).slice(2),
          nickname,
          address: importedWallet.address,
          seedPhrase: importedWallet.seedPhrase?.join(" "),
          privateKey: bs58.encode(importedWallet.keypair.secretKey),
          createdAt: Date.now(),
        };
        await addWallet(wallet, password, false); // Don't set as active yet, let user go through post-onboarding
        setStep("postOnboarding");
      };
      createWallet();
    }
  }, [step, importedWallet, password]);

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
            await setPassword(newPassword);
            setPasswordState(newPassword);
            setStep("nickname");
          }}
          onBack={onBack}
        />
      )}
      {step === "nickname" && (
        <ImportNicknameStep
          onNext={(name) => {
            setNickname(name);
            setStep("key");
          }}
          onBack={step === "enterExistingPassword" ? onBack : passwordHash ? onBack : () => setStep("password")}
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
        <PostOnboarding 
          nickname={nickname}
          onComplete={async () => {
            console.log("ImportWalletFlow: PostOnboarding complete, setting active wallet and creating session"); // DEBUG
            // Set the most recently added wallet as active
            const lastWallet = wallets[wallets.length - 1];
            if (lastWallet) {
              setActiveWallet(lastWallet);
            }
            
            // For imported wallets, create a session with the password used for encryption
            if (password) {
              // Wait a moment to ensure the wallet is properly set as active
              setTimeout(async () => {
                try {
                  // Try to unlock the wallet with the password to create a session
                  const unlockSuccess = await unlockWallet(password);
                  if (unlockSuccess) {
                    console.log("ImportWalletFlow: Automatically unlocked wallet and created session after import"); // DEBUG
                  } else {
                    console.error("ImportWalletFlow: Failed to automatically unlock wallet after import"); // DEBUG
                  }
                } catch (error) {
                  console.error("ImportWalletFlow: Error unlocking wallet after import:", error); // DEBUG
                }
              }, 100); // Small delay to ensure wallet state is updated
            }
            
            onDashboard();
          }} 
        />
      )}
    </div>
  );
}