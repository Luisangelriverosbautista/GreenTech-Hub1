import React from 'react';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  compact?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  compact = false
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(compact ? {} : {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  const truncateHash = (hash: string | undefined) => {
    if (!hash || typeof hash !== 'string') {
      return 'N/A';
    }
    if (compact) {
      return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    }
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay transacciones para mostrar
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${
      compact ? 'overflow-x-auto' : 'overflow-hidden'
    }`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hash
            </th>
            {!compact && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id || Math.random()} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {truncateHash(tx.hash)}
              </td>
              {!compact && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.type === 'donation' ? 'Donación' : 'Transferencia'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {tx.amount || '0'} XLM
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(tx.timestamp || new Date().toISOString())}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  statusColors[tx.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                }`}>
                  {tx.status === 'pending' && 'Pendiente'}
                  {tx.status === 'confirmed' && 'Confirmada'}
                  {tx.status === 'failed' && 'Fallida'}
                  {!['pending', 'confirmed', 'failed'].includes(tx.status) && 'Desconocido'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;