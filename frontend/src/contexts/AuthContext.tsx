import { createContext } from 'react';
import type { User, RegisterData } from '../types/auth.types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loginWithWallet: () => Promise<void>;
  linkWallet: (address: string) => Promise<void>;
  unlinkWallet: () => Promise<void>;
  connectFreighter: () => Promise<void>;
  isAuthenticated: boolean;
  walletAddress?: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthContextProps {
  children: React.ReactNode;
}
