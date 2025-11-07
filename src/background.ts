// This is the background service worker for the extension.
// It listens for messages from content scripts and handles wallet operations.

console.log("Gorbag background script loaded.");

// --- Wallet State ---
// The active wallet state is now managed in chrome.storage.local
// and accessed dynamically.

interface Wallet {
  id: string;
  nickname: string;
  address: string; // This is the public key
  // Add other properties if needed by background script
}

// --- Connection Request Management ---
interface PendingRequest {
  sendResponse: (response: any) => void;
  data: any;
}
let pendingConnection: PendingRequest | null = null;

// Add this interface at the top with other interfaces
interface PendingTransaction {
  sendResponse: (response: any) => void;
  transaction: any;
  dAppMetadata: any;
  walletAddress: string; // Address of wallet that needs to sign
}

// Add this variable with other pending request variables
let pendingTransaction: PendingTransaction | null = null;

async function getActiveWalletFromStorage(): Promise<Wallet | null> {
  try {
    const result = await chrome.storage.local.get(["gorbag_active_wallet", "gorbag_wallets"]);
    let activeWalletId = result.gorbag_active_wallet;
    if (typeof activeWalletId === 'string') {
      activeWalletId = activeWalletId.replace(/"/g, '');
    }
    
    let wallets: Wallet[] = [];
    if (Array.isArray(result.gorbag_wallets)) {
      wallets = result.gorbag_wallets;
    } else if (typeof result.gorbag_wallets === 'string') {
      try {
        wallets = JSON.parse(result.gorbag_wallets);
        if (!Array.isArray(wallets)) {
          wallets = [];
        }
      } catch (e) {
        wallets = [];
      }
    }

    if (!activeWalletId && wallets.length > 0) {
      activeWalletId = wallets[0].id;
      await chrome.storage.local.set({ gorbag_active_wallet: activeWalletId });
    }

    if (activeWalletId && wallets.length > 0) {
      const activeWallet = wallets.find(w => w.id === activeWalletId);
      return activeWallet || null;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving active wallet from storage:", error);
    return null;
  }
}

async function openConfirmationWindow() {
  // You can customize the dimensions and position of the popup.
  const width = 380;
  const height = 620;

  // To center the popup window.
  const lastFocused = await chrome.windows.getLastFocused();
  const top = lastFocused.top ? lastFocused.top + (lastFocused.height! - height) / 2 : 0;
  const left = lastFocused.left ? lastFocused.left + (lastFocused.width! - width) / 2 : 0;

  await chrome.windows.create({
    url: chrome.runtime.getURL("tabs/confirm.html"),
    type: "popup",
    width,
    height,
    top: Math.round(top),
    left: Math.round(left),
  });
}


// --- Main Message Listener ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Accept messages from both content scripts and the confirmation UI
  if (message.source !== "gorbag-content-script" && message.source !== "gorbag-ui") {
    return;
  }

  const { method, params } = message;

  // Handle messages asynchronously if needed
  (async () => {
    switch (method) {
      case "signTransaction":
        // Check if there's already a pending transaction
        if (pendingTransaction) {
          sendResponse({ error: "A transaction signing request is already pending." });
          return;
        }

        // Validate transaction data
        if (!params.transaction || !params.dAppMetadata) {
          sendResponse({ error: "Invalid transaction signing request." });
          return;
        }

        // Get active wallet to verify it exists
        const activeWallet = await getActiveWalletFromStorage();
        if (!activeWallet) {
          sendResponse({ error: "No active wallet available for signing." });
          return;
        }

        // Store the transaction request details
        pendingTransaction = {
          sendResponse,
          transaction: params.transaction,
          dAppMetadata: {
            ...params.dAppMetadata,
            origin: sender.origin // Use sender.origin for security
          },
          walletAddress: activeWallet.address
        };

        // Open the confirmation popup for transaction signing
        await openConfirmationWindow();
        // Don't send response here - it will be sent when user approves/rejects in the popup
        return;

      case "connect":
        // If a request is already pending, reject the new one.
        if (pendingConnection) {
          sendResponse({ error: "A connection request is already pending." });
          return;
        }
        
        // Store the request details and the function to respond with.
        pendingConnection = {
          sendResponse,
          data: {
            ...params.dAppMetadata,
            origin: sender.origin // Use sender.origin for security
          }
        };
        
        // Open the confirmation popup.
        await openConfirmationWindow();
        // No need to send a response here, it will be sent by resolve-pending-connection
        return;

      case "disconnect":
        // For now, disconnect just clears the active wallet state in the dApp's context.
        // The actual active wallet in the extension remains selected.
        // If a dApp disconnects, we don't necessarily want to deselect the user's wallet.
        sendResponse({});
        return;

      case "readyState":
        const currentActiveWallet = await getActiveWalletFromStorage();
        sendResponse({
          isConnected: !!currentActiveWallet,
          publicKey: currentActiveWallet ? currentActiveWallet.address : null,
        });
        return;

      // --- New methods for the confirmation UI ---
      case "get-pending-connection":
        sendResponse(pendingConnection?.data || null);
        return;

      case "get-pending-transaction":
        sendResponse(pendingTransaction || null);
        return;

      case "resolve-pending-request":
        console.log("[background.ts] resolve-pending-request: received", params);
        const { type, approved, signedTransaction } = params;

        if (type === "transaction" && pendingTransaction) {
          if (approved) {
            pendingTransaction.sendResponse({ signedTransaction });
          } else {
            pendingTransaction.sendResponse({ error: "Transaction signing was rejected." });
          }
          pendingTransaction = null; // Clear the pending transaction
        } else if (type === "connection" && pendingConnection) {
            const resolvedActiveWallet = await getActiveWalletFromStorage();
  
            if (approved && resolvedActiveWallet) {
              pendingConnection.sendResponse({ publicKey: resolvedActiveWallet.address });
            } else {
              pendingConnection.sendResponse({ error: "Connection request was rejected by the user." });
            }
            pendingConnection = null; // Clear the request
        }
        sendResponse(true);
        return;

      default:
        console.warn(`Received unhandled method: ${method}`);
        sendResponse({ error: `Method ${method} not implemented.` });
        return;
    }
  })();

  // Return true to indicate that sendResponse will be called asynchronously.
  return true;
});
