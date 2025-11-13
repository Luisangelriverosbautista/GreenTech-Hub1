import type { ContractTransactionParams, SorobanServiceInterface } from '../types/soroban.service.types';
import type { SorobanTransaction } from '../types/soroban';
import axios from 'axios';

class SorobanService implements SorobanServiceInterface {
  private readonly apiUrl: string;
  private readonly headers: { Authorization?: string; 'Content-Type': string };

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.headers = { 'Content-Type': 'application/json' };
  }

  async connectFreighter(): Promise<string> {
    if (typeof window === 'undefined' || !(window as any).freighter) {
      throw new Error('Freighter no está instalado');
    }
    const publicKey = await (window as any).freighter.getPublicKey();
    if (!publicKey) throw new Error('No se pudo obtener la dirección de la wallet');
    return publicKey;
  }

  async contractTransaction(params: ContractTransactionParams): Promise<boolean> {
    if (!params.network?.sorobanRpcUrl) throw new Error('Network RPC URL is required');
    if (!params.contractAddress || !params.method || !params.source) throw new Error('Faltan parámetros requeridos');
    // TODO: Implement contract transaction logic
    return true;
  }

  async getBalance(address: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/wallet/balance/${address}`, { headers: this.headers });
      return response.data.balance || '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Return a default balance if endpoint fails
      return '0';
    }
  }

  async getTransactionHistory(address: string): Promise<SorobanTransaction[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/transactions/${address}`, { headers: this.headers });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Return empty array if endpoint fails
      return [];
    }
  }

  async makeDonation(fromAddress: string, toAddress: string, amount: string): Promise<SorobanTransaction> {
    const response = await axios.post(
      `${this.apiUrl}/api/transactions/donate`,
      { fromAddress, toAddress, amount },
      { headers: this.headers }
    );
    return response.data;
  }

  async signMessage(message: string, privateKey: string): Promise<string> {
    const response = await axios.post(`${this.apiUrl}/api/wallet/sign`, { message, privateKey }, { headers: this.headers });
    return response.data.signature;
  }

  async verifySignature(message: string, signature: string, publicKey: string): Promise<boolean> {
    const response = await axios.post(`${this.apiUrl}/api/wallet/verify`, { message, signature, publicKey }, { headers: this.headers });
    return response.data.isValid;
  }
}

export const sorobanService = new SorobanService();

// legacy named export used across the app — provide a top-level wrapper
export const contractTransaction = async (params: ContractTransactionParams): Promise<boolean> => {
  return sorobanService.contractTransaction(params);
};