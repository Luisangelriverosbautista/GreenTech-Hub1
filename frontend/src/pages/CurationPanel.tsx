import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../hooks/useLanguage';
import { projectService } from '../services/project.service';
import type { Project } from '../types';

const ADMIN_KEY_STORAGE = 'project_review_admin_key';

const CurationPanel = () => {
  const { t } = useLanguage();
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActingId, setIsActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const hasKey = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  const loadQueue = async () => {
    if (!hasKey) {
      setProjects([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.getManualReviewQueue(adminKey.trim());
      setProjects(response.projects || []);
    } catch (queueError) {
      if (axios.isAxiosError(queueError)) {
        const backendMessage = (queueError.response?.data as any)?.error || queueError.message;
        setError(backendMessage || t('No se pudo cargar la cola de curaduría', 'The curation queue could not be loaded'));
      } else {
        setError(t('No se pudo cargar la cola de curaduría', 'The curation queue could not be loaded'));
      }
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
  }, [adminKey]);

  useEffect(() => {
    loadQueue();
  }, [hasKey]);

  const handleDecision = async (projectId: string, decision: 'approve' | 'reject') => {
    const notes = window.prompt(
      decision === 'approve'
        ? t('Nota de aprobación (opcional):', 'Approval note (optional):')
        : t('Motivo de rechazo (recomendado):', 'Reason for rejection (recommended):'),
      ''
    ) || '';

    try {
      setIsActingId(projectId);
      setError(null);
      setMessage(null);
      await projectService.submitManualReview(projectId, { decision, notes }, adminKey.trim());
      setMessage(decision === 'approve' ? t('Proyecto aprobado para fondeo.', 'Project approved for funding.') : t('Proyecto rechazado.', 'Project rejected.'));
      await loadQueue();
    } catch (decisionError) {
      if (axios.isAxiosError(decisionError)) {
        const backendMessage = (decisionError.response?.data as any)?.error || decisionError.message;
        setError(backendMessage || t('No se pudo registrar la decisión', 'The decision could not be recorded'));
      } else {
        setError(t('No se pudo registrar la decisión', 'The decision could not be recorded'));
      }
    } finally {
      setIsActingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('Panel de Curaduría', 'Curation Panel')}</h1>
        <p className="text-sm text-gray-600 mb-4">
          {t('Revisa proyectos en estado manual_review_pending y decide si se habilitan para fondeo.', 'Review projects in manual_review_pending status and decide whether they should be enabled for funding.')}
        </p>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="PROJECT_REVIEW_ADMIN_KEY"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={loadQueue}
            disabled={!hasKey || isLoading}
            className="px-4 py-2 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isLoading ? t('Cargando...', 'Loading...') : t('Actualizar Cola', 'Refresh Queue')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded p-3 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 rounded p-3 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('Cola Manual', 'Manual Queue')}</h2>
          <span className="text-sm text-gray-600">{projects.length} {t('pendientes', 'pending')}</span>
        </div>

        {!hasKey ? (
          <p className="text-sm text-gray-600">{t('Ingresa la llave admin para ver proyectos pendientes.', 'Enter the admin key to view pending projects.')}</p>
        ) : isLoading ? (
          <p className="text-sm text-gray-600">{t('Cargando proyectos...', 'Loading projects...')}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-600">{t('No hay proyectos pendientes de curaduría.', 'There are no projects pending curation.')}</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectId = project._id || project.id || '';
              const autoReview: any = (project as any).verification?.autoReview;
              const reasons: string[] = Array.isArray(autoReview?.reasons) ? autoReview.reasons : [];
              const creator = typeof project.creator === 'object' && project.creator ? project.creator as any : null;

              return (
                <div key={projectId} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-xs text-gray-600">
                        {t('Creador:', 'Creator:')} {creator?.name || creator?.username || creator?.email || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800 w-fit">
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{project.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-700">
                    <div className="bg-gray-50 rounded p-2">{t('Meta', 'Goal')}: {project.targetAmount} XLM</div>
                    <div className="bg-gray-50 rounded p-2">{t('Categoría', 'Category')}: {project.category}</div>
                    <div className="bg-gray-50 rounded p-2">{t('Score automático', 'Automatic score')}: {autoReview?.score ?? 'N/A'}</div>
                  </div>

                  {reasons.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <p className="text-xs font-semibold text-amber-800 mb-1">{t('Observaciones automáticas', 'Automatic observations')}</p>
                      <ul className="text-xs text-amber-900 list-disc pl-4">
                        {reasons.map((reason, idx) => (
                          <li key={`${projectId}-${idx}`}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecision(projectId, 'approve')}
                      disabled={isActingId === projectId}
                      className="px-3 py-2 text-sm font-semibold rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                    >
                      {t('Aprobar', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleDecision(projectId, 'reject')}
                      disabled={isActingId === projectId}
                      className="px-3 py-2 text-sm font-semibold rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      {t('Rechazar', 'Reject')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurationPanel;
