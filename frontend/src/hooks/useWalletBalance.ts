import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { testnetChain } from '../config/soroban';
import type { StellarBalance } from '../types/stellar';

import { Horizon } from '@stellar/stellar-sdk';

// Initialize Horizon server
const server = new Horizon.Server(testnetChain.networkUrl);

export function useWalletBalance() {
  const [balance, setBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const fetchBalance = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        // Use wallet address from user if available
        const walletAddress = user?.walletAddress;
        
        if (walletAddress) {
          console.log('[useWalletBalance] Fetching balance for:', walletAddress?.substring(0, 10) + '...');
          const account = await server.accounts().accountId(walletAddress).call();
          const xlmBalance = account.balances.find(
            (balance: StellarBalance) => balance.asset_type === 'native'
          );
          if (xlmBalance && mounted) {
            console.log('[useWalletBalance] Balance fetched:', xlmBalance.balance);
            setBalance(xlmBalance.balance);
          }
        } else {
          console.log('[useWalletBalance] No wallet address available');
          setBalance("0.00");
        }
      } catch (err) {
        console.error("[useWalletBalance] Error fetching balance:", err);
        if (mounted) {
          setBalance("0.00");
          setError(err instanceof Error ? err.message : 'Error fetching balance');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setError(null); // Clear error on success
        }
      }
    };

    fetchBalance();
    
    // Actualizar el balance cada 30 segundos
    const interval = setInterval(fetchBalance, 30000);
    
    // Cleanup
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.walletAddress]);

  return { balance, isLoading, error };
}