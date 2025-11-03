import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionSignature,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";

export async function getBalance(address: string, rpcUrl: string): Promise<number> {
  try {
    const connection = new Connection(rpcUrl);
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export async function getWalletTokens(address: string, heliusApiKey: string) {
  const url = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'fungible',
        },
      }),
    });
    const { result } = await response.json();
    return result.items;
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return [];
  }
}

export async function getTransactionHistory(
  address: string,
  rpcUrl: string,
  limit: number = 10
): Promise<TransactionSignature[]> {
  try {
    const connection = new Connection(rpcUrl);
    const publicKey = new PublicKey(address);
    
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: limit,
    });
    
    return signatures;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}

export async function getTransactionDetails(
  signature: string,
  rpcUrl: string
): Promise<ParsedTransactionWithMeta | null> {
  try {
    const connection = new Connection(rpcUrl);
    const transaction = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });
    
    return transaction;
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return null;
  }
}

// Helper function to decode System Program transfer instruction data
function decodeSystemTransferData(data: string | number[]): number {
  try {
    let dataBytes: Uint8Array;
    
    if (typeof data === 'string') {
      // Base58 encoded data
      dataBytes = Buffer.from(data, 'base64');
    } else {
      dataBytes = new Uint8Array(data);
    }
    
    // System Program Transfer instruction format:
    // [0-3]: instruction discriminator (2 for transfer)
    // [4-11]: amount (u64 little-endian)
    if (dataBytes.length >= 12 && dataBytes[0] === 2) {
      // Read u64 little-endian from bytes 4-11
      let amount = 0;
      for (let i = 0; i < 8; i++) {
        amount += dataBytes[4 + i] * Math.pow(256, i);
      }
      return amount;
    }
    
    return 0;
  } catch (error) {
    console.error("Error decoding system transfer data:", error);
    return 0;
  }
}

// Helper function to decode SPL Token transfer instruction data
function decodeSplTokenTransferData(data: string | number[]): number {
  try {
    let dataBytes: Uint8Array;
    
    if (typeof data === 'string') {
      dataBytes = Buffer.from(data, 'base64');
    } else {
      dataBytes = new Uint8Array(data);
    }
    
    // SPL Token Transfer instruction format:
    // [0]: instruction discriminator (3 for transfer)
    // [1-8]: amount (u64 little-endian)
    if (dataBytes.length >= 9 && dataBytes[0] === 3) {
      let amount = 0;
      for (let i = 0; i < 8; i++) {
        amount += dataBytes[1 + i] * Math.pow(256, i);
      }
      return amount;
    }
    
    return 0;
  } catch (error) {
    console.error("Error decoding SPL token transfer data:", error);
    return 0;
  }
}

interface TransactionActivity {
  type: "sent" | "received" | "unknown";
  tokenSymbol: string;
  amount: string;
  counterparty: string;
  fee: number;
  tokenMint?: string;
  decimals?: number;
}

export function parseTransactionForActivity(
  transaction: ParsedTransactionWithMeta | null, 
  walletAddress: string,
  network: "gorbagana" | "solana"
): TransactionActivity {
  if (!transaction || !transaction.meta) {
    return {
      type: "unknown",
      tokenSymbol: network === "gorbagana" ? "GOR" : "SOL",
      amount: "0.00",
      counterparty: "Unknown",
      fee: 0
    };
  }

  const defaultTokenSymbol = network === "gorbagana" ? "GOR" : "SOL";
  const fee = transaction.meta.fee || 0;
  const message = transaction.transaction.message;
  
  // Get account keys from both parsed and unparsed formats
  const accountKeys = message.accountKeys.map((key: any) => {
    if (typeof key === 'string') return key;
    if (key.pubkey) return key.pubkey.toString();
    return key.toString();
  });

  // Check pre and post token balances for SPL token transfers
  const preTokenBalances = transaction.meta.preTokenBalances || [];
  const postTokenBalances = transaction.meta.postTokenBalances || [];
  
  // Try to detect SPL token transfers first
  for (let i = 0; i < preTokenBalances.length; i++) {
    const preBalance = preTokenBalances[i];
    const postBalance = postTokenBalances.find(
      (post: any) => post.accountIndex === preBalance.accountIndex
    );
    
    if (postBalance) {
      const preAmount = parseInt(preBalance.uiTokenAmount.amount);
      const postAmount = parseInt(postBalance.uiTokenAmount.amount);
      const diff = postAmount - preAmount;
      
      if (diff !== 0) {
        const accountIndex = preBalance.accountIndex;
        const tokenAccount = accountKeys[accountIndex];
        const decimals = preBalance.uiTokenAmount.decimals;
        const mint = preBalance.mint;
        
        // Check if this wallet owns the token account
        const accountInfo = message.accountKeys[accountIndex];
        const owner = accountInfo?.owner || accountInfo;
        
        if (diff > 0) {
          // Received tokens
          // Find sender by looking at other token accounts
          let sender = "Unknown";
          for (const otherBalance of preTokenBalances) {
            if (otherBalance.accountIndex !== accountIndex && otherBalance.mint === mint) {
              const otherPost = postTokenBalances.find(
                (p: any) => p.accountIndex === otherBalance.accountIndex
              );
              if (otherPost) {
                const otherDiff = parseInt(otherPost.uiTokenAmount.amount) - 
                                 parseInt(otherBalance.uiTokenAmount.amount);
                if (otherDiff < 0) {
                  sender = accountKeys[otherBalance.accountIndex];
                  break;
                }
              }
            }
          }
          
          return {
            type: "received",
            tokenSymbol: preBalance.uiTokenAmount.symbol || "TOKEN",
            amount: (Math.abs(diff) / Math.pow(10, decimals)).toFixed(decimals),
            counterparty: sender,
            fee: fee,
            tokenMint: mint,
            decimals: decimals
          };
        } else {
          // Sent tokens
          let recipient = "Unknown";
          for (const otherBalance of preTokenBalances) {
            if (otherBalance.accountIndex !== accountIndex && otherBalance.mint === mint) {
              const otherPost = postTokenBalances.find(
                (p: any) => p.accountIndex === otherBalance.accountIndex
              );
              if (otherPost) {
                const otherDiff = parseInt(otherPost.uiTokenAmount.amount) - 
                                 parseInt(otherBalance.uiTokenAmount.amount);
                if (otherDiff > 0) {
                  recipient = accountKeys[otherBalance.accountIndex];
                  break;
                }
              }
            }
          }
          
          return {
            type: "sent",
            tokenSymbol: preBalance.uiTokenAmount.symbol || "TOKEN",
            amount: (Math.abs(diff) / Math.pow(10, decimals)).toFixed(decimals),
            counterparty: recipient,
            fee: fee,
            tokenMint: mint,
            decimals: decimals
          };
        }
      }
    }
  }

  // Check SOL/GOR balance changes
  const preBalances = transaction.meta.preBalances || [];
  const postBalances = transaction.meta.postBalances || [];
  
  // Find wallet's balance change
  const walletIndex = accountKeys.findIndex(addr => addr === walletAddress);
  
  if (walletIndex !== -1) {
    const preBalance = preBalances[walletIndex] || 0;
    const postBalance = postBalances[walletIndex] || 0;
    const balanceChange = postBalance - preBalance;
    
    // Account for fees (sender pays fees)
    const netChange = balanceChange + (balanceChange < 0 ? fee : 0);
    
    if (netChange !== 0 && Math.abs(netChange) > fee) {
      const amount = Math.abs(netChange) / LAMPORTS_PER_SOL;
      
      if (netChange > 0) {
        // Received SOL/GOR - find sender
        let sender = "Unknown";
        for (let i = 0; i < accountKeys.length; i++) {
          if (i !== walletIndex) {
            const otherPreBalance = preBalances[i] || 0;
            const otherPostBalance = postBalances[i] || 0;
            const otherChange = otherPostBalance - otherPreBalance;
            
            // If another account decreased, they're likely the sender
            if (otherChange < 0 && Math.abs(otherChange) >= Math.abs(netChange)) {
              sender = accountKeys[i];
              break;
            }
          }
        }
        
        return {
          type: "received",
          tokenSymbol: defaultTokenSymbol,
          amount: amount.toFixed(6),
          counterparty: sender,
          fee: fee
        };
      } else {
        // Sent SOL/GOR - find recipient
        let recipient = "Unknown";
        for (let i = 0; i < accountKeys.length; i++) {
          if (i !== walletIndex) {
            const otherPreBalance = preBalances[i] || 0;
            const otherPostBalance = postBalances[i] || 0;
            const otherChange = otherPostBalance - otherPreBalance;
            
            // If another account increased, they're likely the recipient
            if (otherChange > 0 && otherChange >= Math.abs(netChange)) {
              recipient = accountKeys[i];
              break;
            }
          }
        }
        
        return {
          type: "sent",
          tokenSymbol: defaultTokenSymbol,
          amount: amount.toFixed(6),
          counterparty: recipient,
          fee: fee
        };
      }
    }
  }

  // Fallback: parse instructions manually
  const instructions = message.instructions;
  
  for (const instruction of instructions) {
    try {
      const programId = typeof instruction.programId === 'string' 
        ? instruction.programId 
        : instruction.programId?.toString();
      
      // System Program transfer (SOL/GOR)
      if (programId === "11111111111111111111111111111111") {
        // Check if this is a parsed instruction
        if ('parsed' in instruction && instruction.parsed) {
          const parsed = instruction.parsed;
          if (parsed.type === 'transfer') {
            const info = parsed.info;
            const source = info.source;
            const destination = info.destination;
            const lamports = info.lamports;
            
            if (source === walletAddress) {
              return {
                type: "sent",
                tokenSymbol: defaultTokenSymbol,
                amount: (lamports / LAMPORTS_PER_SOL).toFixed(6),
                counterparty: destination,
                fee: fee
              };
            } else if (destination === walletAddress) {
              return {
                type: "received",
                tokenSymbol: defaultTokenSymbol,
                amount: (lamports / LAMPORTS_PER_SOL).toFixed(6),
                counterparty: source,
                fee: fee
              };
            }
          }
        }
      }
      
      // SPL Token Program transfer
      if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
        if ('parsed' in instruction && instruction.parsed) {
          const parsed = instruction.parsed;
          if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
            const info = parsed.info;
            const source = info.source;
            const destination = info.destination;
            const amount = info.amount || info.tokenAmount?.amount;
            const decimals = info.decimals || info.tokenAmount?.decimals || 0;
            
            // Find if wallet owns source or destination
            // This requires checking token account ownership
            if (source === walletAddress) {
              return {
                type: "sent",
                tokenSymbol: info.tokenAmount?.symbol || "TOKEN",
                amount: (parseInt(amount) / Math.pow(10, decimals)).toFixed(decimals),
                counterparty: destination,
                fee: fee
              };
            } else if (destination === walletAddress) {
              return {
                type: "received",
                tokenSymbol: info.tokenAmount?.symbol || "TOKEN",
                amount: (parseInt(amount) / Math.pow(10, decimals)).toFixed(decimals),
                counterparty: source,
                fee: fee
              };
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing instruction:", error);
    }
  }

  // Ultimate fallback
  const feePayer = accountKeys[0];
  const isFeePayer = feePayer === walletAddress;
  
  return {
    type: isFeePayer ? "sent" : "received",
    tokenSymbol: defaultTokenSymbol,
    amount: "0.00",
    counterparty: isFeePayer ? (accountKeys[1] || "Unknown") : feePayer,
    fee: fee
  };
}
