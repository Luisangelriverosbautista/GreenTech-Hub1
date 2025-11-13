import React from 'react';

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

interface DonationListProps {
  donations: Donation[];
  compact?: boolean;
  type?: 'made' | 'received'; // Para mostrar diferente info
}

export const DonationList: React.FC<DonationListProps> = ({
  donations,
  compact = false,
  type = 'made'
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
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

  const truncateAddress = (address: string | undefined) => {
    if (!address || typeof address !== 'string') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(compact ? {} : {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {type === 'made' ? 'No has realizado donaciones' : 'No has recibido donaciones'}
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
              {type === 'made' ? 'Para' : 'De'}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proyecto
            </th>
            {!compact && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hash
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
          {donations.map((donation) => (
            <tr key={donation._id || Math.random()} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div>
                  <p className="font-semibold">
                    {type === 'made' 
                      ? donation.to?.username || truncateAddress(donation.to?.walletAddress)
                      : donation.from?.username || truncateAddress(donation.from?.walletAddress)
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {truncateAddress(type === 'made' ? donation.to?.walletAddress : donation.from?.walletAddress)}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {donation.project?.title || 'N/A'}
                </span>
              </td>
              {!compact && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {truncateHash(donation.txHash)}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="font-semibold text-green-600">
                  {parseFloat(donation.amount || '0').toFixed(2)} XLM
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(donation.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  statusColors[donation.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                }`}>
                  {donation.status === 'pending' && 'Pendiente'}
                  {donation.status === 'confirmed' && 'Confirmada'}
                  {donation.status === 'completed' && 'Completada'}
                  {donation.status === 'failed' && 'Fallida'}
                  {!['pending', 'confirmed', 'completed', 'failed'].includes(donation.status) && donation.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonationList;
