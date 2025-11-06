export interface DappConnectionRequest {
  origin: string;
  name?: string;
  icon?: string;
  url?: string;
  message?: string;
  // Add other fields as needed for different types of requests
  type: 'connect' | 'signTransaction' | 'signMessage' | 'signAllTransactions';
}

export interface Wallet {
  id: string;
  nickname: string;
  address: string;
}