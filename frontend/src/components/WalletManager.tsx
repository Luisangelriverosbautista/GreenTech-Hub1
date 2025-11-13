import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const WalletManager = () => {
  const auth = useAuth();
  const address = auth.user?.walletAddress;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Connect using Freighter via auth context
      await auth.connectFreighter();
      
      console.log('Wallet conectada:', address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar la wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await auth.unlinkWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desconectar la wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Wallet</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {address ? (
        <div>
          <p className="text-gray-600 mb-2">Wallet conectada: {address}</p>
          <button
            onClick={handleDisconnectWallet}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Desconectando...' : 'Desconectar Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">No hay wallet conectada</p>
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Conectando...' : 'Conectar Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};