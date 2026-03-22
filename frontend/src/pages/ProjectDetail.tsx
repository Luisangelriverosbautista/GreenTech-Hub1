import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { ShareProject } from '../components/ShareProject';
import type { Project } from '../types';
import projectService from '../services/project.service';
import { uploadService } from '../services/upload.service';
import { escrowService, type Escrow, type ProgressUpdate } from '../services/escrow.service';
import { getAddress, signMessage } from '@stellar/freighter-api';

const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024;

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [escrowSuccess, setEscrowSuccess] = useState(false);
  const [isEscrowDonating, setIsEscrowDonating] = useState(false);
  const [projectEscrows, setProjectEscrows] = useState<Escrow[]>([]);
  const [isEscrowsLoading, setIsEscrowsLoading] = useState(false);
  const [escrowActionInProgressId, setEscrowActionInProgressId] = useState<string | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [progressSubmitting, setProgressSubmitting] = useState(false);
  const [isUploadingEvidenceFiles, setIsUploadingEvidenceFiles] = useState(false);
  const [uploadedEvidenceUrls, setUploadedEvidenceUrls] = useState<string[]>([]);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = useState<string | null>(null);
  const [progressForm, setProgressForm] = useState({
    title: '',
    description: '',
    evidenceCsv: '',
    progressPercent: '0',
    milestoneIndex: '0',
    requestedAmount: ''
  });

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
      setLoadError(null);
    } catch {
      setLoadError('Error al cargar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEscrows = async (projectId: string) => {
    try {
      setIsEscrowsLoading(true);
      const response = await escrowService.getProjectEscrows(projectId);
      setProjectEscrows((response.escrows || []) as Escrow[]);
    } catch (escrowLoadError) {
      console.error('Error al cargar escrows:', escrowLoadError);
    } finally {
      setIsEscrowsLoading(false);
    }
  };

  const handleDonateWithEscrow = async () => {
    if (!user || !project || !donationAmount) return;

    try {
      setIsEscrowDonating(true);
      setActionError(null);
      setActionMessage(null);

      const walletResult = await getAddress();
      if (walletResult.error || !walletResult.address) {
        throw new Error('No se pudo obtener la dirección de Freighter');
      }

      const consentNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const consentMessage = [
        'GreenTech Hub - Autorización de donación escrow',
        `Proyecto: ${project.title}`,
        `Monto: ${donationAmount} XLM`,
        `Donante: ${walletResult.address}`,
        `Nonce: ${consentNonce}`
      ].join('\n');

      const signedMessageResult = await signMessage(consentMessage, { address: walletResult.address });
      if (signedMessageResult.error || !signedMessageResult.signedMessage) {
        throw new Error(signedMessageResult.error?.message || 'Firma de autorización cancelada o inválida');
      }

      const rawSignedMessage = signedMessageResult.signedMessage as any;
      const consentSignature = typeof rawSignedMessage === 'string'
        ? rawSignedMessage
        : Array.isArray(rawSignedMessage?.data)
          ? btoa(String.fromCharCode(...rawSignedMessage.data))
          : btoa(String(rawSignedMessage));
      if (!consentSignature) {
        throw new Error('Firma de autorización cancelada o inválida');
      }

      await escrowService.donateWithEscrow(project._id || project.id || '', {
        amount: donationAmount.toString(),
        donorAddress: walletResult.address,
        metadata: {
          source: 'project-detail',
          projectTitle: project.title,
          walletConsent: {
            type: 'freighter-sign-message',
            message: consentMessage,
            signature: consentSignature,
            signedAt: new Date().toISOString(),
            walletAddress: walletResult.address,
            nonce: consentNonce
          }
        }
      });

      setEscrowSuccess(true);
      setActionMessage('Escrow creado correctamente. Ya puedes aprobar y liberar fondos según el rol.');
      setDonationAmount('');
      setTimeout(() => setEscrowSuccess(false), 5000);
      await loadProject(id!);
      await loadEscrows(id!);
    } catch (escrowError: unknown) {
      console.error('Error en la donación con escrow:', escrowError);
      if (axios.isAxiosError(escrowError)) {
        const backendMessage = (escrowError.response?.data as any)?.error || (escrowError.response?.data as any)?.details;
        setActionError(backendMessage || 'Error al procesar la donación con escrow');
      } else {
        setActionError('Error al procesar la donación con escrow');
      }
    } finally {
      setIsEscrowDonating(false);
    }
  };

  const handleApproveEscrow = async (escrowId: string) => {
    if (!id) return;

    try {
      setEscrowActionInProgressId(escrowId);
      setActionError(null);
      setActionMessage(null);
      await escrowService.approveEscrow(escrowId, 0);
      await loadEscrows(id);
      setActionMessage('Escrow aprobado. El siguiente paso es liberar fondos.');
    } catch (approveError) {
      console.error('Error al aprobar escrow:', approveError);
      setActionError('No se pudo aprobar el escrow');
    } finally {
      setEscrowActionInProgressId(null);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!id) return;

    try {
      setEscrowActionInProgressId(escrowId);
      setActionError(null);
      setActionMessage(null);
      await escrowService.releaseEscrowFunds(escrowId, 0);
      await Promise.all([loadEscrows(id), loadProject(id)]);
      setActionMessage('Fondos liberados correctamente y balance del proyecto actualizado.');
    } catch (releaseError) {
      console.error('Error al liberar escrow:', releaseError);
      setActionError('No se pudo liberar el escrow');
    } finally {
      setEscrowActionInProgressId(null);
    }
  };

  const getEntityId = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null;
    const maybeRecord = value as Record<string, unknown>;
    const idValue = maybeRecord._id || maybeRecord.id;
    return typeof idValue === 'string' ? idValue : null;
  };

  const currentUserId = user?._id || user?.id || null;
  const projectCreatorId = getEntityId(project?.creator) || project?.creatorId || null;
  const participantEscrow = projectEscrows.find((escrow) => {
    const donorId = escrow.donor?._id || escrow.donor?.id;
    const creatorId = escrow.creator?._id || escrow.creator?.id;
    return Boolean(currentUserId && (currentUserId === donorId || currentUserId === creatorId));
  });
  const activeEscrow = participantEscrow || projectEscrows.find(e => ['funded', 'approved', 'partially-released'].includes(e.status)) || projectEscrows[0] || null;
  const activeEscrowDonorId = activeEscrow ? (activeEscrow.donor?._id || activeEscrow.donor?.id) : null;
  const activeEscrowCreatorId = activeEscrow ? (activeEscrow.creator?._id || activeEscrow.creator?.id) : null;
  const isProjectCreator = Boolean(currentUserId && projectCreatorId && currentUserId === projectCreatorId);
  const canSubmitProgress = Boolean(
    activeEscrow &&
    currentUserId &&
    ((activeEscrowCreatorId && currentUserId === activeEscrowCreatorId) || isProjectCreator)
  );
  const canReviewProgress = Boolean(activeEscrow && currentUserId && activeEscrowDonorId && currentUserId === activeEscrowDonorId);

  const loadProgressUpdates = async (escrowId: string) => {
    try {
      setIsProgressLoading(true);
      const response = await escrowService.getProgressUpdates(escrowId);
      setProgressUpdates(response.updates || []);
    } catch (progressError) {
      if (axios.isAxiosError(progressError) && progressError.response?.status === 403) {
        setProgressUpdates([]);
        return;
      }
      console.error('Error al cargar avances:', progressError);
      setProgressUpdates([]);
    } finally {
      setIsProgressLoading(false);
    }
  };

  const handleSubmitProgressUpdate = async () => {
    if (!activeEscrow) return;

    try {
      setProgressSubmitting(true);
      setActionError(null);
      setActionMessage(null);

      const evidenceCsvUrls = progressForm.evidenceCsv
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

      const evidenceUrls = Array.from(new Set([...uploadedEvidenceUrls, ...evidenceCsvUrls]));

      await escrowService.createProgressUpdate(activeEscrow._id, {
        title: progressForm.title.trim(),
        description: progressForm.description.trim(),
        evidenceUrls,
        progressPercent: Number(progressForm.progressPercent || 0),
        milestoneIndex: Number(progressForm.milestoneIndex || 0),
        requestedAmount: progressForm.requestedAmount ? String(progressForm.requestedAmount) : undefined
      });

      setProgressForm({
        title: '',
        description: '',
        evidenceCsv: '',
        progressPercent: '0',
        milestoneIndex: '0',
        requestedAmount: ''
      });
      setUploadedEvidenceUrls([]);

      setActionMessage('Avance enviado correctamente. Pendiente de aprobación del donante.');
      await loadProgressUpdates(activeEscrow._id);
    } catch (submitError) {
      console.error('Error al enviar avance:', submitError);
      if (axios.isAxiosError(submitError)) {
        const backendMessage = (submitError.response?.data as any)?.error || (submitError.response?.data as any)?.details;
        setActionError(backendMessage || 'No se pudo enviar el avance');
      } else {
        setActionError('No se pudo enviar el avance');
      }
    } finally {
      setProgressSubmitting(false);
    }
  };

  const handleProgressEvidenceFilesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!ALLOWED_EVIDENCE_TYPES.includes(String(file.type || '').toLowerCase())) {
        setActionError('Formato de evidencia no permitido. Usa JPG, PNG, WEBP o GIF.');
        event.target.value = '';
        return;
      }
      if (file.size > MAX_EVIDENCE_FILE_BYTES) {
        setActionError('Una evidencia supera 5MB. Usa archivos más livianos.');
        event.target.value = '';
        return;
      }
    }

    try {
      setIsUploadingEvidenceFiles(true);
      setActionError(null);
      const uploadedBatch = await Promise.all(files.map((file) => uploadService.uploadImage(file)));
      const urls = uploadedBatch.map((item) => item.url).filter(Boolean);
      setUploadedEvidenceUrls((prev) => Array.from(new Set([...prev, ...urls])));
    } catch (uploadError) {
      console.error('Error al subir evidencias:', uploadError);
      setActionError(uploadError instanceof Error ? uploadError.message : 'No se pudieron subir las evidencias.');
    } finally {
      setIsUploadingEvidenceFiles(false);
      event.target.value = '';
    }
  };

  const removeUploadedEvidenceUrl = (urlToRemove: string) => {
    setUploadedEvidenceUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const openEvidencePreview = (url: string) => {
    setEvidencePreviewUrl(url);
  };

  const closeEvidencePreview = () => {
    setEvidencePreviewUrl(null);
  };

  const handleApproveProgressUpdate = async (updateId: string) => {
    if (!activeEscrow || !id) return;

    try {
      setActionError(null);
      setActionMessage(null);
      await escrowService.approveProgressUpdate(activeEscrow._id, updateId);
      await Promise.all([loadProgressUpdates(activeEscrow._id), loadEscrows(id), loadProject(id)]);
      setActionMessage('Avance aprobado y fondos liberados para ese hito.');
    } catch (approveError) {
      console.error('Error al aprobar avance:', approveError);
      if (axios.isAxiosError(approveError)) {
        const backendMessage = (approveError.response?.data as any)?.error || (approveError.response?.data as any)?.details;
        setActionError(backendMessage || 'No se pudo aprobar el avance');
      } else {
        setActionError('No se pudo aprobar el avance');
      }
    }
  };

  const handleRejectProgressUpdate = async (updateId: string) => {
    if (!activeEscrow) return;

    const note = window.prompt('Motivo del rechazo (opcional):', '') || '';

    try {
      setActionError(null);
      setActionMessage(null);
      await escrowService.rejectProgressUpdate(activeEscrow._id, updateId, note);
      await loadProgressUpdates(activeEscrow._id);
      setActionMessage('Avance rechazado. No se liberaron fondos.');
    } catch (rejectError) {
      console.error('Error al rechazar avance:', rejectError);
      if (axios.isAxiosError(rejectError)) {
        const backendMessage = (rejectError.response?.data as any)?.error || (rejectError.response?.data as any)?.details;
        setActionError(backendMessage || 'No se pudo rechazar el avance');
      } else {
        setActionError('No se pudo rechazar el avance');
      }
    }
  };

  useEffect(() => {
    if (id && user) {
      loadEscrows(id);
    }
  }, [id, user]);

  useEffect(() => {
    if (activeEscrow?._id && (canSubmitProgress || canReviewProgress)) {
      loadProgressUpdates(activeEscrow._id);
    } else {
      setProgressUpdates([]);
    }
  }, [activeEscrow?._id, canSubmitProgress, canReviewProgress]);

  const getProgressStatusLabel = (status: ProgressUpdate['status']) => {
    const map: Record<ProgressUpdate['status'], string> = {
      submitted: 'Pendiente de revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      released: 'Liberado'
    };
    return map[status] || status;
  };

  const getEscrowStatusLabel = (status: Escrow['status']) => {
    const labels: Record<Escrow['status'], string> = {
      draft: 'Borrador',
      funded: 'Fondeado',
      approved: 'Aprobado',
      'partially-released': 'Parcialmente liberado',
      released: 'Liberado',
      disputed: 'En disputa',
      resolved: 'Resuelto',
      failed: 'Fallido'
    };
    return labels[status] || status;
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
      'draft': { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
      'kyc_pending': { label: 'KYC Pendiente', color: 'bg-amber-100 text-amber-800' },
      'kyc_verified': { label: 'KYC Verificado', color: 'bg-cyan-100 text-cyan-800' },
      'auto_review_failed': { label: 'Revisión Automática Fallida', color: 'bg-red-100 text-red-800' },
      'manual_review_pending': { label: 'Curaduría Pendiente', color: 'bg-orange-100 text-orange-800' },
      'approved_for_funding': { label: 'Aprobado para Fondeo', color: 'bg-emerald-100 text-emerald-800' },
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

  if (loadError || !project) {
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
            <p className="font-semibold">{loadError || 'Proyecto no encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAmount = Number.parseFloat(String(project.currentAmount ?? 0)) || 0;
  const targetAmount = Number.parseFloat(String(project.targetAmount ?? 0)) || 0;
  const escrowsForFunding = projectEscrows.filter((escrow) => escrow.status !== 'failed');
  const escrowCommittedAmount = escrowsForFunding.reduce((sum, escrow) => {
    const amount = Number.parseFloat(String(escrow.amountTotal || 0));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const escrowReleasedAmount = escrowsForFunding.reduce((sum, escrow) => {
    const amount = Number.parseFloat(String(escrow.amountReleased || 0));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const directFundingAmount = Math.max(currentAmount - escrowReleasedAmount, 0);
  const committedAmount = directFundingAmount + escrowCommittedAmount;
  const availableAmount = currentAmount;
  const progress = targetAmount > 0 ? (committedAmount / targetAmount) * 100 : 0;
  const isFunded = targetAmount > 0 && committedAmount >= targetAmount;
  const remainingAmount = Math.max(targetAmount - committedAmount, 0);
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;
  const milestonesProgressPercent = milestones.length > 0
    ? (completedMilestones / milestones.length) * 100
    : 0;
  const releasedByMilestones = milestones.reduce((acc, milestone) => {
    if (!milestone.completed) {
      return acc;
    }

    const amount = Number.parseFloat(String(milestone.targetAmount || 0));
    return acc + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const effectiveStatus = project.status === 'completed'
    ? 'completed'
    : (project.status === 'cancelled' ? 'cancelled' : (isFunded ? 'funded' : (project.status || 'active')));
  const isFundableStatus = ['approved_for_funding', 'active'].includes(effectiveStatus);
  const parsedDonationAmount = Number.parseFloat(donationAmount);
  const hasValidDonationAmount = Number.isFinite(parsedDonationAmount) && parsedDonationAmount > 0;
  const donateButtonDisabled = !hasValidDonationAmount || isEscrowDonating || isFunded;
  const donateButtonHelpText = isFunded
    ? 'Este proyecto ya alcanzó su meta y no acepta más donaciones.'
    : !hasValidDonationAmount
      ? 'Ingresa una cantidad mayor a 0 para habilitar la donación.'
      : isEscrowDonating
        ? 'Se está procesando tu donación con escrow.'
        : '';
  const categoryBadge = getCategoryBadge(project.category);
  const statusBadge = getStatusBadge(effectiveStatus);
  const creatorData = (typeof project.creator === 'object' && project.creator)
    ? (project.creator as Record<string, unknown>)
    : null;
  const creatorName = String(
    creatorData?.name ||
    creatorData?.username ||
    (typeof creatorData?.email === 'string' ? creatorData.email.split('@')[0] : '') ||
    'Creador verificado'
  );

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
            {escrowSuccess && (
              <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg">
                <p className="font-semibold">Escrow creado correctamente. Fondos en custodia hasta liberación.</p>
              </div>
            )}

            {actionMessage && (
              <div className="mb-6 bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg">
                <p className="font-semibold">{actionMessage}</p>
              </div>
            )}

            {actionError && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">{actionError}</p>
              </div>
            )}

            {/* Hero Image */}
            {project.imageUrl && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-lg bg-gray-100">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-96 object-cover object-center"
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
                      <p className="text-gray-600 text-sm font-medium">Comprometido</p>
                      <p className="text-2xl font-bold text-green-600">
                        {committedAmount.toFixed(2)} XLM
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Meta</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {targetAmount.toFixed(2)} XLM
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium">Disponible</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {availableAmount.toFixed(2)} XLM
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
                  <p className="mt-3 text-sm text-gray-600">
                    {isFunded ? 'Meta de fondeo comprometida completada.' : `Faltan ${remainingAmount.toFixed(2)} XLM comprometidos para alcanzar la meta`}
                  </p>
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    La barra crece con cada donación comprometida en escrow. El creador solo puede usar los fondos ya liberados al cumplir cada hito.
                  </p>
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
                    <div className="mb-5 border border-emerald-200 bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-emerald-900">Progreso por Fases</p>
                        <p className="text-sm font-bold text-emerald-800">
                          {completedMilestones}/{milestones.length} fases
                        </p>
                      </div>
                      <div className="bg-emerald-100 rounded-full h-2.5 overflow-hidden mb-2">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(milestonesProgressPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs text-emerald-900">
                        <span>{Math.min(milestonesProgressPercent, 100).toFixed(1)}% completado</span>
                        <span>{releasedByMilestones.toFixed(2)} XLM en fases completadas</span>
                      </div>
                    </div>
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

                {/* Progress Updates */}
                {(activeEscrow || user?.role === 'creator' || user?.role === 'donor') && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Avances del Proyecto (Escrow)
                    </h2>

                    {!activeEscrow && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                        Aún no hay un escrow activo para este proyecto. Cuando un donador use "Donar con Escrow",
                        aquí podrás subir evidencias para solicitar liberación de pagos.
                      </p>
                    )}

                    {activeEscrow && canSubmitProgress && (
                      <div className="mb-6 border border-emerald-200 bg-emerald-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-emerald-800">Enviar nuevo avance</p>
                        <input
                          type="text"
                          placeholder="Título del avance"
                          value={progressForm.title}
                          onChange={e => setProgressForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <textarea
                          placeholder="Describe qué se avanzó..."
                          value={progressForm.description}
                          onChange={e => setProgressForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          rows={3}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="% avance"
                            value={progressForm.progressPercent}
                            onChange={e => setProgressForm(prev => ({ ...prev, progressPercent: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded"
                          />
                          <input
                            type="number"
                            min="0"
                            placeholder="Índice hito"
                            value={progressForm.milestoneIndex}
                            onChange={e => setProgressForm(prev => ({ ...prev, milestoneIndex: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Monto solicitado (XLM)"
                            value={progressForm.requestedAmount}
                            onChange={e => setProgressForm(prev => ({ ...prev, requestedAmount: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="URLs de evidencia separadas por coma"
                          value={progressForm.evidenceCsv}
                          onChange={e => setProgressForm(prev => ({ ...prev, evidenceCsv: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <div className="border border-gray-200 rounded p-3 bg-white space-y-2">
                          <p className="text-xs text-gray-700">
                            También puedes subir imágenes de evidencia (JPG, PNG, WEBP o GIF, máx. 5MB c/u).
                          </p>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            multiple
                            onChange={handleProgressEvidenceFilesUpload}
                            className="w-full text-sm"
                          />
                          {isUploadingEvidenceFiles && (
                            <p className="text-xs text-blue-700">Subiendo evidencias...</p>
                          )}
                          {uploadedEvidenceUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {uploadedEvidenceUrls.map((url, index) => (
                                <div key={`${url}-${index}`} className="relative border border-gray-200 rounded p-1 bg-gray-50">
                                  <img
                                    src={url}
                                    alt={`Evidencia subida ${index + 1}`}
                                    className="w-full h-20 object-cover rounded"
                                    onClick={() => openEvidencePreview(url)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeUploadedEvidenceUrl(url)}
                                    className="absolute top-1 right-1 text-xs bg-white border border-gray-300 rounded px-1 hover:bg-gray-100"
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleSubmitProgressUpdate}
                          disabled={!progressForm.title.trim() || !progressForm.description.trim() || progressSubmitting || isUploadingEvidenceFiles}
                          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {progressSubmitting ? 'Enviando...' : 'Enviar Avance'}
                        </button>
                      </div>
                    )}

                    {!canSubmitProgress && !canReviewProgress && activeEscrow && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                        Este panel muestra acciones solo para participantes del escrow. Si eres creador, puedes subir evidencia. Si eres donante, puedes aprobar/rechazar y liberar.
                      </p>
                    )}

                    {isProgressLoading ? (
                      <p className="text-sm text-gray-600">Cargando avances...</p>
                    ) : progressUpdates.length === 0 ? (
                      <p className="text-sm text-gray-600">No hay avances registrados para este escrow.</p>
                    ) : (
                      <div className="space-y-3">
                        {progressUpdates.map(update => (
                          <div key={update._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">{update.title}</p>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                {getProgressStatusLabel(update.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                            <p className="text-xs text-gray-600 mb-2">
                              Hito #{update.milestoneIndex} · Avance {update.progressPercent}%
                              {update.requestedAmount ? ` · Solicita ${update.requestedAmount} XLM` : ''}
                            </p>

                            {Array.isArray(update.evidenceUrls) && update.evidenceUrls.length > 0 && (
                              <div className="mb-3 space-y-2">
                                {update.evidenceUrls.map((url, idx) => (
                                  <div key={`${update._id}-${idx}`} className="space-y-1">
                                    <img
                                      src={url}
                                      alt={`Evidencia ${idx + 1} del avance ${update.title}`}
                                      className="w-full max-w-xs h-28 object-cover rounded border border-gray-200 bg-gray-100 cursor-zoom-in"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      onClick={() => openEvidencePreview(url)}
                                    />
                                    <a href={url} target="_blank" rel="noreferrer" className="block text-xs text-blue-700 hover:underline break-all">
                                      Evidencia {idx + 1}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {canReviewProgress && update.status === 'submitted' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveProgressUpdate(update._id)}
                                  className="px-3 py-2 text-sm font-semibold rounded bg-green-100 text-green-800 hover:bg-green-200"
                                >
                                  Aprobar y Liberar
                                </button>
                                <button
                                  onClick={() => handleRejectProgressUpdate(update._id)}
                                  className="px-3 py-2 text-sm font-semibold rounded bg-red-100 text-red-800 hover:bg-red-200"
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                {user?.role === 'donor' && isFundableStatus && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Realizar Donación
                    </h3>

                    {project.tokenRewards && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Reconocimiento:</span> al concluir el proyecto se otorgara un reconocimiento de impacto digital a quienes apoyaron su financiamiento.
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
                        onClick={handleDonateWithEscrow}
                        disabled={donateButtonDisabled}
                        title={donateButtonHelpText}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEscrowDonating ? 'Creando escrow...' : 'Donar con Escrow'}
                      </button>
                      {donateButtonHelpText && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          {donateButtonHelpText}
                        </p>
                      )}
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
                    {project.walletAddress && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Wallet del Proyecto</p>
                        <p className="text-xs text-gray-900 font-mono break-all">{project.walletAddress}</p>
                      </div>
                    )}
                    {project.profileType && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Tipo de Creador</p>
                        <p className="text-sm text-gray-900">{project.profileType === 'organization' ? 'Organización' : 'Persona / Individuo'}</p>
                      </div>
                    )}
                    {(project.location?.address || (project.location?.lat !== undefined && project.location?.lng !== undefined)) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Ubicación declarada</p>
                        {project.location?.address && (
                          <p className="text-sm text-gray-900">{project.location.address}</p>
                        )}
                        {project.location?.lat !== undefined && project.location?.lng !== undefined && (
                          <p className="text-xs text-gray-700 font-mono">
                            {project.location.lat}, {project.location.lng}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Estado</p>
                      <p className="text-sm text-gray-900">{statusBadge.label}</p>
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

                {/* Escrow Status Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Escrows del Proyecto
                  </h3>

                  {isEscrowsLoading ? (
                    <p className="text-sm text-gray-600">Cargando escrows...</p>
                  ) : projectEscrows.length === 0 ? (
                    <p className="text-sm text-gray-600">Aún no hay escrows para este proyecto.</p>
                  ) : (
                    <div className="space-y-3">
                      {projectEscrows.slice(0, 5).map((escrow) => {
                        const donorId = escrow.donor?._id || escrow.donor?.id;
                        const creatorId = escrow.creator?._id || escrow.creator?.id;
                        const userId = user?._id || user?.id;
                        const isDonor = Boolean(userId && donorId && userId === donorId);
                        const isCreator = Boolean(userId && creatorId && userId === creatorId);

                        return (
                          <div key={escrow._id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="text-xs font-semibold text-gray-700 uppercase">
                                {getEscrowStatusLabel(escrow.status)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(escrow.createdAt).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <p className="text-sm text-gray-800">
                              Total: <span className="font-semibold">{escrow.amountTotal} XLM</span>
                            </p>
                            <p className="text-sm text-gray-800 mb-3">
                              Liberado: <span className="font-semibold">{escrow.amountReleased} XLM</span>
                            </p>

                            <div className="flex gap-2">
                              {isDonor && (escrow.status === 'funded' || escrow.status === 'partially-released') && (
                                <button
                                  onClick={() => handleApproveEscrow(escrow._id)}
                                  disabled={escrowActionInProgressId === escrow._id}
                                  className="flex-1 px-3 py-2 text-sm font-semibold rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                                >
                                  Aprobar
                                </button>
                              )}

                              {(isDonor || isCreator) && (escrow.status === 'approved' || escrow.status === 'partially-released') && (
                                <button
                                  onClick={() => handleReleaseEscrow(escrow._id)}
                                  disabled={escrowActionInProgressId === escrow._id}
                                  className="flex-1 px-3 py-2 text-sm font-semibold rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                                >
                                  Liberar Fondos
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {evidencePreviewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-8 flex items-center justify-center"
          onClick={closeEvidencePreview}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closeEvidencePreview}
              className="absolute -top-10 right-0 text-white bg-black/40 hover:bg-black/60 rounded px-3 py-1"
            >
              Cerrar
            </button>
            <img
              src={evidencePreviewUrl}
              alt="Vista previa de evidencia"
              className="w-full max-h-[85vh] object-contain rounded-lg bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;