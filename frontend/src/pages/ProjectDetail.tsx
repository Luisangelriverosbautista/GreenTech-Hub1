import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDonations } from '../hooks/useDonations';
import { ShareProject } from '../components/ShareProject';
import type { Project } from '../types';
import projectService from '../services/project.service';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { makeDonation, isDonating } = useDonations();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
      setError(null);
    } catch {
      setError('Error al cargar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!user || !project || !donationAmount || !project.walletAddress) return;

    try {
      await makeDonation(
        project._id || project.id || '',
        donationAmount.toString(),
        project.walletAddress
      );
      setDonationSuccess(true);
      setDonationAmount('');
      setTimeout(() => setDonationSuccess(false), 5000);
      await loadProject(id!);
    } catch (error: unknown) {
      console.error('Error en la donación:', error);
      setError('Error al procesar la donación');
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: { [key: string]: { label: string; emoji: string } } = {
      'renewable-energy': { label: 'Energía Renovable', emoji: '⚡' },
      'recycling': { label: 'Reciclaje', emoji: '♻️' },
      'conservation': { label: 'Conservación', emoji: '🌿' },
      'sustainable-agriculture': { label: 'Agricultura Sostenible', emoji: '🌾' },
      'clean-water': { label: 'Agua Limpia', emoji: '💧' }
    };
    return categories[category] || { label: category, emoji: '🌍' };
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'active': { label: 'Activo', color: 'bg-blue-100 text-blue-800' },
      'funded': { label: 'Financiado', color: 'bg-green-100 text-green-800' },
      'completed': { label: 'Completado', color: 'bg-purple-100 text-purple-800' },
      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/projects')}
            className="mb-6 px-4 py-2 text-green-600 hover:text-green-800 flex items-center gap-2"
          >
            ← Volver a Proyectos
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{error || 'Proyecto no encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = parseFloat(String(project.currentAmount || '0')) / parseFloat(String(project.targetAmount || '1')) * 100;
  const categoryBadge = getCategoryBadge(project.category);
  const statusBadge = getStatusBadge(project.status || 'active');
  const creatorName = typeof project.creator === 'object' && project.creator && 'username' in project.creator 
    ? (project.creator as any).username 
    : 'Anónimo';

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="w-full px-4 py-4">
            <button
              onClick={() => navigate('/projects')}
              className="mb-4 px-4 py-2 text-green-600 hover:text-green-800 flex items-center gap-2 transition"
            >
              ← Volver a Proyectos
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Mensajes de éxito */}
            {donationSuccess && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">¡Donación realizada exitosamente!</p>
              </div>
            )}

            {/* Hero Image */}
            {project.imageUrl && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Title and Status */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block ${statusBadge.color} text-xs font-semibold px-4 py-2 rounded-full`}>
                      {statusBadge.label}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-4 py-2 rounded-full">
                      {categoryBadge.emoji} {categoryBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Info - Enhanced */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {creatorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Creador del Proyecto</p>
                      <p className="text-lg font-bold text-gray-900">{creatorName}</p>
                      {typeof project.creator === 'object' && project.creator && 'email' in project.creator && (
                        <p className="text-xs text-gray-600 mt-1">{(project.creator as any).email}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Creado</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Funding Progress */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Estado de Recaudación
                  </h2>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Recaudado</p>
                      <p className="text-2xl font-bold text-green-600">
                        {project.currentAmount || '0'} XLM
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Meta</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {project.targetAmount || '0'} XLM
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Progreso</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.min(progress, 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Descripción del Proyecto
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                {/* Environmental Impact */}
                {project.environmentalImpact && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Impacto Ambiental
                    </h2>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        {project.environmentalImpact.metric}
                      </p>
                      <p className="text-4xl font-bold text-green-600 mb-1">
                        {project.environmentalImpact.value}
                      </p>
                      <p className="text-gray-600">
                        {project.environmentalImpact.unit}
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Hitos del Proyecto
                    </h2>
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 transition ${
                            milestone.completed
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              milestone.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}>
                              {milestone.completed && (
                                <span className="text-white text-sm font-bold">✓</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {milestone.description}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Meta: {milestone.targetAmount} XLM
                              </p>
                              {milestone.completedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  Completado el {new Date(milestone.completedAt).toLocaleDateString('es-ES')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Share Button - Always Visible */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                  <ShareProject 
                    projectId={project._id || project.id || ''}
                    projectTitle={project.title}
                    projectDescription={project.description}
                  />
                </div>

                {/* Donation Card */}
                {user?.role === 'donor' && project.status === 'active' && (
                  <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Realizar Donación
                    </h3>

                    {project.tokenRewards && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Recompensa:</span> {project.tokenRewards} tokens por XLM
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 mb-4">
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        placeholder="Cantidad a donar (XLM)"
                        min="0.1"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleDonate}
                        disabled={!donationAmount || isDonating}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDonating ? 'Procesando...' : 'Donar'}
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Dirección Wallet:</span>
                      </p>
                      <p className="text-xs text-gray-900 font-mono break-all mt-2">
                        {project.walletAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* Project Info Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Información del Proyecto
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Creador</p>
                      <p className="text-sm text-gray-900 font-semibold">{creatorName}</p>
                      {typeof project.creator === 'object' && project.creator && 'email' in project.creator && (
                        <p className="text-xs text-gray-600">{(project.creator as any).email}</p>
                      )}
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Estado</p>
                      <p className="text-sm text-gray-900 capitalize">{project.status || 'activo'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Categoría</p>
                      <p className="text-sm text-gray-900">{categoryBadge.label}</p>
                    </div>
                    {project.createdAt && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Creado</p>
                        <p className="text-sm text-gray-900">
                          {new Date(project.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">ID del Proyecto</p>
                      <p className="text-xs text-gray-900 font-mono break-all bg-gray-100 p-2 rounded">
                        {project._id || project.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;