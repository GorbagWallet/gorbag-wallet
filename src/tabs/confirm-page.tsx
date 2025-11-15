import React, { useEffect, useState } from "react";
import { useDappConnection } from "../features/dapp-connection/context";
import { DappConnectionModal } from "../features/dapp-connection/dapp-connection-modal";
import { DappConnectionRequest } from "../features/dapp-connection/types";
import { WalletManagement } from "../features/wallet-management/wallet-management";
import { WalletProvider } from "../lib/wallet-context";

import { WalletLockScreen } from "../components/wallet-lock-screen";
import { useWallet } from "../lib/wallet-context";
import { Copy } from "lucide-react";
import bs58 from "bs58";

function ConfirmationPageContent() {
  const { showConnectionRequest, pendingRequest, approveConnection, rejectConnection } = useDappConnection();
  const { isLocked, signTransaction } = useWallet();
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<'connect' | 'manage-wallets' | 'approve-transaction'>('connect');

  // Add new state for transaction requests
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [isTransactionView, setIsTransactionView] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  interface ParsedTransactionDetails {
    isTransfer: boolean;
    amount: number | null;
    recipient: string | null;
  }
  const [parsedDetails, setParsedDetails] = useState<ParsedTransactionDetails | null>(null);

  

  // AddressDisplay component
  const AddressDisplay = ({ address }: { address: string }) => {
    const shortenAddress = (addr: string) => {
      if (!addr) return '';
      return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
    };

    const copyToClipboard = () => {
      if (address) {
        navigator.clipboard.writeText(address);
      }
    };

    if (!address) return null;

    return (
      <span className="plasmo-inline-flex plasmo-items-center plasmo-gap-1 plasmo-cursor-pointer hover:plasmo-text-indigo-600" onClick={copyToClipboard}>
        {shortenAddress(address)}
        <Copy className="plasmo-h-3 plasmo-w-3" />
      </span>
    );
  };

  

  

  

  

  

  

  useEffect(() => {
    const fetchRequests = async () => {
      let txRequest;
      try {
        txRequest = await chrome.runtime.sendMessage({
          source: "gorbag-ui",
          method: "get-pending-transaction",
        });
      } catch (error) {
        console.error("Error checking for pending transaction:", error);
      }

      if (txRequest && txRequest.transaction) {
        setPendingTransaction(txRequest);
        setIsTransactionView(true);
        setView("approve-transaction");
        setIsReady(true);
        return; // Found a transaction, no need to check for connection
      }

      // If no transaction, check for a connection
      let connRequest;
      try {
        connRequest = await chrome.runtime.sendMessage({
          source: "gorbag-ui",
          method: "get-pending-connection",
        });
      } catch (error) {
        console.error("Error fetching pending connection:", error);
      }

      if (connRequest) {
        showConnectionRequest(connRequest as DappConnectionRequest);
        setIsReady(true);
      } else {
        // If we are here, there are no pending transactions or connections
        window.close();
      }
    };

    fetchRequests();
  }, [showConnectionRequest]);

  useEffect(() => {
    if (pendingTransaction) {
      const parseTransaction = async () => {
        try {
          const solanaWeb3 = await import("@solana/web3.js");
          const Transaction = solanaWeb3.Transaction;
          const VersionedTransaction = solanaWeb3.VersionedTransaction;
          const SystemProgram = solanaWeb3.SystemProgram;
          const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;
          
          const txBuffer = Buffer.from(pendingTransaction.transaction, 'base64');
          let transaction;
          try {
            transaction = VersionedTransaction.deserialize(txBuffer);
          } catch (e) {
            transaction = Transaction.from(txBuffer);
          }

          // For now, we only support simple transfers in the detailed view
          const details: ParsedTransactionDetails = {
            isTransfer: false,
            amount: null,
            recipient: null,
          };

          const instructions = ('version' in transaction) ? transaction.message.instructions : transaction.instructions;

          for (const instruction of instructions) {
            if (instruction.programId && SystemProgram && SystemProgram.programId && instruction.programId.equals(SystemProgram.programId)) {
              try {
                const decoded = SystemProgram.decodeTransfer(instruction);
                details.isTransfer = true;
                details.amount = decoded.lamports / LAMPORTS_PER_SOL;
                details.recipient = decoded.toPubkey.toBase58();
                break; // Assume only one transfer per transaction for now
              } catch (e) {
                // Not a transfer instruction
              }
            }
          }
          setParsedDetails(details);
        } catch (error) {
          console.error("Error parsing transaction:", error);
        }
      };
      parseTransaction();
    }
  }, [pendingTransaction]);

  if (!isReady || (!pendingRequest && !pendingTransaction)) {
    return null;
  }

  const handleSwitchWallet = () => {
    setView('manage-wallets');
  };

  const handleWalletSelected = () => {
    setView(isTransactionView ? 'approve-transaction' : 'connect');
  };
  
  const resolveRequest = async (approved: boolean) => {
    try {
      if (isTransactionView) {
        if (approved) {
          if (isLocked) {
            setSigningError("Wallet is locked. Please unlock to sign.");
            return;
          }
          try {
            console.log("[confirm-page.tsx] resolveRequest: pending transaction", pendingTransaction.transaction);
            const { Transaction, VersionedTransaction } = await import("@solana/web3.js");
            const txBuffer = Buffer.from(pendingTransaction.transaction, 'base64');
            
            let transaction;
            try {
              transaction = VersionedTransaction.deserialize(txBuffer);
              console.log("[confirm-page.tsx] resolveRequest: deserialized as VersionedTransaction");
            } catch (e) {
              transaction = Transaction.from(txBuffer);
              console.log("[confirm-page.tsx] resolveRequest: deserialized as Legacy Transaction");
            }

            console.log("[confirm-page.tsx] resolveRequest: deserialized transaction", transaction);

            const signedTx = await signTransaction(transaction);
            console.log("[confirm-page.tsx] resolveRequest: signed transaction", signedTx);

            const serializedSignedTx = Buffer.from(signedTx.serialize()).toString('base64');
            console.log("[confirm-page.tsx] resolveRequest: serialized signed transaction", serializedSignedTx);
            
            // Get the transaction signature to store in the backend
            const txSignature = bs58.encode(signedTx.signature);
            
            await chrome.runtime.sendMessage({
              source: "gorbag-ui",
              method: "resolve-pending-request",
              params: { 
                approved: true, 
                type: "transaction",
                signedTransaction: serializedSignedTx
              }
            });

            // Call the background script to store the transaction in the backend
            // Don't wait for this to complete, just fire and forget
            chrome.runtime.sendMessage({
              source: "gorbag-ui",
              method: "store-transaction",
              params: { transactionHash: txSignature, userPublicKey: pendingTransaction.walletAddress }
            }).then(response => {
              if (response && response.success) {
                console.log("DApp transaction stored successfully in backend:", txSignature);
              } else {
                console.error("Failed to store DApp transaction in backend:", response?.error);
              }
            }).catch(error => {
              console.error("Error calling background script to store DApp transaction:", error);
            });

          } catch (error) {
            console.error("Error signing transaction:", error);
            setSigningError(error.message || "An unknown error occurred during signing.");
            return; // Don't close window if signing fails
          }
        } else {
          await chrome.runtime.sendMessage({
            source: "gorbag-ui",
            method: "resolve-pending-request",
            params: { approved: false, type: "transaction" }
          });
        }
      } else { // connection request
        await chrome.runtime.sendMessage({
          source: "gorbag-ui",
          method: "resolve-pending-request",
          params: { approved, type: "connection" }
        });
      }
      window.close();
    } catch (error) {
      console.error("Error resolving request:", error);
    }
  };

  const ApproveTransactionView = () => {
    if (!pendingTransaction) return null;

    return (
      <div className="plasmo-w-full">
        <div className="plasmo-text-center plasmo-mb-6">
          <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-2">Sign Transaction</h2>
          <p className="plasmo-text-muted-foreground">Review and approve this transaction</p>
        </div>

        <div className="plasmo-border plasmo-border-gray-200 plasmo-rounded-xl plasmo-p-4 plasmo-mb-6 plasmo-bg-card">
          <h3 className="plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-text-sm">DApp Details</h3>
          <div className="plasmo-text-sm plasmo-text-muted-foreground">
            <div className="plasmo-mb-1"><span className="plasmo-font-medium">Name:</span> {pendingTransaction.dAppMetadata.name}</div>
            <div><span className="plasmo-font-medium">Origin:</span> {pendingTransaction.dAppMetadata.origin}</div>
          </div>
        </div>

        <div className="plasmo-border plasmo-border-gray-200 plasmo-rounded-xl plasmo-p-4 plasmo-mb-6 plasmo-bg-card">
          <h3 className="plasmo-font-medium plasmo-text-foreground plasmo-mb-2 plasmo-text-sm">Transaction Details</h3>
          <div className="plasmo-text-sm plasmo-text-muted-foreground">
            <div className="plasmo-mb-2"><span className="plasmo-font-medium">From:</span> <AddressDisplay address={pendingTransaction.walletAddress} /></div>
            {parsedDetails?.isTransfer ? (
              <>
                <div className="plasmo-mb-1"><span className="plasmo-font-medium">Amount:</span> {parsedDetails.amount} SOL</div>
                <div><span className="plasmo-font-medium">Recipient:</span> <AddressDisplay address={parsedDetails.recipient} /></div>
              </>
            ) : (
              <div className="plasmo-bg-muted plasmo-rounded-lg plasmo-p-3 plasmo-mt-2">
                <div className="plasmo-text-xs plasmo-text-muted-foreground plasmo-overflow-auto" style={{ maxHeight: '150px' }}>
                  <pre className="plasmo-whitespace-pre-wrap"><code>{JSON.stringify(pendingTransaction.transaction, null, 2)}</code></pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {signingError && (
          <div className="plasmo-bg-destructive/10 plasmo-rounded-lg plasmo-p-3 plasmo-text-destructive plasmo-text-sm plasmo-mb-4">
            {signingError}
          </div>
        )}

        <div className="plasmo-flex plasmo-gap-3">
          <button
            onClick={() => resolveRequest(false)}
            className="plasmo-flex-1 plasmo-py-3 plasmo-rounded-xl plasmo-font-medium plasmo-text-destructive hover:plasmo-bg-destructive/10"
          >
            Reject
          </button>
          <button
            onClick={() => resolveRequest(true)}
            className="plasmo-flex-1 plasmo-bg-indigo-600 hover:plasmo-bg-indigo-700 plasmo-text-white plasmo-py-3 plasmo-rounded-xl plasmo-font-medium"
          >
            Approve
          </button>
        </div>
      </div>
    );
  };
  
  if (view === 'manage-wallets') {
    return <WalletManagement onWalletSelected={handleWalletSelected} onBack={() => setView(isTransactionView ? 'approve-transaction' : 'connect')} />;
  }

  if (view === 'approve-transaction') {
    return (
      <div className="plasmo-fixed plasmo-inset-0 plasmo-z-50 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-bg-black/50 plasmo-p-4">
        <div className="plasmo-bg-card plasmo-rounded-2xl plasmo-p-6 plasmo-max-w-md plasmo-w-full plasmo-relative plasmo-shadow-xl">
          <ApproveTransactionView />
        </div>
      </div>
    );
  }

  return (
    <DappConnectionModal 
      isOpen={!!pendingRequest}
      request={pendingRequest}
      onApprove={() => resolveRequest(true)}
      onReject={() => resolveRequest(false)}
      onSwitchWallet={handleSwitchWallet}
    />
  );
}

import { DappConnectionProvider } from "../features/dapp-connection/context";
import { I18nProvider } from "../i18n/context";

import { useWallet } from "../lib/wallet-context";

function ConditionalWrapper() {
  const { isLocked } = useWallet();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if there are any pending requests when component loads
    (async () => {
      let hasRequest = false;
      try {
        const txRequest = await chrome.runtime.sendMessage({
          source: "gorbag-ui",
          method: "get-pending-transaction",
        });
        if (txRequest && txRequest.transaction) {
          hasRequest = true;
        }
      } catch (e) {}
      
      if (!hasRequest) {
        try {
          const connRequest = await chrome.runtime.sendMessage({
            source: "gorbag-ui", 
            method: "get-pending-connection",
          });
          if (connRequest) {
            hasRequest = true;
          }
        } catch (e) {}
      }
      
      if (!hasRequest) {
        // Close window if no pending requests
        window.close();
      } else {
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) {
    return null;
  }

  if (isLocked) {
    // If wallet is locked, show only the lock screen
    return <WalletLockScreen />;
  }

  // Otherwise show the normal confirmation flow
  return <ConfirmationPageContent />;
}

export default function ConfirmationPage() {
  return (
    <I18nProvider>
      <DappConnectionProvider>
        <WalletProvider>
          <ConditionalWrapper />
        </WalletProvider>
      </DappConnectionProvider>
    </I18nProvider>
  );
}