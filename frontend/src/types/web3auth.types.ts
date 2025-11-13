export interface Web3AuthService {
  signMessage: (message: string) => Promise<{ signature: string; walletAddress: string }>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  getNonce: (address: string) => Promise<string>;
  isConnected: boolean;
  walletAddress: string | undefined;
}

export interface Web3AuthContextType {
  signMessage: (message: string) => Promise<{ signature: string; walletAddress: string }>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  getNonce: (address: string) => Promise<string>;
  isConnected: boolean;
  walletAddress: string | undefined;
}