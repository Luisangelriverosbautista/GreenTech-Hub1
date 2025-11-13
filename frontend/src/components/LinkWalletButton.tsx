import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LinkWalletButton: React.FC = () => {
  const auth = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      // Use connectFreighter if available on context
      if (auth.connectFreighter) {
        await auth.connectFreighter();
      } else {
        throw new Error('connectFreighter no está disponible');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al conectar Freighter';
      setLocalError(msg);
    } finally {
      setLocalLoading(false);
    }
  };

  // If wallet is already connected, show success state
  if (auth.user?.walletAddress) {
    return (
      <div className="space-y-2">
        <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          ✓ Wallet Conectada
        </div>
        <p className="text-sm text-gray-600 break-all">
          {auth.user.walletAddress}
        </p>
        <button
          onClick={() => {
            // Copy to clipboard
            navigator.clipboard.writeText(auth.user?.walletAddress || '');
            alert('Dirección copiada al portapapeles');
          }}
          className="text-xs text-green-600 hover:text-green-700 underline"
        >
          Copiar Dirección
        </button>
      </div>
    );
  }

  // If not connected, show connect button
  return (
    <div className="space-y-3">
      <button
        onClick={handleConnectWallet}
        disabled={localLoading || auth.isLoading}
        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {localLoading || auth.isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
            Conectando Wallet...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Conectar Wallet Freighter
          </>
        )}
      </button>

      {(localError || auth.error) && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {localError || auth.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Necesitas tener Freighter instalado en tu navegador.{' '}
        <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">
          Descargar Freighter
        </a>
      </p>
    </div>
  );
};