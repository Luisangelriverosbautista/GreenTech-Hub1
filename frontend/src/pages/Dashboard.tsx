import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useDonationsByRole } from '../hooks/useDonationsByRole';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useLanguage } from '../hooks/useLanguage';
import { WalletConnect } from '../components/WalletConnect';
import { ProjectCard } from '../components/ProjectCard';
import { DonationList } from '../components/DonationList';
import { projectService, type AdminOverviewResponse } from '../services/project.service';
import type { Project } from '../types';

const DonorDashboard = () => {
  const { t } = useLanguage();
  const { made, totalMade, isLoading: donationsLoading, error: donationsError } = useDonationsByRole();
  const { balance, isLoading: balanceLoading } = useWalletBalance();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Wallet Connection - Prominently displayed */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('🪙 Conecta tu Wallet Stellar', '🪙 Connect your Stellar Wallet')}</h2>
        <WalletConnect />
      </section>

      {/* Balance Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('Balance', 'Balance')}</h2>
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
          <h3 className="text-sm font-medium text-gray-500">{t('Total Donado', 'Total Donated')}</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {totalMade.toFixed(2)} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">{made.length} {t('transacciones', 'transactions')}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">{t('Promedio por Donación', 'Average per Donation')}</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {made.length > 0 ? (totalMade / made.length).toFixed(2) : '0.00'} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">{t('Por transacción', 'Per transaction')}</p>
        </div>
      </section>

      {/* My Donations Section (Realizadas) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('Mis Donaciones Realizadas', 'My Donations Made')}</h2>
        {donationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('Cargando tus donaciones...', 'Loading your donations...')}</p>
          </div>
        ) : donationsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>{t('No se pudieron cargar las donaciones.', 'The donations could not be loaded.')} {donationsError}</p>
          </div>
        ) : made && made.length > 0 ? (
          <DonationList donations={made} type="made" compact />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>{t('No has realizado donaciones aún. ¡Encuentra un proyecto y realiza tu primera donación!', 'You have not made any donations yet. Find a project and make your first donation!')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

const CreatorDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects('all');
  const { received, totalReceived, isLoading: donationsLoading, error: donationsError } = useDonationsByRole();
  const getProjectId = (project: any): string => project?._id || project?.id || '';
  const currentUserId = (user as any)?._id || user?.id;
  const myProjects = user ? projects.filter((p: any) => {
    const creatorId = p.creatorId || p.creator?._id || p.creator?.id;
    return Boolean(currentUserId && creatorId && creatorId === currentUserId);
  }) : [];

  return (
    <div className="space-y-8">
      {/* Wallet Connection - Prominently displayed */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('🪙 Conecta tu Wallet Stellar', '🪙 Connect your Stellar Wallet')}</h2>
        <WalletConnect />
      </section>

      {/* Projects Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">{t('Proyectos Activos', 'Active Projects')}</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">{t('Total Recaudado', 'Total Raised')}</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.reduce((sum, p) => sum + (p.raisedAmount || 0), 0)} XLM
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">{t('Proyectos Completados', 'Completed Projects')}</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {myProjects.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">{t('Donaciones Recibidas', 'Donations Received')}</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {received ? received.length : 0}
          </p>
        </div>
      </section>

      {/* Donations Received Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">{t('Total en Donaciones', 'Total in Donations')}</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {totalReceived.toFixed(2)} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">{t('Recibido de donadores', 'Received from donors')}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">{t('Promedio por Donación', 'Average per Donation')}</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {received && received.length > 0 ? (totalReceived / received.length).toFixed(2) : '0.00'} XLM
          </p>
          <p className="mt-1 text-xs text-gray-500">{t('Tamaño promedio', 'Average size')}</p>
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
            {t('Crear Proyecto', 'Create Project')}
          </button>
        </div>
        
        {projectsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('Cargando tus proyectos...', 'Loading your projects...')}</p>
          </div>
        ) : projectsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>{t('No se pudieron cargar los proyectos.', 'The projects could not be loaded.')} {projectsError}</p>
          </div>
        ) : myProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project, index) => (
              <ProjectCard key={getProjectId(project) || `my-project-${index}`} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>{t('No tienes proyectos aún. ¡Crea uno para comenzar!', 'You do not have any projects yet. Create one to get started!')}</p>
          </div>
        )}
      </section>

      {/* Donations Received Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('Donaciones Recibidas', 'Donations Received')}</h2>
        {donationsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('Cargando donaciones recibidas...', 'Loading received donations...')}</p>
          </div>
        ) : donationsError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>{t('No se pudieron cargar las donaciones.', 'The donations could not be loaded.')} {donationsError}</p>
          </div>
        ) : received && received.length > 0 ? (
          <DonationList donations={received} type="received" compact />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p>{t('Aún no tienes donaciones. ¡Promociona tus proyectos para empezar a recibir apoyo!', 'You do not have donations yet. Promote your projects to start receiving support!')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  kyc_pending: 'KYC pendiente',
  kyc_verified: 'KYC verificado',
  auto_review_failed: 'Revisión automática fallida',
  manual_review_pending: 'Curaduría manual pendiente',
  approved_for_funding: 'Aprobado para fondeo',
  active: 'Activo',
  funded: 'Fondeado',
  completed: 'Completado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado'
};

const toDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const creatorDisplayName = (project: Project) => {
  if (!project.creator || typeof project.creator !== 'object') return 'N/A';
  return project.creator.name || project.creator.username || project.creator.email || 'N/A';
};

const AdminDashboard = () => {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<AdminOverviewResponse['source']>('admin-overview');

  const loadOverview = async (forceCheck = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.getAdminOverview({ forceCheck });
      setProjects(response.projects || []);
      setDataSource(response.source);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : t('No se pudo cargar el panel admin', 'The admin panel could not be loaded');
      setError(message);
      setProjects([]);
      setDataSource('admin-overview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const summary = useMemo(() => {
    const pending = projects.filter((project) => project.status === 'manual_review_pending').length;
    const approved = projects.filter((project) => project.status === 'approved_for_funding').length;
    const rejected = projects.filter((project) => project.status === 'rejected').length;
    return {
      total: projects.length,
      pending,
      approved,
      rejected
    };
  }, [projects]);

  const reviewProjects = useMemo(
    () => projects.filter((project) => ['kyc_verified', 'auto_review_failed', 'manual_review_pending', 'approved_for_funding', 'rejected'].includes(String(project.status || ''))),
    [projects]
  );

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Control de Proyectos y Curaduría</h2>
            
            <p className="text-sm text-gray-600 mt-1">
              {t('Vista completa de la información enviada por creadores para validar calidad y trazabilidad.', 'Full view of the information submitted by creators to validate quality and traceability.')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => loadOverview(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? t('Actualizando...', 'Updating...') : t('Actualizar', 'Refresh')}
            </button>
            <Link
              to="/curation"
              className="px-4 py-2 rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {t('Ir a Curaduría', 'Go to Curation')}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-slate-700">
          <p className="text-sm text-gray-500">{t('Total proyectos', 'Total projects')}</p>
          <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <p className="text-sm text-gray-500">{t('Pendientes manual', 'Manual pending')}</p>
          <p className="text-2xl font-bold text-amber-700">{summary.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">{t('Aprobados', 'Approved')}</p>
          <p className="text-2xl font-bold text-green-700">{summary.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">{t('Rechazados', 'Rejected')}</p>
          <p className="text-2xl font-bold text-red-700">{summary.rejected}</p>
        </div>
      </section>

      {error && (
        <section className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </section>
      )}

      {dataSource === 'fallback-projects-all' && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
          {t('El backend actual no expone todavía /projects/admin/overview. Mostrando fallback con /projects?status=all.', 'The current backend does not expose /projects/admin/overview yet. Showing the fallback using /projects?status=all.')}
        </section>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Proyectos Enviados a Revisión', 'Projects Submitted for Review')}</h3>

        {isLoading ? (
          <p className="text-sm text-gray-600">{t('Cargando proyectos en revisión...', 'Loading projects under review...')}</p>
        ) : reviewProjects.length === 0 ? (
          <p className="text-sm text-gray-600">{t('No hay proyectos en flujo de revisión.', 'There are no projects in the review flow.')}</p>
        ) : (
          <div className="space-y-3">
            {reviewProjects.map((project) => {
              const projectId = project._id || project.id || '';
              return (
                <div key={`review-${projectId}`} className="border border-gray-200 rounded-lg p-3 overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900 break-words min-w-0">{project.title}</p>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-800">
                      {STATUS_LABELS[String(project.status || '')] || project.status || t('Sin estado', 'No status')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 break-words">{t('Creador:', 'Creator:')} {creatorDisplayName(project)}</p>
                  <p className="text-xs text-gray-600">KYC: {project.verification?.kyc?.status || 'N/A'} | {t('Manual', 'Manual')}: {project.verification?.manualReview?.status || 'N/A'}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Detalle de Información del Creador', 'Creator Information Details')}</h3>

        {isLoading ? (
          <p className="text-sm text-gray-600">{t('Cargando proyectos...', 'Loading projects...')}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-600">{t('No hay proyectos para mostrar.', 'There are no projects to display.')}</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectId = project._id || project.id || '';
              const creator = typeof project.creator === 'object' ? project.creator : undefined;
              const creatorValidation = creator?.creatorValidation;
              const kycDocuments = project.verification?.kyc?.documents || [];
              const autoReasons = project.verification?.autoReview?.reasons || [];
              const timeline = project.verification?.timeline || [];
              const milestones = project.milestones || [];

              return (
                <details key={projectId} className="border border-gray-200 rounded-lg p-4 group overflow-hidden">
                  <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 break-words">{project.title}</p>
                      <p className="text-xs text-gray-600 break-words">{t('Creador:', 'Creator:')} {creatorDisplayName(project)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-800 w-fit">
                      {STATUS_LABELS[String(project.status || '')] || project.status || t('Sin estado', 'No status')}
                    </span>
                  </summary>

                  <div className="mt-4 space-y-4 text-sm text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded p-3 break-words">Descripción: {project.description}</div>
                      <div className="bg-gray-50 rounded p-3 break-words">Categoría: {project.category || 'N/A'}</div>
                      <div className="bg-gray-50 rounded p-3 break-words">Meta: {project.targetAmount || '0'} XLM</div>
                      <div className="bg-gray-50 rounded p-3 break-all">Wallet proyecto: {project.walletAddress || 'N/A'}</div>
                      <div className="bg-gray-50 rounded p-3">{t('Creado:', 'Created:')} {new Date(project.createdAt || '').toLocaleString(language === 'en' ? 'en-US' : 'es-ES') || 'N/A'}</div>
                      <div className="bg-gray-50 rounded p-3">{t('Actualizado:', 'Updated:')} {new Date(project.updatedAt || '').toLocaleString(language === 'en' ? 'en-US' : 'es-ES') || 'N/A'}</div>
                      <div className="bg-gray-50 rounded p-3 break-words">Impacto ambiental: {project.environmentalImpact?.metric || 'N/A'} {project.environmentalImpact?.value ?? ''} {project.environmentalImpact?.unit || ''}</div>
                      <div className="bg-gray-50 rounded p-3">Monto actual: {project.currentAmount || '0'} XLM</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-emerald-200 bg-emerald-50 rounded p-3 break-words">
                        <p className="font-semibold text-emerald-900">Datos de validación del creador</p>
                        <p>País: {creatorValidation?.country || 'N/A'}</p>
                        <p>Organización: {creatorValidation?.organizationName || 'N/A'}</p>
                        <p>ID gubernamental: {creatorValidation?.governmentId || 'N/A'}</p>
                        <p>Sitio web: {creatorValidation?.website || 'N/A'}</p>
                        <p>Documento de verificación: {creatorValidation?.verificationDocumentUrl || 'N/A'}</p>
                      </div>

                      <div className="border border-blue-200 bg-blue-50 rounded p-3 break-words">
                        <p className="font-semibold text-blue-900">Revisión del proyecto</p>
                        <p>Perfil KYC: {project.verification?.profileType || 'N/A'}</p>
                        <p>Estado KYC: {project.verification?.kyc?.status || 'N/A'}</p>
                        <p>Revisado KYC: {toDate(project.verification?.kyc?.reviewedAt)}</p>
                        <p>Score automático: {project.verification?.autoReview?.score ?? 'N/A'}</p>
                        <p>Estado manual: {project.verification?.manualReview?.status || 'N/A'}</p>
                        <p>Revisión manual: {toDate(project.verification?.manualReview?.reviewedAt)}</p>
                        <p>Notas manuales: {project.verification?.manualReview?.notes || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-gray-200 rounded p-3">
                        <p className="font-semibold text-gray-900 mb-1">Documentos KYC enviados</p>
                        {kycDocuments.length > 0 ? (
                          <ul className="space-y-3 text-xs">
                            {kycDocuments.map((docUrl, index) => (
                              <li key={`${projectId}-doc-${index}`} className="space-y-2">
                                <img
                                  src={docUrl}
                                  alt={`Documento KYC ${index + 1} de ${project.title}`}
                                  className="w-full max-w-xs h-40 object-cover rounded border border-gray-200 bg-gray-100"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-700 hover:text-blue-800 underline break-all"
                                >
                                  Ver imagen completa
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-600">Sin documentos registrados.</p>
                        )}
                      </div>

                      <div className="border border-amber-200 bg-amber-50 rounded p-3 break-words">
                        <p className="font-semibold text-amber-900 mb-1">Observaciones automáticas</p>
                        {autoReasons.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900">
                            {autoReasons.map((reason, index) => (
                              <li key={`${projectId}-reason-${index}`}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-amber-900">Sin observaciones.</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-gray-200 rounded p-3">
                        <p className="font-semibold text-gray-900 mb-1">Hitos declarados</p>
                        {milestones.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {milestones.map((milestone, index) => (
                              <li key={`${projectId}-milestone-${index}`}>
                                {milestone.description || 'Sin descripción'} | {milestone.targetAmount || '0'} XLM | {milestone.completed ? 'Completado' : 'Pendiente'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-600">No se registraron hitos.</p>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded p-3">
                        <p className="font-semibold text-gray-900 mb-1">Trazabilidad de revisión</p>
                        {timeline.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {timeline.map((step, index) => (
                              <li key={`${projectId}-timeline-${index}`}>
                                {step.stage || 'N/A'} | {toDate(step.at)} | {step.note || 'Sin nota'}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-600">Sin eventos de trazabilidad.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {user.role === 'donor'
          ? t('Panel de Donador', 'Donor Dashboard')
          : user.role === 'creator'
            ? t('Panel de Creador', 'Creator Dashboard')
            : t('Panel de Administración', 'Admin Dashboard')}
      </h1>
      
      {user.role === 'donor'
        ? <DonorDashboard />
        : user.role === 'creator'
          ? <CreatorDashboard />
          : <AdminDashboard />}
    </div>
  );
}

export default Dashboard;