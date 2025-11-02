import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

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
