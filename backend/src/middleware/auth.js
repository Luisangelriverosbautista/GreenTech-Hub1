const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('[AUTH MIDDLEWARE] Authorization header:', authHeader ? 'Present' : 'Missing');
        
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token) {
            console.log('[AUTH MIDDLEWARE] ✗ No token provided');
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        try {
            const verified = jwt.verify(token, JWT_SECRET);
            console.log('[AUTH MIDDLEWARE] ✓ Token válido para userId:', verified.userId);
            req.user = verified;
            next();
        } catch (error) {
            console.log('[AUTH MIDDLEWARE] ✗ Token inválido:', error.message);
            res.status(401).json({ error: 'Token inválido' });
        }
    } catch (error) {
        console.error('[AUTH MIDDLEWARE] ✗ Error inesperado:', error.message);
        res.status(500).json({ error: 'Error en el servidor al autenticar' });
    }
};

module.exports = auth;