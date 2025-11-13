import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Project } from '../types';
import projectService from '../services/project.service';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');

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
    if (!user || !project || !donationAmount) return;

    try {
      // TODO: Implementar lógica de donación con Soroban
      console.log('Donando', donationAmount, 'a', project.id);
    } catch (error: unknown) {
      console.error('Error loading project:', error);
      setError('Error al procesar la donación');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error || 'Proyecto no encontrado'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {project.mediaUrl && (
            <img
              src={project.mediaUrl}
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold text-green-800 mb-4">
            {project.title}
          </h1>

          <div className="flex items-center text-gray-600 mb-6">
            <span>Por {typeof project.creator === 'object' && 'username' in project.creator ? (project.creator as any).username : 'Anónimo'}</span>
            <span className="mx-2">•</span>
            <span>Creado el {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Estado del Proyecto
              </h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Recaudado</span>
                <span className="font-semibold">{project.currentAmount || 0} XLM</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Meta</span>
                <span className="font-semibold">{project.targetAmount || project.metaAmount || 0} XLM</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((typeof project.currentAmount === 'string' ? parseFloat(project.currentAmount) : project.currentAmount || 0) / 
                      (typeof project.targetAmount === 'string' ? parseFloat(project.targetAmount) : project.metaAmount || 1)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {user?.role === 'donor' && (
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-4">
                  Realizar Donación
                </h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    placeholder="Cantidad a donar"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleDonate}
                    disabled={!donationAmount}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Donar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              Descripción del Proyecto
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;