import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDonationsByRole } from '../hooks/useDonationsByRole';
import { DonationList } from '../components/DonationList';
import { useLanguage } from '../hooks/useLanguage';
import { sorobanService } from '../services/soroban.service';
import { truncateAddress } from '../utils/validation';

export const WalletPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    made,
    received,
    totalMade,
    totalReceived,
    isLoading: donationsLoading,
    error: donationsError,
  } = useDonationsByRole();
  
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.walletAddress) {
      loadWalletData();
      return;
    }

    // Allow the page to render donation history even when no wallet is linked.
    setBalance('0');
    setIsLoading(false);
  }, [user]);

  const loadWalletData = async () => {
    try {
      if (!user?.walletAddress) {
        throw new Error("No wallet address found");
      }

      setIsLoading(true);
      const balanceResult = await sorobanService.getBalance(user.walletAddress);

      setBalance(balanceResult || '0');
    } catch (error) {
      console.error("Error loading wallet data:", error);
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Note: Wallet connection is handled via WalletConnect component
      // This is a placeholder for potential future Soroban contract interactions
      console.log('Wallet connection should be initiated from WalletConnect component');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const walletTransactions = useMemo(() => {
    if (user?.role === 'creator' || user?.role === 'admin') {
      return received;
    }

    return made;
  }, [made, received, user?.role]);

  const totalAmount = user?.role === 'creator' || user?.role === 'admin'
    ? totalReceived
    : totalMade;

  const averageAmount = walletTransactions.length > 0
    ? totalAmount / walletTransactions.length
    : 0;

  const totalLabel = user?.role === 'creator' || user?.role === 'admin'
    ? t('Total Recibido', 'Total Received')
    : t('Total Donado', 'Total Donated');

  const countLabel = user?.role === 'creator' || user?.role === 'admin'
    ? t('Aportes recibidos', 'Contributions received')
    : t('Donaciones', 'Donations');

  const averageLabel = user?.role === 'creator' || user?.role === 'admin'
    ? t('XLM por aporte', 'XLM per contribution')
    : t('XLM por donación', 'XLM per donation');

  const historyTitle = user?.role === 'creator' || user?.role === 'admin'
    ? t('Historial de Aportes Recibidos', 'Received Contributions History')
    : t('Historial de Donaciones', 'Donation History');

  if (isLoading || donationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('Mi Wallet', 'My Wallet')}</h1>
            
            {!user?.walletAddress ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('Conectar Wallet', 'Connect Wallet')}
              </button>
            ) : (
              <div className="text-sm text-gray-600">
                {t('Wallet conectada:', 'Connected wallet:')} {truncateAddress(user.walletAddress)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{t('Balance', 'Balance')}</h3>
              <p className="text-3xl font-bold text-green-600">
                {balance}
              </p>
              <p className="text-xs text-green-600 mt-1">XLM</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{totalLabel}</h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">XLM</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{countLabel}</h3>
              <p className="text-3xl font-bold text-purple-600">
                {walletTransactions.length}
              </p>
              <p className="text-xs text-purple-600 mt-1">{t('Registros', 'Records')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{t('Promedio', 'Average')}</h3>
              <p className="text-3xl font-bold text-orange-600">
                {averageAmount.toFixed(2)}
              </p>
              <p className="text-xs text-orange-600 mt-1">{averageLabel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {historyTitle}
            </h2>
            {!user?.walletAddress && (
              <p className="mt-2 text-sm text-amber-700">
                {t('No tienes una wallet conectada. Aun así puedes ver aquí tu historial registrado en la plataforma.', 'You do not have a connected wallet. You can still view your history recorded on the platform here.')}
              </p>
            )}
          </div>

          {donationsError ? (
            <div className="p-8 text-center text-yellow-700 bg-yellow-50">
              {t('No se pudo cargar el historial.', 'The history could not be loaded.')} {donationsError}
            </div>
          ) : walletTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('No hay registros para mostrar', 'There are no records to display')}
            </div>
          ) : (
            <DonationList
              donations={walletTransactions}
              type={user?.role === 'creator' || user?.role === 'admin' ? 'received' : 'made'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
