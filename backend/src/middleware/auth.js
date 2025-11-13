const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token inválido' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al autenticar' });
    }
};

module.exports = auth;