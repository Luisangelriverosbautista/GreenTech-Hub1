const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/connect-wallet', authMiddleware, authController.connectWallet);
router.post('/link-wallet', authMiddleware, authController.linkWallet);
router.post('/unlink-wallet', authMiddleware, authController.unlinkWallet);

module.exports = router;