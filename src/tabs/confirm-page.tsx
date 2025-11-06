import React, { useEffect, useState } from "react";
import { useDappConnection } from "../features/dapp-connection/context";
import { DappConnectionModal } from "../features/dapp-connection/dapp-connection-modal";
import { DappConnectionRequest } from "../features/dapp-connection/types";
import { WalletManagement } from "../features/wallet-management/wallet-management";
import { WalletProvider } from "../lib/wallet-context";

function ConfirmationPageContent() {
  const { showConnectionRequest, pendingRequest, approveConnection, rejectConnection } = useDappConnection();
  const [isReady, setIsReady] = useState(false);
  const [view, setView] = useState<'connect' | 'manage-wallets'>('connect');

  useEffect(() => {
    chrome.runtime.sendMessage({
      source: "gorbag-ui",
      method: "get-pending-connection"
    }).then(requestData => {
      if (requestData) {
        showConnectionRequest(requestData as DappConnectionRequest);
        setIsReady(true);
      } else {
        window.close();
      }
    }).catch(error => {
      console.error("Error fetching pending connection:", error);
      window.close();
    });
  }, [showConnectionRequest]);

  if (!isReady || !pendingRequest) {
    return null;
  }

  const handleSwitchWallet = () => {
    setView('manage-wallets');
  };

  const handleWalletSelected = () => {
    setView('connect');
  };
  
  if (view === 'manage-wallets') {
    return <WalletManagement onWalletSelected={handleWalletSelected} onBack={() => setView('connect')} />;
  }

  return (
    <DappConnectionModal 
      isOpen={!!pendingRequest}
      request={pendingRequest}
      onApprove={approveConnection}
      onReject={rejectConnection}
      onSwitchWallet={handleSwitchWallet}
    />
  );
}

export default function ConfirmationPage() {
  return (
    <WalletProvider>
      <ConfirmationPageContent />
    </WalletProvider>
  );
}