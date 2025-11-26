import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';
import { donationService } from '../services/donation.service';

interface UseDonationsProps {
  projectId?: string;
  autoRefresh?: boolean;
}

export function useDonations({ projectId, autoRefresh = true }: UseDonationsProps = {}) {
  const [donations, setDonations] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDonating, setIsDonating] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      if (projectId) {
        // Obtener donaciones específicas de un proyecto
        const response = await fetch(`https://greentech-hub1-2.onrender.com/api/projects/${projectId}`);
        const data = await response.json();
        setDonations(data.donations || []);
      } else {
        // Obtener transacciones del usuario actual
        const response = await donationService.getMyTransactions();
        const allDonations = [...(response.made || []), ...(response.received || [])];
        setDonations(allDonations as any);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar las donaciones');
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const makeDonation = async (projectId: string, amount: string, toAddress: string) => {
    try {
      setIsDonating(true);
      setError(null);
      const response = await donationService.makeDonation(projectId, amount, toAddress);
      setDonations(prev => [...prev, response.transaction]);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al realizar la donación';
      setError(errorMsg);
      throw err;
    } finally {
      setIsDonating(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    if (autoRefresh) {
      // Refresh donations every 30 seconds
      const interval = setInterval(fetchDonations, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchDonations, autoRefresh]);

  return {
    donations,
    isLoading,
    error,
    makeDonation,
    isDonating,
    refreshDonations: fetchDonations
  };
}