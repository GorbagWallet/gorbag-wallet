import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/lib/wallet-context";
import { CopyToClipboard } from "~/components/copy-to-clipboard"; // Assuming you have this component

interface WalletManagementPageProps {
  walletId?: string;
  onBack: () => void;
}

export function WalletManagementPage({ walletId, onBack }: WalletManagementPageProps) {
  const { wallets, updateWallet, deleteWallet } = useWallet();
  const wallet = wallets.find(w => w.id === walletId);

  if (!wallet) {
    return (
      <div className="plasmo-p-4">
        <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
          <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
          Back
        </button>
        <p>Wallet not found.</p>
      </div>
    );
  }

  const handleRename = (newName: string) => {
    updateWallet({ ...wallet, nickname: newName });
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove wallet '${wallet.nickname}'?`)) {
      deleteWallet(wallet.id);
      onBack(); // Go back to dashboard after removal
    }
  };

  return (
    <div className="plasmo-p-4">
      <button onClick={onBack} className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-muted-foreground hover:plasmo-text-foreground plasmo-mb-6">
        <ChevronLeft className="plasmo-h-4 plasmo-w-4" />
        Back
      </button>

      <h2 className="plasmo-text-2xl plasmo-font-bold plasmo-text-foreground plasmo-mb-4">{wallet.nickname}</h2>

      <div className="plasmo-space-y-4">
        <div>
          <p className="plasmo-text-muted-foreground plasmo-text-sm">Address</p>
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-muted plasmo-p-2 plasmo-rounded-md">
            <span className="plasmo-font-mono plasmo-text-sm plasmo-flex-1 plasmo-truncate">{wallet.address}</span>
            <CopyToClipboard text={wallet.address} />
          </div>
        </div>

        {/* Rename Nickname (Placeholder for now) */}
        <div>
          <p className="plasmo-text-muted-foreground plasmo-text-sm">Nickname</p>
          <input
            type="text"
            value={wallet.nickname}
            onChange={(e) => handleRename(e.target.value)}
            className="plasmo-w-full plasmo-bg-muted plasmo-p-2 plasmo-rounded-md plasmo-text-foreground"
          />
        </div>

        {/* See Private Key (Disabled) */}
        <div>
          <p className="plasmo-text-muted-foreground plasmo-text-sm">Private Key</p>
          <div className="plasmo-bg-muted plasmo-p-2 plasmo-rounded-md plasmo-text-muted-foreground">
            <span className="plasmo-font-mono plasmo-text-sm">************************************************************</span>
            <Button variant="ghost" size="sm" className="plasmo-ml-2" disabled>Show</Button>
          </div>
        </div>

        <Button variant="destructive" onClick={handleRemove} className="plasmo-w-full">
          Remove Wallet
        </Button>
      </div>
    </div>
  );
}
