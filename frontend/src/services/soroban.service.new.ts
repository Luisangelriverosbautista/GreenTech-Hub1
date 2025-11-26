import axios from 'axios';
import type { WalletChain } from '@soroban-react/types';
import type { SorobanTransaction } from '../types/soroban';

// rely on global types in src/types/freighter.d.ts

interface ContractTransactionParams {
  network: WalletChain;
  contractAddress: string;
  method: string;
  args: any[];
  source: string;
}

class SorobanService {
  private readonly apiUrl: string;
  private readonly headers: { Authorization?: string; 'Content-Type': string };

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://greentech-hub1-2.onrender.com';
    this.headers = { 'Content-Type': 'application/json' };
  }

  async connectFreighter(): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.freighter) {
        throw new Error('Freighter no está instalado');
      }

      const publicKey = await window.freighter.getPublicKey();
      if (!publicKey) {
        throw new Error('No se pudo obtener la dirección de la wallet');
      }

      return publicKey;
    } catch (error) {
      console.error('Error connecting Freighter:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al conectar Freighter');
    }
  }

  async contractTransaction({
    network,
    contractAddress,
    method,
    args,
    source
  }: ContractTransactionParams): Promise<any> {
    try {
      if (!network || !contractAddress || !method || !source) {
        throw new Error('Faltan parámetros requeridos para la transacción');
      }

      const response = await axios.post(
        `${this.apiUrl}/api/soroban/contract/invoke`,
        {
          network,
          contractAddress,
          method,
          args: args || [],
          source
        },
        { 
          headers: this.headers,
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error executing contract transaction:', error);
      throw new Error('Failed to execute contract transaction');
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/wallet/balance/${address}`,
        { headers: this.headers }
      );
      return response.data.balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  async getTransactionHistory(address: string): Promise<SorobanTransaction[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/transactions/${address}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  async makeDonation(fromAddress: string, toAddress: string, amount: string): Promise<SorobanTransaction> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/transactions/donate`,
        {
          fromAddress,
          toAddress,
          amount
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error making donation:', error);
      throw new Error('Failed to make donation');
    }
  }
}

export const sorobanService = new SorobanService();