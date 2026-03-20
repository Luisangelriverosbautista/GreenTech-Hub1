const express = require('express');
const router = express.Router();
const auth = require('./../middleware/auth');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const Escrow = require('../models/Escrow');
const User = require('../models/User');
const getSorobanService = require('../../soroban/soroban.service');
const trustlessWorkService = require('../services/trustlesswork.service');
const BigNumber = require('bignumber.js');

const shouldFallbackOnAuthError = () => process.env.TRUSTLESSWORK_ALLOW_FALLBACK_ON_AUTH_ERROR !== 'false';

const isTrustlessAuthError = (errorMessage = '') => {
    return /TrustlessWork API error \((401|403)\)/.test(String(errorMessage));
};

const getErrorMessage = (error) => {
    return error?.message || 'Unknown error';
};

// 1. Obtener TODOS los proyectos activos con su progreso
router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find({ status: { $in: ['active', 'funded'] } })
            .populate('creator', 'username walletAddress')
            .sort({ createdAt: -1 });
        
        // Enriquecer con datos de balance y progreso
        const projectsWithBalance = await Promise.all(projects.map(async (project) => {
            try {
                const service = await getSorobanService();
                const currentBalance = await service.getBalance(project.walletAddress);
                const progress = new BigNumber(currentBalance).dividedBy(project.targetAmount).times(100).toNumber();
                
                return {
                    ...project.toObject(),
                    currentAmount: currentBalance,
                    progress: Math.min(progress, 100),
                    remaining: new BigNumber(project.targetAmount).minus(currentBalance).toNumber()
                };
            } catch (error) {
                console.error(`Error getting balance for project ${project._id}:`, error);
                return {
                    ...project.toObject(),
                    progress: 0,
                    remaining: project.targetAmount
                };
            }
        }));
        
        res.json(projectsWithBalance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Obtener UN proyecto específico con detalles
router.get('/projects/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('creator', 'username walletAddress');
        
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        
        // Obtener balance y transacciones
        const service = await getSorobanService();
        const currentBalance = await service.getBalance(project.walletAddress);
        const transactions = await Transaction.find({ project: project._id })
            .populate('from', 'username walletAddress')
            .populate('to', 'username walletAddress')
            .sort({ createdAt: -1 });
        
        const progress = new BigNumber(currentBalance).dividedBy(project.targetAmount).times(100).toNumber();
        
        res.json({
            ...project.toObject(),
            currentAmount: currentBalance,
            progress: Math.min(progress, 100),
            remaining: new BigNumber(project.targetAmount).minus(currentBalance).toString(),
            donations: transactions.filter(t => t.type === 'donation')
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Realizar una DONACIÓN a un proyecto
// NOTA: Esta es una versión simplificada donde el frontend firma la transacción con Freighter
router.post('/projects/:projectId/donate', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { amount, txHash } = req.body;
        
        // txHash es el hash de la transacción ya enviada por el frontend con Freighter
        if (!txHash) {
            return res.status(400).json({ error: 'txHash es requerido' });
        }
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!user.walletAddress) {
            return res.status(400).json({ error: 'Usuario no tiene wallet conectada' });
        }
        
        const project = await Project.findById(projectId).populate('creator');
        
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        
        if (project.status !== 'active') {
            return res.status(400).json({ error: 'El proyecto no está activo' });
        }

        if (!project.walletAddress) {
            return res.status(400).json({ error: 'Proyecto no tiene wallet asignada' });
        }
        
        // Guardar registro de la donación en BD
        try {
            const transaction = new Transaction({
                type: 'donation',
                amount: amount.toString(),
                from: user._id,
                to: project.creator._id,
                project: project._id,
                status: 'completed',
                txHash: txHash,
                sorobanResponse: { status: 'submitted', hash: txHash }
            });
            
            await transaction.save();
            
            // Actualizar monto actual del proyecto
            const service = await getSorobanService();
            try {
                project.currentAmount = await service.getBalance(project.walletAddress);
            } catch (balanceError) {
                console.error('Error updating project balance:', balanceError);
                project.currentAmount = (parseFloat(project.currentAmount) + parseFloat(amount)).toString();
            }
            
            // Verificar si se alcanzó la meta
            if (new BigNumber(project.currentAmount).isGreaterThanOrEqualTo(project.targetAmount)) {
                project.status = 'funded';
            }
            
            await project.save();
            
            res.json({
                success: true,
                transaction: transaction,
                projectCurrentAmount: project.currentAmount,
                projectStatus: project.status,
                message: 'Donación registrada exitosamente'
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error al guardar la donación en la base de datos' });
        }
    } catch (error) {
        console.error('[Donation] Unexpected error:', error);
        res.status(500).json({ error: error.message || 'Error inesperado' });
    }
});

// 3.1 Crear/fondear escrow (FASE 1: single-release)
router.post('/projects/:projectId/donate-escrow', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { amount, donorAddress, metadata = {} } = req.body;

        if (!amount || !donorAddress) {
            return res.status(400).json({ error: 'amount y donorAddress son requeridos' });
        }

        const amountNumber = Number.parseFloat(String(amount));
        if (Number.isNaN(amountNumber) || amountNumber <= 0) {
            return res.status(400).json({ error: 'amount debe ser mayor a 0' });
        }

        const donor = await User.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (donor.walletAddress && donor.walletAddress !== donorAddress) {
            return res.status(400).json({ error: 'donorAddress no coincide con la wallet del usuario autenticado' });
        }

        const project = await Project.findById(projectId).populate('creator');
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (project.status !== 'active') {
            return res.status(400).json({ error: 'El proyecto no está activo' });
        }

        if (!project.creator || !project.creator.walletAddress) {
            return res.status(400).json({ error: 'El creador del proyecto no tiene walletAddress' });
        }

        const trustlessPayload = {
            amount: String(amount),
            donorAddress,
            recipientAddress: project.creator.walletAddress,
            title: `Donacion escrow para ${project.title}`,
            description: metadata.description || `Escrow de donacion para el proyecto ${project.title}`,
            metadata: {
                projectId: String(project._id),
                donorId: String(donor._id),
                creatorId: String(project.creator._id),
                ...metadata
            }
        };

        let trustlessResult;
        try {
            trustlessResult = await trustlessWorkService.fundSingleReleaseEscrow(trustlessPayload);
        } catch (providerError) {
            const providerMessage = getErrorMessage(providerError);

            if (isTrustlessAuthError(providerMessage) && shouldFallbackOnAuthError()) {
                trustlessResult = trustlessWorkService.createMockResponse('fund-single-release-fallback', {
                    ...trustlessPayload,
                    fallbackReason: providerMessage
                });
            } else if (isTrustlessAuthError(providerMessage)) {
                return res.status(502).json({
                    error: 'Trustless Work rechazó la autenticación (401/403).',
                    details: providerMessage,
                    hint: 'Configura TRUSTLESSWORK_API_KEY válida o activa TRUSTLESSWORK_MOCK_MODE=true / TRUSTLESSWORK_ALLOW_FALLBACK_ON_AUTH_ERROR=true'
                });
            } else {
                return res.status(502).json({
                    error: 'Error del proveedor de escrow',
                    details: providerMessage
                });
            }
        }

        const trustlessEscrowId =
            trustlessResult?.escrowId ||
            trustlessResult?.id ||
            trustlessResult?.escrow_id ||
            trustlessResult?.data?.escrowId ||
            trustlessResult?.data?.id;

        if (!trustlessEscrowId) {
            return res.status(502).json({
                error: 'Trustless Work no devolvió un escrowId utilizable',
                trustlessResult
            });
        }

        const contractId =
            trustlessResult?.contractId ||
            trustlessResult?.contract_id ||
            trustlessResult?.data?.contractId ||
            null;

        const escrow = await Escrow.create({
            project: project._id,
            donor: donor._id,
            creator: project.creator._id,
            mode: 'single-release',
            trustlessEscrowId,
            contractId,
            amountTotal: String(amount),
            amountReleased: '0',
            status: 'funded',
            metadata,
            trustlessResponse: trustlessResult,
            lastSyncedAt: new Date()
        });

        const transaction = await Transaction.create({
            type: 'escrow_fund',
            amount: String(amount),
            from: donor._id,
            to: project.creator._id,
            project: project._id,
            status: 'pending',
            txHash: contractId || trustlessEscrowId,
            sorobanResponse: {
                provider: 'trustlesswork',
                escrowId: trustlessEscrowId,
                mode: 'single-release',
                state: 'funded'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Escrow creado/fondeado exitosamente',
            escrow,
            transaction,
            providerResponse: trustlessResult
        });
    } catch (error) {
        console.error('[Escrow Donation] Error:', error.message);
        res.status(500).json({ error: error.message || 'Error al crear escrow' });
    }
});

// 3.2 Obtener escrows de un proyecto (FASE 1)
router.get('/projects/:projectId/escrows', auth, async (req, res) => {
    try {
        const { projectId } = req.params;

        const escrows = await Escrow.find({ project: projectId })
            .populate('donor', 'name email walletAddress')
            .populate('creator', 'name email walletAddress')
            .sort({ createdAt: -1 });

        res.json({
            count: escrows.length,
            escrows
        });
    } catch (error) {
        console.error('[Project Escrows] Error:', error.message);
        res.status(500).json({ error: error.message || 'Error al obtener escrows' });
    }
});

// 3.3 Aprobar escrow/milestone (FASE 2)
router.post('/escrows/:escrowId/approve', auth, async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { milestoneIndex = 0 } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow no encontrado' });
        }

        if (String(escrow.donor) !== String(user._id)) {
            return res.status(403).json({ error: 'Solo el donante puede aprobar el escrow' });
        }

        const providerPayload = {
            escrowId: escrow.trustlessEscrowId,
            contractId: escrow.contractId,
            milestoneIndex
        };

        let providerResponse;
        try {
            providerResponse = escrow.mode === 'multi-release'
                ? await trustlessWorkService.approveMultiReleaseMilestone(providerPayload)
                : await trustlessWorkService.approveSingleReleaseEscrow(providerPayload);
        } catch (providerError) {
            const providerMessage = getErrorMessage(providerError);

            if (isTrustlessAuthError(providerMessage) && shouldFallbackOnAuthError()) {
                providerResponse = trustlessWorkService.createMockResponse('approve-fallback', {
                    ...providerPayload,
                    fallbackReason: providerMessage
                });
            } else {
                return res.status(502).json({
                    error: 'No se pudo aprobar en proveedor escrow',
                    details: providerMessage
                });
            }
        }

        if (escrow.mode === 'multi-release' && escrow.milestones[milestoneIndex]) {
            escrow.milestones[milestoneIndex].status = 'approved';
            escrow.milestones[milestoneIndex].approvedAt = new Date();
        }

        escrow.status = 'approved';
        escrow.lastSyncedAt = new Date();
        escrow.trustlessResponse = {
            ...escrow.trustlessResponse,
            lastApproveResponse: providerResponse
        };
        await escrow.save();

        res.json({
            success: true,
            message: 'Escrow aprobado correctamente',
            escrow,
            providerResponse
        });
    } catch (error) {
        console.error('[Escrow Approve] Error:', error.message);
        res.status(500).json({ error: error.message || 'Error al aprobar escrow' });
    }
});

// 3.4 Liberar fondos de escrow (FASE 2)
router.post('/escrows/:escrowId/release', auth, async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { milestoneIndex = 0, amount } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow no encontrado' });
        }

        const isAllowed = String(escrow.donor) === String(user._id) || String(escrow.creator) === String(user._id);
        if (!isAllowed) {
            return res.status(403).json({ error: 'No autorizado para liberar fondos de este escrow' });
        }

        const project = await Project.findById(escrow.project);
        if (!project) {
            return res.status(404).json({ error: 'Proyecto asociado no encontrado' });
        }

        const releaseAmount = amount
            ? String(amount)
            : (escrow.mode === 'multi-release' && escrow.milestones[milestoneIndex]
                ? String(escrow.milestones[milestoneIndex].amount)
                : String(escrow.amountTotal));

        const providerPayload = {
            escrowId: escrow.trustlessEscrowId,
            contractId: escrow.contractId,
            milestoneIndex,
            amount: releaseAmount
        };

        let providerResponse;
        try {
            providerResponse = escrow.mode === 'multi-release'
                ? await trustlessWorkService.releaseMultiReleaseMilestoneFunds(providerPayload)
                : await trustlessWorkService.releaseSingleReleaseFunds(providerPayload);
        } catch (providerError) {
            const providerMessage = getErrorMessage(providerError);

            if (isTrustlessAuthError(providerMessage) && shouldFallbackOnAuthError()) {
                providerResponse = trustlessWorkService.createMockResponse('release-fallback', {
                    ...providerPayload,
                    fallbackReason: providerMessage
                });
            } else {
                return res.status(502).json({
                    error: 'No se pudo liberar fondos en proveedor escrow',
                    details: providerMessage
                });
            }
        }

        const newReleasedAmount = new BigNumber(escrow.amountReleased).plus(releaseAmount).toString();
        escrow.amountReleased = newReleasedAmount;
        escrow.lastSyncedAt = new Date();

        if (escrow.mode === 'multi-release' && escrow.milestones[milestoneIndex]) {
            escrow.milestones[milestoneIndex].status = 'released';
            escrow.milestones[milestoneIndex].releasedAt = new Date();
            escrow.status = new BigNumber(newReleasedAmount).isGreaterThanOrEqualTo(escrow.amountTotal)
                ? 'released'
                : 'partially-released';
        } else {
            escrow.status = 'released';
        }

        escrow.trustlessResponse = {
            ...escrow.trustlessResponse,
            lastReleaseResponse: providerResponse
        };
        await escrow.save();

        project.currentAmount = new BigNumber(project.currentAmount || '0').plus(releaseAmount).toString();
        if (new BigNumber(project.currentAmount).isGreaterThanOrEqualTo(project.targetAmount)) {
            project.status = 'funded';
        }
        await project.save();

        await Transaction.create({
            type: 'escrow_release',
            amount: releaseAmount,
            from: escrow.donor,
            to: escrow.creator,
            project: escrow.project,
            status: 'completed',
            txHash: escrow.contractId || escrow.trustlessEscrowId,
            sorobanResponse: {
                provider: 'trustlesswork',
                escrowId: escrow.trustlessEscrowId,
                action: 'release',
                providerResponse
            }
        });

        res.json({
            success: true,
            message: 'Fondos liberados correctamente',
            escrow,
            projectCurrentAmount: project.currentAmount,
            projectStatus: project.status,
            providerResponse
        });
    } catch (error) {
        console.error('[Escrow Release] Error:', error.message);
        res.status(500).json({ error: error.message || 'Error al liberar fondos' });
    }
});

// 4. Obtener historial de DONACIONES recibidas por un usuario
router.get('/users/:userId/donations-received', async (req, res) => {
    try {
        const transactions = await Transaction.find({
            to: req.params.userId,
            type: 'donation'
        })
            .populate('from', 'username walletAddress')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        
        const totalReceived = transactions.reduce((sum, tx) => {
            return sum.plus(new BigNumber(tx.amount));
        }, new BigNumber(0));
        
        res.json({
            transactions,
            totalReceived: totalReceived.toString(),
            count: transactions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Obtener historial de DONACIONES realizadas por un usuario
router.get('/users/:userId/donations-made', async (req, res) => {
    try {
        const transactions = await Transaction.find({
            from: req.params.userId,
            type: 'donation'
        })
            .populate('to', 'username walletAddress')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        
        const totalDonated = transactions.reduce((sum, tx) => {
            return sum.plus(new BigNumber(tx.amount));
        }, new BigNumber(0));
        
        res.json({
            transactions,
            totalDonated: totalDonated.toString(),
            count: transactions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Obtener transacciones del usuario actual (autenticado)
router.get('/my-transactions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Donaciones hechas
        const donationsMade = await Transaction.find({
            from: user._id,
            type: 'donation'
        })
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        
        // Donaciones recibidas
        const donationsReceived = await Transaction.find({
            to: user._id,
            type: 'donation'
        })
            .populate('from', 'username')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        
        res.json({
            made: donationsMade,
            received: donationsReceived
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;