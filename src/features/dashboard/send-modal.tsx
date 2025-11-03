"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { validateWalletAddress } from "~/lib/utils/wallet-utils"
import { useWallet } from "~/lib/wallet-context"
import { networks } from "~/lib/config"
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useI18n } from "~/i18n/context"
import successIcon from "data-base64:~assets/icons/icons8-success-24.png"
import cancelIcon from "data-base64:~assets/icons/icons8-cancel-24.png"
import errorIcon from "data-base64:~assets/icons/icons8-error-24.png"
import closeIcon from "data-base64:~assets/icons/icons8-close-24.png"
import continueIcon from "data-base64:~assets/icons/icons8-telegram-app-24.png"
import validIcon from "data-base64:~assets/icons/icons8-success-24.png"  // Using success icon for valid status
import invalidIcon from "data-base64:~assets/icons/icons8-cancel-24.png" // Using cancel icon for invalid status

interface SendModalProps {
  open: boolean
  onClose: () => void
}

type SendStep = "input" | "simulation" | "signing" | "success" | "failed"

export function SendModal({ open, onClose }: SendModalProps) {
  const { t } = useI18n()
  const { activeWallet, tokens, network, balance, signTransaction, clearTransactionHistoryCache } = useWallet()
  const [step, setStep] = useState<SendStep>("input")
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [addressValid, setAddressValid] = useState<boolean | null>(null)
  const [isCheckingAddress, setIsCheckingAddress] = useState(false)
  const [useDollar, setUseDollar] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null) // Store transaction hash
  const [error, setError] = useState<string | null>(null) // Store error message

  // Get actual native token balance (GOR for gorbagana, SOL for solana)
  const nativeTokenSymbol = network === "gorbagana" ? "GOR" : "SOL"
  const nativeTokenBalance = tokens.find(token => 
    token.content.metadata.symbol === nativeTokenSymbol
  )?.token_info.balance || 0
  
  const nativeTokenAmount = nativeTokenBalance / (10 ** 9) // Assuming 9 decimals for native tokens
  const minimumNativeBalance = 0.005; // Minimum 0.005 native currency required

  const handleAddressChange = async (value: string) => {
    setAddress(value)
    if (value.trim()) {
      setIsCheckingAddress(true)
      // Simulate address validation
      await new Promise((resolve) => setTimeout(resolve, 800))
      setAddressValid(validateWalletAddress(value))
      setIsCheckingAddress(false)
    } else {
      setAddressValid(null)
    }
  }

  const handleAmountChange = (value: string) => {
    // Validate that the amount doesn't exceed the balance
    const numericValue = parseFloat(value)
    if (isNaN(numericValue) || numericValue <= 0) {
      setAmount(value)
      return
    }
    
    if (numericValue > nativeTokenAmount) {
      // Amount exceeds available balance
      return
    }
    
    setAmount(value)
  }

  const handlePercentage = (percent: number) => {
    const calculatedAmount = (nativeTokenAmount * percent) / 100
    setAmount(calculatedAmount.toFixed(6)) // Using 6 decimal places for precision
  }

  const handleContinue = async () => {
    // Validate inputs before proceeding
    if (!address || !amount || addressValid !== true) {
      return
    }
    
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return
    }
    
    if (numericAmount > nativeTokenAmount) {
      // Show error for insufficient funds
      setAddressValid(false) // Temporarily mark as invalid to show error
      setTimeout(() => setAddressValid(true), 2000) // Reset after 2 seconds
      return
    }
    
    // Skip simulation for gorbagana network, go directly to signing
    if (network === "gorbagana") {
      setStep("signing")
    } else {
      // For solana network, go to simulation for thorough validation
      setStep("simulation")
    }
  }

  const handleSimulate = async () => {
    try {
      // Check if user has minimum required native currency
      if (nativeTokenAmount < minimumNativeBalance) {
        setError(`Insufficient ${nativeTokenSymbol} for transaction fees. Minimum ${minimumNativeBalance} ${nativeTokenSymbol} required.`);
        setStep("failed")
        return
      }

      // Validate amount
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError("Invalid amount entered");
        setStep("failed")
        return
      }

      if (numericAmount > nativeTokenAmount) {
        setError("Insufficient balance");
        setStep("failed")
        return
      }

      // Validate address format
      try {
        new PublicKey(address);
      } catch (err) {
        setError("Invalid recipient address");
        setStep("failed")
        return
      }

      // For Solana, we can do a simple getFeeForMessage to estimate fees
      const rpcUrl = networks[network].rpc;
      const connection = new Connection(rpcUrl);
      
      // Estimate network fees
      const { blockhash } = await connection.getLatestBlockhash();
      const feeEstimate = await connection.getFeeForMessage(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(activeWallet.address),
            toPubkey: new PublicKey(address),
            lamports: 1, // Just for fee estimation
          })
        ).compileMessage()
      );

      if (feeEstimate.value === null) {
        setError("Could not estimate transaction fees");
        setStep("failed")
        return
      }

      // Simulation successful, proceed to signing
      setStep("signing")
    } catch (err) {
      console.error("Fee estimation error:", err);
      setError(err instanceof Error ? err.message : "Could not estimate transaction fees");
      // Even if the simulation fails, clear the cache to refresh any potential state
      clearTransactionHistoryCache();
      setStep("failed")
    }
  }

  const handleSignAndConfirm = async () => {
    setStep("sending")
    try {
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError("Invalid amount");
        setStep("failed")
        return
      }

      const rpcUrl = networks[network].rpc;
      const connection = new Connection(rpcUrl);
      
      // Get sender and recipient public keys
      if (!activeWallet?.address) {
        setError("Wallet not available");
        setStep("failed")
        return
      }
      
      const senderPublicKey = new PublicKey(activeWallet.address);
      const recipientPublicKey = new PublicKey(address);
      
      // Convert amount to lamports
      const lamports = Math.floor(numericAmount * LAMPORTS_PER_SOL);
      
      // Create the transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: lamports,
        })
      );
      
      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign the transaction using the wallet's signing functionality
      const signedTransaction = await signTransaction(transaction);
      
      // Send the signed transaction to the network
      const txHash = await connection.sendRawTransaction(signedTransaction.serialize());
      setTxHash(txHash);
      
      // Clear the transaction history cache after a successful transaction
      clearTransactionHistoryCache();
      
      setStep("success")
    } catch (err) {
      console.error("Transaction signing error:", err);
      setError(err instanceof Error ? err.message : "Transaction signing failed");
      // Even if the transaction fails, clear the cache so the user knows something happened
      clearTransactionHistoryCache();
      setStep("failed")
    }
  }

  if (!open) return null

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-background/80 plasmo-backdrop-blur-sm plasmo-z-50 plasmo-flex plasmo-items-end sm:plasmo-items-center plasmo-justify-center">
      <div className="plasmo-bg-card plasmo-w-full plasmo-max-w-md plasmo-rounded-t-3xl sm:plasmo-rounded-3xl plasmo-p-6 plasmo-animate-in plasmo-slide-in-from-bottom duration-300 sm:plasmo-slide-in-from-bottom-0">
        {step === "input" && (
          <>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
              <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-card-foreground">{t("send.title")}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="plasmo-rounded-xl">
                <img src={closeIcon} className="plasmo-h-5 plasmo-w-5" alt={t("common.close")} />
              </Button>
            </div>

            <div className="plasmo-space-y-4">
              <div>
                <Label htmlFor="recipient" className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                  {t("send.recipientAddress")}
                </Label>
                <div className="plasmo-relative">
                  <Input
                    id="recipient"
                    placeholder={t("send.enterAddress")}
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-pr-10"
                  />
                  {isCheckingAddress && (
                    <Loader2 className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-animate-spin plasmo-text-muted-foreground" />
                  )}
                  {addressValid === true && (
                    <img src={validIcon} className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-text-green-500" alt="Valid" />
                  )}
                  {addressValid === false && (
                    <img src={invalidIcon} className="plasmo-absolute plasmo-right-3 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-h-4 plasmo-w-4 plasmo-text-destructive" alt="Invalid" />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="plasmo-text-sm plasmo-font-medium plasmo-text-card-foreground plasmo-mb-2 plasmo-block">
                  {t("send.amount")}
                </Label>
                <div className="plasmo-flex plasmo-gap-2 plasmo-mb-2">
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(20)} className="plasmo-text-xs plasmo-h-8">
                    {t("send.twentyPercent")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(50)} className="plasmo-text-xs plasmo-h-8">
                    {t("send.fiftyPercent")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePercentage(100)} className="plasmo-text-xs plasmo-h-8">
                    {t("common.max")}
                  </Button>
                </div>
                <div className="plasmo-relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="plasmo-h-12 plasmo-rounded-xl plasmo-bg-background plasmo-border-border plasmo-pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseDollar(!useDollar)}
                    className="plasmo-absolute plasmo-right-2 plasmo-top-1/2 -plasmo-translate-y-1/2 plasmo-text-primary hover:plasmo-text-primary/80 plasmo-text-xs"
                  >
                    {useDollar ? "$" : network === "gorbagana" ? "GOR" : "SOL"}
                  </Button>
                </div>
                <p className="plasmo-text-xs plasmo-text-muted-foreground plasmo-mt-2">{t("send.balance", { balance: nativeTokenAmount.toFixed(6), symbol: nativeTokenSymbol })}</p>
              </div>

              <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-4">
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm plasmo-mb-2">
                  <span className="plasmo-text-muted-foreground">{t("send.networkFee")}</span>
                  <span className="plasmo-text-card-foreground plasmo-font-medium">~0.000005 {nativeTokenSymbol}</span>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-text-sm">
                  <span className="plasmo-text-muted-foreground">{t("send.total")}</span>
                  <span className="plasmo-text-card-foreground plasmo-font-semibold">{amount || "0.00"} {nativeTokenSymbol}</span>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!address || !amount || addressValid !== true || parseFloat(amount) <= 0 || parseFloat(amount) > nativeTokenAmount}
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium"
              >
                {t("common.continue")}
                <img src={continueIcon} className="plasmo-h-4 plasmo-w-4 plasmo-ml-2" alt={t("common.continue")} />
              </Button>
            </div>
          </>
        )}

        {step === "simulation" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <Loader2 className="plasmo-h-12 plasmo-w-12 plasmo-animate-spin plasmo-text-primary plasmo-mb-4" />
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{t("send.simulation")}</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground">{t("send.checkingViability")}</p>
          </div>
        )}

        {step === "signing" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12 plasmo-space-y-6">
            <div className="plasmo-w-16 plasmo-h-16 plasmo-rounded-full plasmo-bg-primary/10 plasmo-flex plasmo-items-center plasmo-justify-center">
              <img src={successIcon} className="plasmo-h-8 plasmo-w-8" alt={t("send.simulated")} />
            </div>
            <div className="plasmo-text-center">
              <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{t("send.simulated")}</h3>
              <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-4">{t("send.simulationSuccess")}</p>
              <p className="plasmo-text-xs plasmo-text-muted-foreground">{t("send.from", { amount, symbol: network === "gorbagana" ? "GOR" : "SOL", address: `${address.substring(0, 6)}...${address.substring(address.length - 4)}` })}</p>
            </div>
            <div className="plasmo-w-full plasmo-space-y-3">
              <Button onClick={handleSignAndConfirm} className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-bg-primary hover:plasmo-bg-primary/90 plasmo-text-primary-foreground plasmo-font-medium">
                {t("send.signAndConfirm")}
              </Button>
              <Button 
                onClick={() => setStep("input")} 
                variant="outline" 
                className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl"
              >
                {t("send.cancel")}
              </Button>
            </div>
          </div>
        )}

        {step === "sending" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <Loader2 className="plasmo-h-12 plasmo-w-12 plasmo-animate-spin plasmo-text-primary plasmo-mb-4" />
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{t("send.confirming")}</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground">{t("send.pleaseConfirm")}</p>
          </div>
        )}

        {step === "success" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-green-500/20 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
              <img src={successIcon} className="plasmo-h-6 plasmo-w-6" alt={t("send.transactionConfirmed")} />
            </div>
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{t("send.transactionConfirmed")}</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">{t("send.tokensSent")}</p>
            {txHash && (
              <div className="plasmo-mb-4 plasmo-text-center">
                <p className="plasmo-text-xs plasmo-text-muted-foreground plasmo-mb-1">{t("activity.transactionHash")}</p>
                <a 
                  href={`${networks[network].explorer}${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="plasmo-text-xs plasmo-text-primary hover:plasmo-underline plasmo-block plasmo-break-all"
                >
                  {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 6)}
                </a>
              </div>
            )}
            <Button onClick={onClose} className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl">
              {t("send.done")}
            </Button>
          </div>
        )}

        {step === "failed" && (
          <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-py-12">
            <div className="plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-destructive/20 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
              <img src={errorIcon} className="plasmo-h-6 plasmo-w-6" alt={t("common.error")} />
            </div>
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-card-foreground plasmo-mb-1">{t("send.transactionFailed")}</h3>
            <p className="plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-6">{error || t("send.somethingWentWrong")}</p>
            {txHash && (
              <div className="plasmo-mb-4 plasmo-text-center">
                <p className="plasmo-text-xs plasmo-text-muted-foreground plasmo-mb-1">{t("activity.transactionHash")}</p>
                <a 
                  href={`${networks[network].explorer}${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="plasmo-text-xs plasmo-text-primary hover:plasmo-underline plasmo-block plasmo-break-all"
                >
                  {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 6)}
                </a>
              </div>
            )}
            <Button onClick={() => setStep("input")} variant="outline" className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl plasmo-mb-2">
              {t("common.tryAgain")}
            </Button>
            <Button onClick={onClose} variant="ghost" className="plasmo-w-full plasmo-h-12 plasmo-rounded-xl">
              {t("common.close")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
