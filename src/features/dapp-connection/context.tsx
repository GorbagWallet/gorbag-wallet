import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { DappConnectionRequest } from "./types";

interface DappConnectionContextType {
  pendingRequest: DappConnectionRequest | null;
  showConnectionRequest: (request: DappConnectionRequest) => void;
  approveConnection: () => void;
  rejectConnection: () => void;
  closeRequest: () => void;
}

const DappConnectionContext = createContext<DappConnectionContextType | undefined>(undefined);

interface DappConnectionProviderProps {
  children: ReactNode;
}

export function DappConnectionProvider({ children }: DappConnectionProviderProps) {
  const [pendingRequest, setPendingRequest] = useState<DappConnectionRequest | null>(null);

  const showConnectionRequest = useCallback((request: DappConnectionRequest) => {
    setPendingRequest(request);
  }, []);

  const approveConnection = useCallback(() => {
    if (pendingRequest) {
      chrome.runtime.sendMessage({
        source: "gorbag-ui",
        method: "resolve-pending-connection",
        params: { approved: true }
      }).then(() => window.close());
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const rejectConnection = useCallback(() => {
    if (pendingRequest) {
      chrome.runtime.sendMessage({
        source: "gorbag-ui",
        method: "resolve-pending-connection",
        params: { approved: false }
      }).then(() => window.close());
      setPendingRequest(null);
    }
  }, [pendingRequest]);

  const closeRequest = useCallback(() => {
    setPendingRequest(null);
  }, []);

  const value: DappConnectionContextType = {
    pendingRequest,
    showConnectionRequest,
    approveConnection,
    rejectConnection,
    closeRequest
  };

  return (
    <DappConnectionContext.Provider value={value}>
      {children}
    </DappConnectionContext.Provider>
  );
}

export function useDappConnection() {
  const context = useContext(DappConnectionContext);
  if (context === undefined) {
    throw new Error("useDappConnection must be used within a DappConnectionProvider");
  }
  return context;
}