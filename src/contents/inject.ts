import type { PlasmoCSConfig } from "plasmo";

// This config tells Plasmo to inject this script into the page's main world.
// This is crucial for bypassing CSP issues and making `window.solana` available.
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN", // Injects into the page's main execution world
};

/**
 * This script is injected into the page context to provide a Solana wallet interface.
 * It creates a `window.solana` object that dApps can use to connect to the Gorbag wallet.
 * It communicates with the extension's background script via the content script bridge.
 *
 * This script should not have any direct access to private keys or sensitive data.
 */
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Buffer } from "buffer";

// A simple EventEmitter to handle wallet events like 'connect' and 'disconnect'.
type Listener = (...args: any[]) => void;
class SimpleEventEmitter {
  private readonly _events: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): this {
    const listeners = this._events.get(event) || [];
    listeners.push(listener);
    this._events.set(event, listeners);
    return this;
  }

  off(event: string, listener: Listener): this {
    const listeners = this._events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this._events.get(event);
    if (listeners && listeners.length > 0) {
      [...listeners].forEach((listener) => listener(...args));
      return true;
    }
    return false;
  }
}

// Helper to check if a transaction is a legacy or versioned transaction.
function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
  return "version" in transaction;
}

class GorbagWalletProvider extends SimpleEventEmitter {
  readonly isGorbag = true;
  #publicKey: PublicKey | null = null;
  #connected = false;
  #nextRequestId = 1;
  #pendingRequests = new Map<
    number,
    { resolve: (value: any) => void; reject: (reason?: any) => void }
  >();

  constructor() {
    super();
    this._setupEventListeners();
    // Announce readiness and check for a persisted connection state.
    this._requestFromExtension("readyState").then((state) => {
      if (state?.connected && state?.publicKey) {
        this.#connected = true;
        this.#publicKey = new PublicKey(state.publicKey);
        this.emit("connect", this.#publicKey);
      }
    });
  }

  // Listens for responses and events from the content script bridge.
  private _setupEventListeners() {
    window.addEventListener("message", (event) => {
      if (
        event.source === window &&
        event.data?.source === "gorbag-extension-response"
      ) {
        const { id, result, error, eventName, eventParams } = event.data;
        // Handle a response to a specific request
        if (id && this.#pendingRequests.has(id)) {
          const { resolve, reject } = this.#pendingRequests.get(id)!;
          this.#pendingRequests.delete(id);
          if (error) {
            reject(new Error(error.message || "An unknown error occurred"));
          } else {
            resolve(result);
          }
        }
        // Handle a general event pushed from the extension
        else if (eventName) {
          this.emit(eventName, ...(eventParams || []));
          if (eventName === "disconnect") {
            this.#connected = false;
            this.#publicKey = null;
          }
        }
      }
    });
  }

  // Sends a request to the background script and returns a promise for the result.
  private _requestFromExtension(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.#nextRequestId++;
      this.#pendingRequests.set(id, { resolve, reject });
      window.postMessage(
        {
          source: "gorbag-injected-script-request",
          method,
          params,
          id,
        },
        "*"
      );
    });
  }

  // --- Wallet Standard Properties ---
  get publicKey(): PublicKey | null {
    return this.#publicKey;
  }

  get connected(): boolean {
    return this.#connected;
  }

  // Backwards compatibility
  get isConnected(): boolean {
    return this.connected;
  }

  // --- Wallet Standard Methods ---
  async connect(options?: any): Promise<{ publicKey: PublicKey }> {
    if (this.connected) {
      return { publicKey: this.#publicKey! };
    }

    // Get dApp metadata
    const dAppMetadata = {
      name: document.title,
      icon: `https://www.google.com/s2/favicons?domain=${window.location.hostname}`,
      origin: window.location.origin
    };

    const result = await this._requestFromExtension("connect", { dAppMetadata, options });

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.publicKey) {
      const publicKey = new PublicKey(result.publicKey);
      this.#publicKey = publicKey;
      this.#connected = true;

      // Emit the standard `change` event so the wallet-adapter can react.
      const accounts = [{
        address: this.#publicKey.toBase58(),
        publicKey: this.#publicKey.toBytes(),
        chains: ["solana:mainnet"], // Assuming this is consistent
        features: [
          "standard:connect",
          "solana:signTransaction",
          "solana:signAllTransactions",
          "solana:signMessage",
        ],
      }];
      this.emit("change", { accounts: accounts });

      // Also emit the legacy `connect` event for older dApps.
      this.emit("connect", publicKey);
      return { publicKey };
    } else {
      // If the user rejected the connection, the background script will send an error.
      // We throw here to ensure the dApp's promise is rejected.
      throw new Error("Connection request was rejected.");
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this._requestFromExtension("disconnect");
      this.#publicKey = null;
      this.#connected = false;

      // Emit the standard `change` event with an empty accounts array.
      this.emit("change", { accounts: [] });

      // Also emit the legacy `disconnect` event.
      this.emit("disconnect");
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    if (!this.connected || !this.publicKey) throw new Error("Not connected");

    const serialized = transaction.serialize();
    const result = await this._requestFromExtension("signTransaction", {
      transaction: Buffer.from(serialized).toString("base64"),
    });

    const signedTxBuffer = Buffer.from(result.signedTransaction, "base64");
    return (
      isVersionedTransaction(transaction)
        ? VersionedTransaction.deserialize(signedTxBuffer)
        : Transaction.from(signedTxBuffer)
    ) as T;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    if (!this.connected || !this.publicKey) throw new Error("Not connected");

    const result = await this._requestFromExtension("signAllTransactions", {
      transactions: transactions.map((tx) =>
        Buffer.from(tx.serialize()).toString("base64")
      ),
    });

    return result.signedTransactions.map((signedTxStr: string, i: number) => {
      const originalTx = transactions[i];
      const signedTxBuffer = Buffer.from(signedTxStr, "base64");
      return (
        isVersionedTransaction(originalTx)
          ? VersionedTransaction.deserialize(signedTxBuffer)
          : Transaction.from(signedTxBuffer)
      ) as T;
    });
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    if (!this.connected || !this.publicKey) throw new Error("Not connected");

    const result = await this._requestFromExtension("signMessage", {
      message: Buffer.from(message).toString("base64"),
    });

    return {
      signature: Buffer.from(result.signature, "base64"),
    };
  }
}

// --- Main Injection Logic ---
console.log("[Gorbag] Inject script loaded.");

// 1. Only inject in the top-level frame.
if (window.parent !== window) {
  console.log("[Gorbag] Aborting injection: not in top-level frame.");
} 
// 2. Don't inject if another wallet (`window.solana`) is already present.
else if (window.solana) {
  console.log("[Gorbag] Aborting injection: window.solana already exists.", window.solana);
} 
// 3. Conditions met, proceed with injection.
else {
  console.log("[Gorbag] Injection conditions met. Defining window.solana...");
  
  const gorbagWallet = new GorbagWalletProvider();

  // --- Create a Wallet Standard-compliant object to register ---

  // 1. Create a valid Data URI for the icon.
  const gorbagIcon = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#2E2E2E"/>
      <text x="50" y="65" font-size="40" fill="white" text-anchor="middle" font-family="monospace">G</text>
    </svg>
  `);

  // 2. Create the object that will be registered with the wallet-adapter.
  const walletStandardApi = {
    version: "1.0.0",
    name: "Gorbag Wallet",
    icon: gorbagIcon,
    get chains() {
      // TODO: Make this dynamic based on the extension's network setting
      return ["solana:mainnet"];
    },
    get accounts() {
      if (!gorbagWallet.publicKey) {
        return [];
      }
      return [{
        address: gorbagWallet.publicKey.toBase58(),
        publicKey: gorbagWallet.publicKey.toBytes(),
        chains: ["solana:mainnet"], // TODO: Make this dynamic
        features: [
          "standard:connect",
          "solana:signTransaction",
          "solana:signAllTransactions",
          "solana:signMessage",
        ],
      }];
    },
    features: {
      "standard:connect": {
        connect: gorbagWallet.connect.bind(gorbagWallet),
      },
      "standard:events": {
        on: gorbagWallet.on.bind(gorbagWallet),
        off: gorbagWallet.off.bind(gorbagWallet),
      },
      "solana:signTransaction": {
        signTransaction: gorbagWallet.signTransaction.bind(gorbagWallet),
      },
      "solana:signAllTransactions": {
        signAllTransactions: gorbagWallet.signAllTransactions.bind(gorbagWallet),
      },
      "solana:signMessage": {
        signMessage: gorbagWallet.signMessage.bind(gorbagWallet),
      },
    },
  };

  // --- Attach to Window for different dApp standards ---

  // For legacy dApps that don't use the wallet-standard
  Object.defineProperty(window, "solana", {
    value: gorbagWallet,
    writable: false,
    configurable: true,
  });

  // Define a Gorbag-specific alias
  Object.defineProperty(window, "gorbag", {
    value: gorbagWallet,
    writable: false,
    configurable: true,
  });

  console.log("[Gorbag] Injection complete. Legacy providers are now defined.");

  // Announce the wallet is ready for dApps to discover (legacy event).
  window.dispatchEvent(new CustomEvent("solana#ready"));

  // Register the wallet with the modern Wallet Standard.
  const registerWallet = () => {
    window.dispatchEvent(
      new CustomEvent("wallet-standard:register-wallet", {
        detail: { get: () => walletStandardApi },
      })
    );
    console.log("[Gorbag] Dispatched 'wallet-standard:register-wallet' event.");
  };
  
  window.addEventListener("wallet-standard:request-register-wallet", registerWallet);
  // Eagerly register the wallet, but defer it to the end of the event loop to give
  // the dApp's listeners a chance to initialize.
  setTimeout(registerWallet, 0);
}
