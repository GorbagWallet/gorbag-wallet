export const networks = {
  gorbagana: {
    rpc: "https://rpc.gorbagana.wtf",
    explorer: "https://trashscan.io/tx/",
    network: "testnet",
  },
  solana: {
    rpc: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY || ''},
    explorer: "https://solscan.io/tx/", // Using a consistent format
    network: "mainnet-beta",
  },
};
