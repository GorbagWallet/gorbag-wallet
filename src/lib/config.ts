export const networks = {
  gorbagana: {
    rpc: "https://rpc.gorbagana.wtf",
    explorer: "https://trashscan.io/tx/",
    network: "testnet",
  },
  solana: {
    rpc: `https://mainnet.helius-rpc.com/?api-key=${process.env.PLASMO_PUBLIC_HELIUS_API_KEY || ''}`,
    explorer: "https://solscan.io/tx/",
    network: "mainnet-beta",
  },
};
