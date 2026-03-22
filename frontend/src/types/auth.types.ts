export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'donor' | 'creator';
  creatorValidation?: {
    country?: string;
    organizationName?: string;
    governmentId?: string;
    website?: string;
    verificationDocumentUrl?: string;
  };
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
  _id?: string;
  id: string;
  email: string;
  name: string;
  role: 'donor' | 'creator' | 'admin';
  walletAddress?: string;
  walletConnected: boolean;
  createdAt: string;
  updatedAt: string;
}