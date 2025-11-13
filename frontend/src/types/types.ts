export type UserRole = 'donor' | 'creator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  walletConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface WalletInfo {
  address: string;
  connected: boolean;
}