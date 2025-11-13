import api from './api';
import type { Transaction } from '../types';

class TransactionService {
  async getProjectTransactions(projectId: string): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(`/projects/${projectId}/transactions`);
    return response.data;
  }

  async getUserTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions/me');
    return response.data;
  }

  async createTransaction(projectId: string, amount: number): Promise<Transaction> {
    const response = await api.post<Transaction>(`/projects/${projectId}/transactions`, {
      amount
    });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  }
}

export default new TransactionService();