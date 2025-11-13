import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente WalletConnect
 * Muestra el estado de la wallet del usuario:
 * - Si no está conectada: botón para conectar Freighter
 * - Si está conectada: muestra la dirección con opción de copiar
 */
export const WalletConnect: React.FC = () => {
  const auth = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const handleConnectFreighter = async () => {
    try {
      setLocalError(null);
      setLocalSuccess(null);

      // Call connectFreighter from context - bind the function to maintain context
      if (auth.connectFreighter) {
        await auth.connectFreighter();
        setLocalSuccess('✓ Wallet conectada exitosamente');
        setTimeout(() => setLocalSuccess(null), 3000);
      } else {
        throw new Error('connectFreighter no está disponible');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al conectar Freighter';
      setLocalError(msg);
    }
  };

  const copyToClipboard = () => {
    const address = auth.user?.walletAddress || '';
    navigator.clipboard.writeText(address);
    setLocalSuccess('Dirección copiada al portapapeles');
    setTimeout(() => setLocalSuccess(null), 2000);
  };

  const handleDisconnect = async () => {
    try {
      setLocalError(null);
      const unlinkFn = auth.unlinkWallet;
      if (unlinkFn) {
        await unlinkFn();
        setLocalSuccess('Wallet desconectada');
        setTimeout(() => setLocalSuccess(null), 2000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al desconectar';
      setLocalError(msg);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          <svg className="inline h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Wallet Stellar
        </h2>
      </div>

      {/* Connected State */}
      {auth.user?.walletAddress ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">Wallet Conectada</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 break-all font-mono bg-gray-50 p-2 rounded">
              {auth.user.walletAddress}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </button>

            <button
              onClick={handleDisconnect}
              disabled={auth.isLoading}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {auth.isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-1 border-t-2 border-b-2 border-current rounded-full"></div>
                  Desconectando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Desconectar
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Disconnected State */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Conecta tu wallet Freighter para habilitar transacciones en la plataforma.
          </p>

          <button
            onClick={handleConnectFreighter}
            disabled={auth.isLoading}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {auth.isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                Conectando Wallet...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                </svg>
                Conectar Wallet Freighter
              </>
            )}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Requisito:</strong> Debes tener Freighter instalado.{' '}
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-blue-900"
              >
                Descargar Freighter
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(localError || auth.error) && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
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

      {/* Success Message */}
      {localSuccess && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {localSuccess}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
