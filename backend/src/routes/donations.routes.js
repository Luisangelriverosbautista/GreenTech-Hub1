const express = require('express');
const router = express.Router();
const auth = require('./../middleware/auth');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const getSorobanService = require('../../soroban/soroban.service');
const BigNumber = require('bignumber.js');

// 1. Obtener TODOS los proyectos activos con su progreso
router.get('/api/projects', async (req, res) => {
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
router.get('/api/projects/:projectId', async (req, res) => {
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
router.post('/api/projects/:projectId/donate', auth, async (req, res) => {
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

// 4. Obtener historial de DONACIONES recibidas por un usuario
router.get('/api/users/:userId/donations-received', async (req, res) => {
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
router.get('/api/users/:userId/donations-made', async (req, res) => {
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
router.get('/api/my-transactions', auth, async (req, res) => {
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