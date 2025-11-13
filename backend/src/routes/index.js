const express = require('express');
const router = express.Router();

// Importar rutas
const sorobanRoutes = require('./soroban.routes');
const projectsRoutes = require('./projects.routes');
const authRoutes = require('./auth.routes');  // ✅ Usar auth.routes.js (con la ruta connect-wallet)
const donationsRoutes = require('./donations.routes');
const getSorobanService = require('../../soroban/soroban.service');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/soroban', sorobanRoutes);
router.use('/projects', projectsRoutes);
router.use('/', donationsRoutes);

// Rutas wrapper para wallet (para que el frontend encuentre los endpoints)
router.get('/wallet/balance/:address', async (req, res) => {
  try {
    const service = await getSorobanService();
    const balance = await service.getBalance(req.params.address);
    res.json({ balance });
  } catch (error) {
    console.error('Error en /wallet/balance:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/transactions/:address', async (req, res) => {
  try {
    const service = await getSorobanService();
    const history = await service.getTransactionHistory(req.params.address);
    res.json(history);
  } catch (error) {
    console.error('Error en /transactions:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;