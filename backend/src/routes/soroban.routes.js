const express = require('express');
const router = express.Router();
const getSorobanService = require('../../soroban/soroban.service');
const auth = require('./../middleware/auth');

// Generar una nueva wallet
router.post('/wallet/generate', async (req, res) => {
    try {
        const service = await getSorobanService();
        const wallet = await service.generateWallet();
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener el balance de una wallet
router.get('/wallet/balance/:address', async (req, res) => {
    try {
        console.log('[wallet/balance] Getting balance for:', req.params.address);
        const service = await getSorobanService();
        const balance = await service.getBalance(req.params.address);
        console.log('[wallet/balance] ✓ Balance:', balance);
        res.json({ balance });
    } catch (error) {
        console.error('[wallet/balance] ✗ Error:', error.message);
        // Return 0 instead of error to prevent UI logout
        res.json({ balance: '0' });
    }
});

// Realizar una donación
router.post('/transactions/donate', auth, async (req, res) => {
    try {
        const service = await getSorobanService();
        const { from, to, amount } = req.body;
        const transaction = await service.makeDonation(from, to, amount);
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener historial de transacciones
router.get('/transactions/history/:address', async (req, res) => {
    try {
        console.log('[transactions/history] Getting transactions for:', req.params.address);
        const service = await getSorobanService();
        const history = await service.getTransactionHistory(req.params.address);
        console.log('[transactions/history] ✓ History:', history?.length || 0);
        res.json(history || []);
    } catch (error) {
        console.error('[transactions/history] ✗ Error:', error.message);
        // Return empty array instead of error to prevent UI logout
        res.json([]);
    }
});

// Obtener historial de transacciones (alias sin /history)
router.get('/transactions/:address', async (req, res) => {
    try {
        console.log('[transactions] Getting transactions for:', req.params.address);
        const service = await getSorobanService();
        const history = await service.getTransactionHistory(req.params.address);
        console.log('[transactions] ✓ History:', history?.length || 0);
        res.json(history || []);
    } catch (error) {
        console.error('[transactions] ✗ Error:', error.message);
        // Return empty array instead of error to prevent UI logout
        res.json([]);
    }
});

// Desplegar un smart contract
router.post('/contracts/deploy', auth, async (req, res) => {
    try {
        const service = await getSorobanService();
        const { wasmPath } = req.body;
        const contractId = await service.deploySmartContract(wasmPath);
        res.json({ contractId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Invocar un método del smart contract
router.post('/contracts/invoke', auth, async (req, res) => {
    try {
        const service = await getSorobanService();
        const { contractId, method, params } = req.body;
        const result = await service.invokeSmartContract(contractId, method, params);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;