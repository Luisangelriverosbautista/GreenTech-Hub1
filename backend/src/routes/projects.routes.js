const express = require('express');
const router = express.Router();
const getSorobanService = require('../../soroban/soroban.service');
const auth = require('./../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

// Obtener todos los proyectos
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({ status: 'active' }).populate('creator', 'username email walletAddress');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo proyecto
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, targetAmount, category, imageUrl, milestones, environmentalImpact } = req.body;
        
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
            milestones,
            environmentalImpact,
            creator: user._id,
            walletAddress,
            status: 'active'
        });

        const savedProject = await newProject.save();

        res.status(201).json(savedProject);
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
        const service = await getSorobanService();
        const balance = await service.getBalance(project.walletAddress);
        const projectWithBalance = {
            ...project.toObject(),
            currentBalance: balance
        };
        
        res.json(projectWithBalance);
    } catch (error) {
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

        if (project.createdBy.toString() !== req.user.id) {
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

        if (project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proyecto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;