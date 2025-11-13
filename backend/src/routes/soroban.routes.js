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
        const service = await getSorobanService();
        const balance = await service.getBalance(req.params.address);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const service = await getSorobanService();
        const history = await service.getTransactionHistory(req.params.address);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
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