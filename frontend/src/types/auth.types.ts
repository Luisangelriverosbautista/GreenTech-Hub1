export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'donor' | 'creator';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserWallet {
  address: string;
  balance: string;
}

export interface StellarBalance {
  total: string;
  available: string;
  network: 'testnet' | 'mainnet';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'donor' | 'creator';
  walletAddress?: string;
  walletConnected: boolean;
  createdAt: string;
  updatedAt: string;
}