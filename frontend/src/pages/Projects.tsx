import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useDonations } from '../hooks/useDonations';
import { DonateModal } from '../components/DonateModal';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading: loading, error, refreshProjects } = useProjects();
  const { makeDonation, isDonating } = useDonations();
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  // Filtrado y paginación
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, categoryFilter]);

  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    return filteredProjects.slice(startIndex, startIndex + projectsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDonate = (project: any) => {
    setSelectedProject(project);
    setIsDonateModalOpen(true);
  };

  const handleDonateSubmit = async (amount: number) => {
    if (!selectedProject) {
      throw new Error('No se seleccionó un proyecto');
    }

    try {
      // Pasar projectId, amount, y walletAddress del proyecto
      await makeDonation(
        selectedProject._id || selectedProject.id, 
        amount.toString(),
        selectedProject.walletAddress
      );
      
      // Refresh projects list
      await refreshProjects();
      
      // Close modal
      setIsDonateModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error en la donación:', error);
      throw error;
    }
  };

  // Tarjeta mejorada del proyecto
  const ProjectCard = ({ project }: { project: any }) => {
    const progress = parseFloat(project.progress) || 0;
    const remaining = project.remaining ? 
      parseFloat(project.remaining).toFixed(2) : 
      (parseFloat(project.targetAmount) - parseFloat(project.currentAmount || 0)).toFixed(2);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
        {/* Imagen */}
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={project.imageUrl || 'https://via.placeholder.com/400x300?text=Proyecto'} 
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => handleViewDetails(project._id || project.id)}
          />
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Categoría */}
          <div className="mb-2">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              {project.category === 'renewable-energy' && '⚡ Energía Renovable'}
              {project.category === 'recycling' && '♻️ Reciclaje'}
              {project.category === 'conservation' && '🌿 Conservación'}
              {project.category === 'sustainable-agriculture' && '🌾 Agricultura Sostenible'}
              {project.category === 'clean-water' && '💧 Agua Limpia'}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
            {project.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>

          {/* Barra de Progreso */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {parseFloat(project.currentAmount || 0).toFixed(2)} / {project.targetAmount} XLM
              </span>
              <span className="text-sm font-bold text-green-600">
                {Math.min(progress, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Faltan {remaining} XLM
            </p>
          </div>

          {/* Información del Creador */}
          <div className="mb-4 pb-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {(project.creator?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Creador</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {project.creator?.username || 'Anónimo'}
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDonate(project)}
              disabled={isDonating || project.status !== 'active'}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 text-sm"
            >
              💚 Donar
            </button>
            <button
              onClick={() => handleViewDetails(project._id || project.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md transition-colors font-medium text-sm flex items-center justify-center gap-1"
            >
              🔍 Detalles
            </button>
          </div>

          {/* Estatus */}
          {project.status === 'funded' && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded px-2 py-1 text-center">
              <p className="text-xs font-bold text-green-700">✅ Meta Alcanzada</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                Proyectos Ecológicos
              </h1>
              <p className="text-gray-600">
                Descubre y apoya proyectos de impacto ambiental
              </p>
            </div>
            <button
              onClick={() => navigate('/create-project')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold whitespace-nowrap"
            >
              + Crear Proyecto
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="🔍 Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="col-span-1 md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="renewable-energy">⚡ Energía Renovable</option>
            <option value="recycling">♻️ Reciclaje</option>
            <option value="conservation">🌿 Conservación</option>
            <option value="sustainable-agriculture">🌾 Agricultura Sostenible</option>
            <option value="clean-water">💧 Agua Limpia</option>
          </select>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando proyectos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
              <p className="text-lg text-red-600 mb-4 font-semibold">❌ Error al cargar los proyectos</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={refreshProjects}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
              <p className="text-lg text-gray-600 mb-4 font-semibold">📭 No hay proyectos</p>
              <p className="text-gray-500 mb-6">No encontramos proyectos que coincidan con tu búsqueda.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ver todos
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid de Proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProjects.map(project => (
                <ProjectCard key={project._id || project.id} project={project} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  ← Anterior
                </button>
                <span className="text-gray-600 font-semibold">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Donación */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        project={selectedProject}
        onDonate={handleDonateSubmit}
      />
    </div>
  );
};

export default Projects;
