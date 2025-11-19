import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';

const ProjectCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProjects();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: 'renewable-energy',
    imageUrl: '',
    environmentalImpact: {
      metric: '',
      value: ''
    },
    milestones: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validar que el usuario tenga wallet conectada
  if (!user?.walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Wallet No Conectada</h2>
          <p className="text-gray-700 mb-6">
            Debes conectar tu wallet de Freighter antes de crear un proyecto.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.title.trim()) throw new Error('El título es requerido');
      if (!formData.description.trim()) throw new Error('La descripción es requerida');
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        throw new Error('La meta debe ser mayor a 0');
      }

      // Crear proyecto
      const newProject = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetAmount: formData.targetAmount,
        category: formData.category,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/400x300?text=Proyecto',
        environmentalImpact: {
          metric: formData.environmentalImpact.metric || 'impacto',
          value: formData.environmentalImpact.value || '0'
        },
        milestones: formData.milestones.length > 0 ? formData.milestones : [
          {
            description: 'Meta inicial',
            targetAmount: formData.targetAmount,
            completed: false
          }
        ]
      });

      setSuccess(true);
      console.log('✅ Proyecto creado exitosamente:', newProject);
      
      // Redirigir a la página del proyecto después de 2 segundos
      setTimeout(() => {
        navigate(`/project/${newProject._id || newProject.id}`);
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear el proyecto';
      setError(errorMsg);
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-4">
            <div className="text-5xl">✅</div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Proyecto Creado!</h2>
          <p className="text-gray-700 mb-6">
            Tu proyecto se ha creado exitosamente y está visible para los donantes.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Crear Nuevo Proyecto
        </h1>
        <p className="text-gray-600 mb-8">
          Tu wallet: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-10)}</span>
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Título */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Energía Solar Comunitaria"
              required
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe tu proyecto en detalle..."
              required
            ></textarea>
          </div>

          {/* Categoría */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="renewable-energy">Energía Renovable</option>
              <option value="recycling">Reciclaje</option>
              <option value="conservation">Conservación</option>
              <option value="sustainable-agriculture">Agricultura Sostenible</option>
              <option value="clean-water">Agua Limpia</option>
            </select>
          </div>

          {/* Meta de Financiamiento */}
          <div className="mb-6">
            <label htmlFor="targetAmount" className="block text-gray-700 font-medium mb-2">
              Meta de Financiamiento (XLM) *
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: 100"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Cantidad en XLM que necesitas recaudar</p>
          </div>

          {/* Impacto Ambiental */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="metric" className="block text-gray-700 font-medium mb-2">
                Métrica de Impacto
              </label>
              <input
                type="text"
                id="metric"
                name="environmentalImpact"
                value={formData.environmentalImpact.metric}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  environmentalImpact: { ...prev.environmentalImpact, metric: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: CO2 reducido"
              />
            </div>
            <div>
              <label htmlFor="value" className="block text-gray-700 font-medium mb-2">
                Valor
              </label>
              <input
                type="text"
                id="value"
                value={formData.environmentalImpact.value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  environmentalImpact: { ...prev.environmentalImpact, value: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 500 toneladas"
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
              URL de la Imagen
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreator;