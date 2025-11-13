const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const getSorobanService = require('../../soroban/soroban.service');
const BigNumber = require('bignumber.js');

const transactionController = {
  // Realizar una donación a un proyecto
  async makeDonation(req, res) {
    try {
      const { projectId, amount } = req.body;
      const userId = req.user.id; // From auth middleware

      // Verificar el proyecto
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }

      if (project.status !== 'active') {
        return res.status(400).json({ error: 'El proyecto no está activo' });
      }

      // Obtener el balance del donante
      const service = await getSorobanService();
      const donorBalance = await service.getBalance(req.user.walletAddress);
      if (new BigNumber(donorBalance).isLessThan(amount)) {
        return res.status(400).json({ error: 'Balance insuficiente' });
      }

      // Realizar la transacción en Soroban
      const sorobanTx = await service.makeDonation(
        req.user.walletAddress,
        project.walletAddress,
        amount
      );

      // Crear registro de transacción
      const transaction = new Transaction({
        type: 'donation',
        amount,
        from: userId,
        to: project.creator,
        project: projectId,
        status: 'completed',
        txHash: sorobanTx.id,
        sorobanResponse: sorobanTx
      });

      await transaction.save();

      // Actualizar el monto recaudado del proyecto
      const newAmount = new BigNumber(project.currentAmount).plus(amount).toString();
      project.currentAmount = newAmount;
      
      // Verificar si se alcanzó algún milestone
      project.milestones.forEach(milestone => {
        if (!milestone.completed && new BigNumber(newAmount).isGreaterThanOrEqualTo(milestone.targetAmount)) {
          milestone.completed = true;
          milestone.completedAt = new Date();
        }
      });

      // Verificar si se alcanzó el objetivo
      if (new BigNumber(newAmount).isGreaterThanOrEqualTo(project.targetAmount)) {
        project.status = 'funded';
      }

      await project.save();

      // Generar tokens de recompensa
      const rewardAmount = new BigNumber(amount).times(project.tokenRewards).toString();
      const rewardTx = await service.mintRewardTokens(req.user.walletAddress, rewardAmount);

      // Registrar la transacción de recompensa
      const rewardTransaction = new Transaction({
        type: 'reward',
        amount: rewardAmount,
        from: project.creator,
        to: userId,
        project: projectId,
        status: 'completed',
        txHash: rewardTx.id,
        sorobanResponse: rewardTx
      });

      await rewardTransaction.save();

      res.json({
        donation: transaction,
        reward: rewardTransaction,
        project: {
          currentAmount: project.currentAmount,
          status: project.status
        }
      });

    } catch (error) {
      console.error('Error en la donación:', error);
      res.status(500).json({ error: 'Error al procesar la donación' });
    }
  },

  // Obtener transacciones de un usuario
  async getUserTransactions(req, res) {
    try {
      const userId = req.user.id;
      const transactions = await Transaction.find({
        $or: [{ from: userId }, { to: userId }]
      })
      .populate('project', 'title imageUrl')
      .populate('from', 'name')
      .populate('to', 'name')
      .sort({ createdAt: -1 });

      res.json(transactions);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      res.status(500).json({ error: 'Error al obtener transacciones' });
    }
  },

  // Obtener transacciones de un proyecto
  async getProjectTransactions(req, res) {
    try {
      const { projectId } = req.params;
      const transactions = await Transaction.find({
        project: projectId,
        type: 'donation'
      })
      .populate('from', 'name')
      .sort({ createdAt: -1 });

      res.json(transactions);
    } catch (error) {
      console.error('Error al obtener transacciones del proyecto:', error);
      res.status(500).json({ error: 'Error al obtener transacciones del proyecto' });
    }
  }
};

module.exports = transactionController;