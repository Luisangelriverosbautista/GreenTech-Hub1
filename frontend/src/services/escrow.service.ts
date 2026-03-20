import api from './api';
import axios from 'axios';

export interface CreateEscrowDonationPayload {
  amount: string;
  donorAddress: string;
  metadata?: Record<string, unknown>;
}

export interface EscrowDonationResponse {
  success: boolean;
  message: string;
  escrow: Escrow;
  transaction: unknown;
  providerResponse: unknown;
}

export interface Escrow {
  _id: string;
  project: string;
  donor: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  };
  creator: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  };
  mode: 'single-release' | 'multi-release';
  trustlessEscrowId: string;
  amountTotal: string;
  amountReleased: string;
  status: 'draft' | 'funded' | 'approved' | 'partially-released' | 'released' | 'disputed' | 'resolved' | 'failed';
  createdAt: string;
}

export interface EscrowActionResponse {
  success: boolean;
  message: string;
  escrow: Escrow;
  providerResponse: unknown;
}

class EscrowService {
  async donateWithEscrow(projectId: string, payload: CreateEscrowDonationPayload): Promise<EscrowDonationResponse> {
    const response = await api.post(`/projects/${projectId}/donate-escrow`, payload);
    return response.data;
  }

  async getProjectEscrows(projectId: string): Promise<{ count: number; escrows: unknown[] }> {
    if (!localStorage.getItem('token')) {
      return { count: 0, escrows: [] };
    }

    try {
      const response = await api.get(`/projects/${projectId}/escrows`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { count: 0, escrows: [] };
      }
      throw error;
    }
  }

  async approveEscrow(escrowId: string, milestoneIndex = 0): Promise<EscrowActionResponse> {
    const response = await api.post(`/escrows/${escrowId}/approve`, { milestoneIndex });
    return response.data;
  }

  async releaseEscrowFunds(escrowId: string, milestoneIndex = 0): Promise<EscrowActionResponse> {
    const response = await api.post(`/escrows/${escrowId}/release`, { milestoneIndex });
    return response.data;
  }
}

export const escrowService = new EscrowService();
