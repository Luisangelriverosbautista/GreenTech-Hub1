import { useState, useEffect, useCallback } from 'react';
import { donationService } from '../services/donation.service';

interface Donation {
  _id: string;
  type: string;
  amount: string;
  from: {
    _id: string;
    username: string;
    walletAddress: string;
  };
  to: {
    _id: string;
    username: string;
    walletAddress: string;
  };
  project: {
    _id: string;
    title: string;
  };
  status: string;
  txHash: string;
  createdAt: string;
  updatedAt: string;
}

interface UserDonationStats {
  made: Donation[];
  received: Donation[];
  totalMade: number;
  totalReceived: number;
  isLoading: boolean;
  error: string | null;
}

export function useDonationsByRole(): UserDonationStats {
  const [made, setMade] = useState<Donation[]>([]);
  const [received, setReceived] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await donationService.getMyTransactions();
      
      setMade(response.made || []);
      setReceived(response.received || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Error al cargar las donaciones');
      setMade([]);
      setReceived([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDonations, 30000);
    return () => clearInterval(interval);
  }, [fetchDonations]);

  const totalMade = made.reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount || 0), 0);
  const totalReceived = received.reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount || 0), 0);

  return {
    made,
    received,
    totalMade,
    totalReceived,
    isLoading,
    error
  };
}
