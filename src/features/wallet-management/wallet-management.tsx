import React from 'react';
import { Button } from '~/components/ui/button';
import { useWallet, Wallet } from '~/lib/wallet-context';

interface WalletManagementProps {
  onWalletSelected: (walletId: string) => void;
  onBack: () => void;
}

export function WalletManagement({ onWalletSelected, onBack }: WalletManagementProps) {
  const { wallets, activeWallet, setActiveWallet } = useWallet();

  const handleSelectWallet = (wallet: Wallet) => {
    setActiveWallet(wallet);
    onWalletSelected(wallet.id);
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-h-full plasmo-p-4 plasmo-bg-card">
      <h2 className="plasmo-text-lg plasmo-font-medium plasmo-mb-4">Switch Wallet</h2>
      <div className="plasmo-flex-grow plasmo-overflow-y-auto">
        {wallets.map((wallet) => (
          <div 
            key={wallet.id}
            className={`plasmo-flex plasmo-items-center plasmo-p-3 plasmo-rounded-lg plasmo-mb-2 plasmo-cursor-pointer hover:plasmo-bg-muted ${activeWallet?.id === wallet.id ? 'plasmo-bg-muted' : ''}`}
            onClick={() => handleSelectWallet(wallet)}
          >
            <div className="plasmo-flex-grow">
              <div className="plasmo-font-medium">{wallet.nickname}</div>
              <div className="plasmo-text-sm plasmo-text-muted-foreground">{`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}</div>
            </div>
            {activeWallet?.id === wallet.id && (
              <div className="plasmo-w-2 plasmo-h-2 plasmo-bg-green-500 plasmo-rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      <Button onClick={onBack} variant="outline" className="plasmo-mt-4">Back to Connection</Button>
    </div>
  );
}
