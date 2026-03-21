const express = require('express');
const router = express.Router();
const getSorobanService = require('../../soroban/soroban.service');
const auth = require('./../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

const PUBLIC_PROJECT_STATUSES = ['approved_for_funding', 'active', 'funded', 'completed'];
const GREENWASHING_KEYWORDS = ['crypto mining', 'casino', 'betting', 'quick profit', 'green token only'];

const ensureAdminReviewer = async (req, res) => {
    const adminKey = req.header('x-review-admin-key');
    if (!process.env.PROJECT_REVIEW_ADMIN_KEY || adminKey !== process.env.PROJECT_REVIEW_ADMIN_KEY) {
        res.status(403).json({ error: 'No autorizado para revisión manual' });
        return null;
    }

    const reviewer = await User.findById(req.user.userId);
    if (!reviewer || reviewer.role !== 'admin') {
        res.status(403).json({ error: 'Se requiere rol admin para esta acción' });
        return null;
    }

    return reviewer;
};

const runAutomaticViabilityAnalysis = (projectPayload) => {
    const reasons = [];
    let score = 100;

    const title = String(projectPayload.title || '').toLowerCase();
    const description = String(projectPayload.description || '').toLowerCase();
    const combinedText = `${title} ${description}`;

    const matchedKeyword = GREENWASHING_KEYWORDS.find(keyword => combinedText.includes(keyword));
    if (matchedKeyword) {
        reasons.push(`Keyword de riesgo detectada: ${matchedKeyword}`);
        score -= 35;
    }

    const targetAmount = Number.parseFloat(String(projectPayload.targetAmount || '0'));
    const milestones = Array.isArray(projectPayload.milestones) ? projectPayload.milestones : [];
    if (milestones.length > 0) {
        const milestoneTotal = milestones.reduce((acc, item) => {
            const value = Number.parseFloat(String(item?.targetAmount || '0'));
            return acc + (Number.isFinite(value) ? value : 0);
        }, 0);

        if (Number.isFinite(targetAmount) && targetAmount > 0) {
            const difference = Math.abs(milestoneTotal - targetAmount);
            if (difference > 0.01) {
                reasons.push('El total de hitos no coincide con la meta de financiamiento');
                score -= 30;
            }
        }
    }

    const lat = Number(projectPayload?.location?.lat);
    const lng = Number(projectPayload?.location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        reasons.push('Coordenadas inválidas o incompletas');
        score -= 20;
    }

    if (description.length < 80) {
        reasons.push('Descripción demasiado corta para evaluación de impacto');
        score -= 15;
    }

    return {
        passed: reasons.length === 0,
        score: Math.max(score, 0),
        reasons
    };
};

// Obtener todos los proyectos
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;

        let filter = {
            status: { $in: PUBLIC_PROJECT_STATUSES }
        };

        if (typeof status === 'string') {
            if (status.toLowerCase() === 'all') {
                filter = {};
            } else {
                filter = { status: { $regex: new RegExp(`^${status}$`, 'i') } };
            }
        }

        const projects = await Project.find(filter).populate('creator', 'username email walletAddress');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cola de curaduría manual (admin)
router.get('/review-queue/manual', auth, async (req, res) => {
    try {
        const reviewer = await ensureAdminReviewer(req, res);
        if (!reviewer) return;

        const projects = await Project.find({ status: 'manual_review_pending' })
            .populate('creator', 'name username email walletAddress')
            .sort({ updatedAt: 1 });

        res.json({
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo proyecto
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            targetAmount,
            category,
            imageUrl,
            milestones,
            environmentalImpact,
            location,
            profileType,
            kycDocuments = []
        } = req.body;
        let normalizedEnvironmentalImpact = environmentalImpact;

        if (environmentalImpact && typeof environmentalImpact === 'object') {
            const parsedValue = Number.parseFloat(String(environmentalImpact.value ?? '0'));
            if (Number.isNaN(parsedValue)) {
                return res.status(400).json({ error: 'environmentalImpact.value debe ser numérico' });
            }

            normalizedEnvironmentalImpact = {
                ...environmentalImpact,
                value: parsedValue
            };
        }
        
        // Obtener usuario desde la BD para tener su wallet actualizada
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const walletAddress = user.walletAddress;
        
        if (!walletAddress) {
            return res.status(400).json({ error: 'User wallet address not found. Please connect your wallet first.' });
        }

        const newProject = new Project({
            title,
            description,
            targetAmount,
            category,
            imageUrl,
            location,
            milestones,
            environmentalImpact: normalizedEnvironmentalImpact,
            creator: user._id,
            walletAddress,
            status: 'draft',
            verification: {
                profileType: profileType === 'organization' ? 'organization' : 'individual',
                kyc: {
                    status: Array.isArray(kycDocuments) && kycDocuments.length > 0 ? 'pending' : 'not_submitted',
                    documents: Array.isArray(kycDocuments) ? kycDocuments : []
                },
                timeline: [
                    {
                        stage: 'draft',
                        by: user._id,
                        note: 'Proyecto creado como borrador'
                    }
                ]
            }
        });

        const savedProject = await newProject.save();

        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar KYC del proyecto
router.patch('/:id/kyc', auth, async (req, res) => {
    try {
        const { profileType = 'individual', documents = [] } = req.body;

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (String(project.creator) !== String(req.user.userId)) {
            return res.status(403).json({ error: 'No autorizado para actualizar KYC' });
        }

        project.verification = project.verification || {};
        project.verification.profileType = profileType === 'organization' ? 'organization' : 'individual';
        project.verification.kyc = project.verification.kyc || {};
        project.verification.kyc.documents = Array.isArray(documents) ? documents.filter(Boolean) : [];
        project.verification.kyc.status = project.verification.kyc.documents.length > 0 ? 'pending' : 'not_submitted';

        if (project.verification.kyc.status === 'pending') {
            project.status = 'kyc_pending';
        }

        project.verification.timeline = project.verification.timeline || [];
        project.verification.timeline.push({
            stage: project.status,
            by: req.user.userId,
            note: 'Documentación KYC actualizada'
        });

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enviar proyecto a revisión (auto + manual)
router.post('/:id/submit-review', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (String(project.creator) !== String(req.user.userId)) {
            return res.status(403).json({ error: 'No autorizado para enviar revisión' });
        }

        project.verification = project.verification || {};
        project.verification.kyc = project.verification.kyc || {
            status: 'not_submitted',
            documents: []
        };
        project.verification.timeline = project.verification.timeline || [];

        if (!project.verification?.kyc?.documents || project.verification.kyc.documents.length === 0) {
            project.status = 'kyc_pending';
            project.verification.kyc.status = 'not_submitted';
            await project.save();
            return res.status(400).json({
                error: 'KYC incompleto',
                details: 'Carga documentos KYC antes de solicitar revisión'
            });
        }

        project.verification.kyc.status = 'verified';
        project.status = 'kyc_verified';

        const autoReview = runAutomaticViabilityAnalysis(project);
        project.verification.autoReview = {
            passed: autoReview.passed,
            score: autoReview.score,
            reasons: autoReview.reasons,
            checkedAt: new Date()
        };

        project.verification.timeline = project.verification.timeline || [];
        project.verification.timeline.push({
            stage: 'kyc_verified',
            by: req.user.userId,
            note: 'KYC validado para revisión'
        });

        if (!autoReview.passed) {
            project.status = 'auto_review_failed';
            project.verification.timeline.push({
                stage: 'auto_review_failed',
                by: req.user.userId,
                note: autoReview.reasons.join('; ')
            });
            await project.save();
            return res.status(400).json({
                error: 'La revisión automática falló',
                reasons: autoReview.reasons,
                score: autoReview.score,
                project
            });
        }

        project.status = 'manual_review_pending';
        project.verification.manualReview = {
            status: 'pending'
        };
        project.verification.timeline.push({
            stage: 'manual_review_pending',
            by: req.user.userId,
            note: 'Proyecto en cola de curaduría manual'
        });

        await project.save();
        res.json({
            message: 'Proyecto enviado a curaduría manual',
            score: autoReview.score,
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Decisión de curaduría manual (admin)
router.post('/:id/manual-review', auth, async (req, res) => {
    try {
        const reviewer = await ensureAdminReviewer(req, res);
        if (!reviewer) return;

        const { decision, notes = '' } = req.body;
        if (!['approve', 'reject'].includes(String(decision))) {
            return res.status(400).json({ error: 'decision debe ser approve o reject' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        project.verification = project.verification || {};
        project.verification.manualReview = project.verification.manualReview || {};
        project.verification.manualReview.status = decision === 'approve' ? 'approved' : 'rejected';
        project.verification.manualReview.reviewedAt = new Date();
        project.verification.manualReview.reviewedBy = reviewer._id;
        project.verification.manualReview.notes = String(notes || '').trim();

        project.verification.timeline = project.verification.timeline || [];

        if (decision === 'approve') {
            project.status = 'approved_for_funding';
            project.verification.timeline.push({
                stage: 'approved_for_funding',
                by: reviewer._id,
                note: project.verification.manualReview.notes || 'Proyecto habilitado para fondeo'
            });
        } else {
            project.status = 'rejected';
            project.verification.timeline.push({
                stage: 'rejected',
                by: reviewer._id,
                note: project.verification.manualReview.notes || 'Proyecto rechazado en curaduría'
            });
        }

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un proyecto específico
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('creator', 'username email walletAddress');
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        
        // Obtener el balance actual del proyecto desde Soroban
        let currentBalance = project.currentAmount || '0';
        if (project.walletAddress) {
            try {
                const service = await getSorobanService();
                currentBalance = await service.getBalance(project.walletAddress);
            } catch (sorobanError) {
                console.warn('Error obtaining Soroban balance:', sorobanError.message);
                // Usar el currentAmount de la BD como fallback
                currentBalance = project.currentAmount || '0';
            }
        }
        
        const projectWithBalance = {
            ...project.toObject(),
            currentBalance: currentBalance
        };
        
        res.json(projectWithBalance);
    } catch (error) {
        console.error('Error in GET /projects/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un proyecto
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (project.creator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un proyecto
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (project.creator.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proyecto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;