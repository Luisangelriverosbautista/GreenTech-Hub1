import api from './api';
import type { User } from '../types/auth.types';

export interface Web3AuthResponse {
  token: string;
  user: User & {
    walletAddress: string;
  };
}

class Web3AuthService {
  async getNonce(walletAddress: string): Promise<string> {
    const response = await api.get(`/auth/web3/nonce/${walletAddress}`);
    return response.data.nonce;
  }

  async verifySignature(walletAddress: string, signature: string, nonce: string): Promise<Web3AuthResponse> {
    const response = await api.post('/auth/web3/verify', {
      walletAddress,
      signature,
      nonce
    });
    return response.data;
  }

  async linkWallet(userId: string, walletAddress: string, signature: string): Promise<Web3AuthResponse> {
    const response = await api.post('/auth/web3/link', {
      userId,
      walletAddress,
      signature
    });
    return response.data;
  }
}

export const web3AuthService = new Web3AuthService();
