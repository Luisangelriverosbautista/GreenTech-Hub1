import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useDonationsByRole } from '../hooks/useDonationsByRole';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { WalletConnect } from '../components/WalletConnect';
import { ProjectCard } from '../components/ProjectCard';
import { DonationList } from '../components/DonationList';

const DonorDashboard = () => {
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { made, totalMade, isLoading: donationsLoading, error: donationsError } = useDonationsByRole();
  const { balance, isLoading: balanceLoading } = useWalletBalance();

  return (
    <div className="space-y-8">
      {/* Wallet Connection - Prominently displayed */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🪙 Conecta tu Wallet Stellar</h2>
        <WalletConnect />
      </section>

      {/* Balance Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Balance</h2>
        <div className="flex items-baseline space-x-2">
          {balanceLoading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          ) : (
            <span className="text-3xl font-bold text-gray-900">{balance || '0'}</span>
          )}
          <span className="text-gray-600">XLM</span>
        </div>
      </section>

      {/* Donor Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total Donado</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {totalMade.toFixed(2)} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">{made.length} transacciones</p>
        </div>
        
        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Promedio por Donación</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {made.length > 0 ? (totalMade / made.length).toFixed(2) : '0.00'} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">Por transacción</p>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Proyectos Recientes</h2>
        {projectsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando proyectos...</p>
          </div>
        ) : projectsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>No se pudieron cargar los proyectos. {projectsError}</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} compact />
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>No hay proyectos disponibles en este momento.</p>
          </div>
        )}
      </section>

      {/* My Donations Section (Realizadas) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Donaciones Realizadas</h2>
        {donationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando tus donaciones...</p>
          </div>
        ) : donationsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>No se pudieron cargar las donaciones. {donationsError}</p>
          </div>
        ) : made && made.length > 0 ? (
          <DonationList donations={made} type="made" compact />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>No has realizado donaciones aún. ¡Encuentra un proyecto y realiza tu primera donación!</p>
          </div>
        )}
      </section>
    </div>
  );
};

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { received, totalReceived, isLoading: donationsLoading, error: donationsError } = useDonationsByRole();
  const myProjects = user ? projects.filter(p => p.creatorId === user.id) : [];

  return (
    <div className="space-y-8">
      {/* Wallet Connection - Prominently displayed */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🪙 Conecta tu Wallet Stellar</h2>
        <WalletConnect />
      </section>

      {/* Projects Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Proyectos Activos</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Recaudado</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.reduce((sum, p) => sum + (p.raisedAmount || 0), 0)} XLM
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Proyectos Completados</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Donaciones Recibidas</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {received ? received.length : 0}
          </p>
        </div>
      </section>

      {/* Donations Received Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Total en Donaciones</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {totalReceived.toFixed(2)} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">Recibido de donadores</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Promedio por Donación</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {received && received.length > 0 ? (totalReceived / received.length).toFixed(2) : '0.00'} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">Tamaño promedio</p>
        </div>
      </section>

      {/* My Projects Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Mis Proyectos</h2>
          <button
            onClick={() => window.location.href = '/create-project'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Crear Proyecto
          </button>
        </div>
        
        {projectsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando tus proyectos...</p>
          </div>
        ) : projectsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>No se pudieron cargar los proyectos. {projectsError}</p>
          </div>
        ) : myProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>No tienes proyectos aún. ¡Crea uno para comenzar!</p>
          </div>
        )}
      </section>

      {/* Donations Received Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Donaciones Recibidas</h2>
        {donationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando donaciones recibidas...</p>
          </div>
        ) : donationsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>No se pudieron cargar las donaciones. {donationsError}</p>
          </div>
        ) : received && received.length > 0 ? (
          <DonationList donations={received} type="received" compact />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>Aún no tienes donaciones. ¡Promociona tus proyectos para empezar a recibir apoyo!</p>
          </div>
        )}
      </section>
    </div>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const { refreshProjects } = useProjects();

  useEffect(() => {
    // Prefetch projects data
    refreshProjects();
  }, [refreshProjects]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {user.role === 'donor' ? 'Panel de Donador' : 'Panel de Creador'}
      </h1>
      
      {user.role === 'donor' ? <DonorDashboard /> : <CreatorDashboard />}
    </div>
  );
}

export default Dashboard;