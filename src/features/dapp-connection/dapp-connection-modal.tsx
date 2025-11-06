import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { X, Globe, Wallet } from "lucide-react";

interface DappConnectionRequest {
  origin: string;
  name?: string;
  icon?: string;
  url?: string;
  message?: string;
}

interface DappConnectionModalProps {
  isOpen: boolean;
  request: DappConnectionRequest | null;
  onApprove: () => void;
  onReject: () => void;
  onSwitchWallet: () => void; // New prop
}

export function DappConnectionModal({
  isOpen,
  request,
  onApprove,
  onReject,
  onSwitchWallet // Destructure new prop
}: DappConnectionModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  if (!showModal || !request) {
    return null;
  }

  const dappName = request.name || new URL(request.origin).hostname;
  const dappIcon = request.icon || `https://www.google.com/s2/favicons?domain=${request.origin}`;
  
  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-z-50 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-bg-black/50">
      <div className="plasmo-bg-card plasmo-rounded-2xl plasmo-p-6 plasmo-max-w-md plasmo-w-full plasmo-mx-4 plasmo-relative">
        <button 
          onClick={onReject}
          className="plasmo-absolute plasmo-top-4 plasmo-right-4 plasmo-p-1 plasmo-rounded-full plasmo-hover:plasmo-bg-muted plasmo-transition-colors"
          aria-label="Close"
        >
          <X className="plasmo-h-5 plasmo-w-5 plasmo-text-muted-foreground" />
        </button>

        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-text-center plasmo-mb-6">
          <div className="plasmo-w-16 plasmo-h-16 plasmo-rounded-full plasmo-bg-primary/10 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mb-4">
            {request.icon ? (
              <img 
                src={request.icon} 
                alt={dappName} 
                className="plasmo-w-10 plasmo-h-10 plasmo-rounded-full"
              />
            ) : (
              <Globe className="plasmo-h-10 plasmo-w-10 plasmo-text-primary" />
            )}
          </div>
          
          <h2 className="plasmo-text-xl plasmo-font-semibold plasmo-text-foreground plasmo-mb-2">
            Connect to {dappName}
          </h2>
          
          <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-text-sm plasmo-text-muted-foreground plasmo-mb-4">
            <Globe className="plasmo-h-4 plasmo-w-4 plasmo-mr-1" />
            <span>{request.origin}</span>
          </div>
          
          <p className="plasmo-text-sm plasmo-text-muted-foreground">
            This dApp wants to connect to your wallet to enable blockchain interactions.
          </p>
        </div>

        <div className="plasmo-bg-muted plasmo-rounded-xl plasmo-p-4 plasmo-mb-6">
          <div className="plasmo-flex plasmo-items-center plasmo-mb-3">
            <Wallet className="plasmo-h-5 plasmo-w-5 plasmo-text-primary plasmo-mr-2" />
            <h3 className="plasmo-font-medium plasmo-text-foreground">What this allows</h3>
          </div>
          <ul className="plasmo-text-sm plasmo-text-muted-foreground plasmo-space-y-1">
            <li className="plasmo-flex plasmo-items-start">
              <span className="plasmo-mr-2">•</span>
              <span>View your wallet address and account balance</span>
            </li>
            <li className="plasmo-flex plasmo-items-start">
              <span className="plasmo-mr-2">•</span>
              <span>Request transaction signatures</span>
            </li>
            <li className="plasmo-flex plasmo-items-start">
              <span className="plasmo-mr-2">•</span>
              <span>Sign messages when needed</span>
            </li>
          </ul>
        </div>

        <div className="plasmo-flex plasmo-flex-col sm:plasmo-flex-row plasmo-gap-3">
          <Button
            variant="outline"
            className="plasmo-flex-1 plasmo-h-12"
            onClick={onReject}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            className="plasmo-flex-1 plasmo-h-12"
            onClick={onSwitchWallet}
          >
            Switch Wallet
          </Button>
          <Button
            className="plasmo-flex-1 plasmo-h-12"
            onClick={onApprove}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}