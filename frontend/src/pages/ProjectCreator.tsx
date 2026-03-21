import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { projectService } from '../services/project.service';
import { uploadService } from '../services/upload.service';

type MilestoneDraft = {
  description: string;
  targetAmount: string;
  completed: boolean;
};

const getApiErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as {
      error?: string;
      details?: string;
      reasons?: string[];
    } | undefined;

    if (Array.isArray(data?.reasons) && data.reasons.length > 0) {
      return `La revisión automática falló: ${data.reasons.join(' | ')}`;
    }

    if (data?.error && data?.details) {
      return `${data.error}: ${data.details}`;
    }

    if (data?.error) {
      return data.error;
    }
  }

  return err instanceof Error ? err.message : 'Error al crear el proyecto';
};

const parseCoordinates = (latRaw: string, lngRaw: string): { lat: number; lng: number } | null => {
  const normalizedLatRaw = String(latRaw || '').trim();
  const normalizedLngRaw = String(lngRaw || '').trim();

  // Permite pegar "lat, lng" en un solo campo.
  const combined = `${normalizedLatRaw} ${normalizedLngRaw}`.trim();
  const match = combined.match(/(-?\d+(?:[\.,]\d+)?)\s*,\s*(-?\d+(?:[\.,]\d+)?)/);
  if (match) {
    const lat = Number.parseFloat(match[1].replace(',', '.'));
    const lng = Number.parseFloat(match[2].replace(',', '.'));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  const lat = Number.parseFloat(normalizedLatRaw.replace(',', '.'));
  const lng = Number.parseFloat(normalizedLngRaw.replace(',', '.'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const sanitizeMilestones = (milestones: MilestoneDraft[]): MilestoneDraft[] => {
  return milestones
    .map((milestone) => ({
      description: String(milestone.description || '').trim(),
      targetAmount: String(milestone.targetAmount || '').trim(),
      completed: false
    }))
    .filter((milestone) => milestone.description.length > 0 || milestone.targetAmount.length > 0);
};

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
    profileType: 'individual' as 'individual' | 'organization',
    kycDocumentsCsv: '',
    location: {
      lat: '',
      lng: '',
      address: ''
    },
    environmentalImpact: {
      metric: '',
      value: ''
    },
    milestones: [
      {
        description: '',
        targetAmount: '',
        completed: false
      }
    ] as MilestoneDraft[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'review'>('draft');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleImpactValueChange = (rawValue: string) => {
    const normalized = rawValue.replace(',', '.');
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      setFormData(prev => ({
        ...prev,
        environmentalImpact: { ...prev.environmentalImpact, value: normalized }
      }));
    }
  };

  const updateMilestone = (index: number, field: 'description' | 'targetAmount', value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, idx) =>
        idx === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          description: '',
          targetAmount: '',
          completed: false
        }
      ]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => {
      if (prev.milestones.length === 1) {
        return prev;
      }

      return {
        ...prev,
        milestones: prev.milestones.filter((_, idx) => idx !== index)
      };
    });
  };

  const handleProjectImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setError(null);
      setIsUploadingImage(true);
      const uploaded = await uploadService.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: uploaded.url
      }));
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg || 'No se pudo subir la imagen');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
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

      const parsedCoordinates = parseCoordinates(formData.location.lat, formData.location.lng);
      const kycDocuments = formData.kycDocumentsCsv
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
      const cleanedMilestones = sanitizeMilestones(formData.milestones);

      if (submitMode === 'review' && kycDocuments.length === 0) {
        throw new Error('Para enviar a revisión debes cargar al menos un documento KYC (URL).');
      }

      if (submitMode === 'review' && formData.description.trim().length < 80) {
        throw new Error('Para enviar a revisión, la descripción debe tener al menos 80 caracteres.');
      }

      if (submitMode === 'review' && cleanedMilestones.length < 2) {
        throw new Error('Para enviar a revisión debes definir al menos 2 fases/hitos del proyecto.');
      }

      if (submitMode === 'review') {
        const hasInvalidMilestone = cleanedMilestones.some((milestone) => {
          const amount = Number.parseFloat(milestone.targetAmount);
          return milestone.description.length < 8 || !Number.isFinite(amount) || amount <= 0;
        });

        if (hasInvalidMilestone) {
          throw new Error('Cada fase debe tener descripción clara (mínimo 8 caracteres) y monto mayor a 0.');
        }

        const milestonesTotal = cleanedMilestones.reduce((acc, milestone) => {
          const value = Number.parseFloat(milestone.targetAmount);
          return acc + (Number.isFinite(value) ? value : 0);
        }, 0);
        const target = Number.parseFloat(formData.targetAmount);

        if (Math.abs(milestonesTotal - target) > 0.01) {
          throw new Error('La suma de las fases debe coincidir con la meta total del proyecto.');
        }
      }

      if (submitMode === 'review' && parsedCoordinates) {
        const hasValidCoordinates =
          parsedCoordinates.lat >= -90 &&
          parsedCoordinates.lat <= 90 &&
          parsedCoordinates.lng >= -180 &&
          parsedCoordinates.lng <= 180;

        if (!hasValidCoordinates) {
          throw new Error('Si capturas coordenadas, deben ser válidas (lat -90..90, lng -180..180).');
        }
      }

      // Crear proyecto como borrador
      const newProject = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetAmount: formData.targetAmount,
        category: formData.category,
        imageUrl: formData.imageUrl || '',
        profileType: formData.profileType,
        kycDocuments,
        location: {
          lat: parsedCoordinates?.lat,
          lng: parsedCoordinates?.lng,
          address: formData.location.address || undefined
        },
        environmentalImpact: {
          metric: formData.environmentalImpact.metric || 'impacto',
          value: Number.parseFloat(formData.environmentalImpact.value || '0') || 0
        },
        milestones: cleanedMilestones.length > 0 ? cleanedMilestones : [
          {
            description: 'Meta inicial',
            targetAmount: formData.targetAmount,
            completed: false
          }
        ]
      });

      if (submitMode === 'review') {
        await projectService.submitProjectForReview(newProject._id || newProject.id || '');
        setSuccessMessage('Proyecto enviado a revisión. Pasará por KYC, análisis automático y curaduría manual antes de habilitar donaciones.');
      } else {
        setSuccessMessage('Proyecto guardado como borrador. Completa KYC y envíalo a revisión cuando estés listo.');
      }

      setSuccess(true);
      console.log('✅ Proyecto creado exitosamente:', newProject);
      
      // Redirigir a la página del proyecto después de 2 segundos
      setTimeout(() => {
        navigate(`/project/${newProject._id || newProject.id}`);
      }, 2000);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
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
          <p className="text-gray-700 mb-6">{successMessage}</p>
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

          {/* Perfil y KYC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="profileType" className="block text-gray-700 font-medium mb-2">
                Tipo de Creador
              </label>
              <select
                id="profileType"
                name="profileType"
                value={formData.profileType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="individual">Persona / Individuo</option>
                <option value="organization">Organización</option>
              </select>
            </div>
            <div>
              <label htmlFor="kycDocumentsCsv" className="block text-gray-700 font-medium mb-2">
                Documentos KYC (URLs, separadas por coma)
              </label>
              <input
                type="text"
                id="kycDocumentsCsv"
                value={formData.kycDocumentsCsv}
                onChange={(e) => setFormData(prev => ({ ...prev, kycDocumentsCsv: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://...doc1, https://...doc2"
              />
            </div>
          </div>

          {/* Ubicación del Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Latitud</label>
              <input
                type="number"
                step="0.000001"
                value={formData.location.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, lat: e.target.value } }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 19.427302"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Longitud</label>
              <input
                type="number"
                step="0.000001"
                value={formData.location.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, lng: e.target.value } }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: -99.174806"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Dirección (opcional)</label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Colonia, ciudad o referencia"
              />
            </div>
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
                onChange={(e) => handleImpactValueChange(e.target.value)}
                inputMode="decimal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 500"
              />
            </div>
          </div>

          {/* Imagen del Proyecto */}
          <div className="mb-6">
            <label htmlFor="projectImage" className="block text-gray-700 font-medium mb-2">
              Imagen del Proyecto
            </label>
            <input
              type="file"
              id="projectImage"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleProjectImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube JPG, PNG, WEBP o GIF (max 5MB).
            </p>
            {isUploadingImage && (
              <p className="text-sm text-blue-700 mt-2">Subiendo imagen...</p>
            )}
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Vista previa del proyecto"
                  className="w-full max-h-56 object-cover rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Fases del Proyecto */}
          <div className="mb-6 border border-emerald-200 rounded-lg p-4 bg-emerald-50">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-900">Fases / Hitos del Proyecto</h3>
                <p className="text-sm text-emerald-800">
                  Esto se mostrará al donante para darle claridad de ejecución y confianza.
                </p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-3 py-2 text-sm font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800"
              >
                + Agregar Fase
              </button>
            </div>

            <div className="space-y-3">
              {formData.milestones.map((milestone, index) => (
                <div key={`milestone-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white border border-emerald-100 rounded-md p-3">
                  <div className="md:col-span-7">
                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Fase ${index + 1}: Ej. Compra e instalación de paneles`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={milestone.targetAmount}
                      onChange={(e) => updateMilestone(index, 'targetAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Monto XLM"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      disabled={formData.milestones.length <= 1}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button 
              type="submit"
              onClick={() => setSubmitMode('draft')}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting && submitMode === 'draft' ? 'Guardando...' : 'Guardar Borrador'}
            </button>
            <button 
              type="submit"
              onClick={() => setSubmitMode('review')}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-700 text-white py-2 px-4 rounded-md hover:bg-emerald-800 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting && submitMode === 'review' ? 'Enviando...' : 'Enviar a Revisión'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
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