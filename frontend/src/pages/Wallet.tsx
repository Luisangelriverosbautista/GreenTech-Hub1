import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDonations } from '../hooks/useDonations';
import { sorobanService } from '../services/soroban.service';
import { truncateAddress } from '../utils/validation';
import type { Transaction } from '../types/soroban';
import { mapSorobanToTransaction } from '../types/soroban';

export const WalletPage = () => {
  const { user } = useAuth();
  const { donations = [], isLoading: donationsLoading } = useDonations();
  
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (user?.walletAddress) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      if (!user?.walletAddress) {
        throw new Error("No wallet address found");
      }

      setIsLoading(true);
      const [balanceResult, txHistory] = await Promise.all([
        sorobanService.getBalance(user.walletAddress),
        sorobanService.getTransactionHistory(user.walletAddress)
      ]);

      setBalance(balanceResult || '0');
      setTransactions(
        txHistory && txHistory.length > 0
          ? txHistory.map(mapSorobanToTransaction)
          : []
      );
    } catch (error) {
      console.error("Error loading wallet data:", error);
      setBalance('0');
      setTransactions([]);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calculate donation statistics
  const totalDonated = Array.isArray(donations) && donations.length > 0
    ? donations.reduce((acc, donation) => {
        const amount = typeof donation.amount === 'number' ? donation.amount : 0;
        return acc + amount;
      }, 0)
    : 0;

  const averageDonation = Array.isArray(donations) && donations.length > 0
    ? (totalDonated / donations.length)
    : 0;

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
            <h1 className="text-2xl font-bold text-gray-800">Mi Wallet</h1>
            {!user?.walletAddress ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Conectar Wallet
              </button>
            ) : (
              <div className="text-sm text-gray-600">
                Wallet conectada: {truncateAddress(user.walletAddress)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Balance</h3>
              <p className="text-3xl font-bold text-green-600">
                {balance}
              </p>
              <p className="text-xs text-green-600 mt-1">XLM</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Total Donado</h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalDonated.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">XLM</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Donaciones</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Array.isArray(donations) ? donations.length : 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">Transacciones</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Promedio</h3>
              <p className="text-3xl font-bold text-orange-600">
                {averageDonation.toFixed(2)}
              </p>
              <p className="text-xs text-orange-600 mt-1">XLM por donación</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Transacciones
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay transacciones para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.hash}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTransaction(tx)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {truncateAddress(tx.hash)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.amount} XLM
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getStatusColor(tx.status)}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Detalles de la Transacción</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hash de la Transacción</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono break-all">
                    {selectedTransaction.hash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.type}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <div className={`mt-1 text-sm ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.amount} XLM
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedTransaction.createdAt)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Memo</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.memo || 'Sin memo'}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${selectedTransaction.hash}`, '_blank')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ver en Explorer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
