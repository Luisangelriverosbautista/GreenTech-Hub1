const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Mock user for testing when SKIP_DB is true
const mockUser = {
  _id: '123456789',
  name: 'Test User',
  email: 'test@test.com',
  password: '$2a$10$XWoXvxmX7aB8LJgeU6HqAOc.yW5GQ5gH5z5r5Z5r5Z5r5Z5r5Z',
  role: 'user',
  walletAddress: null
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Si SKIP_DB está activo, usar datos de prueba
    if (process.env.SKIP_DB === 'true') {
      if (email === mockUser.email) {
        const token = jwt.sign(
          { userId: mockUser._id, role: mockUser.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.json({
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            walletAddress: mockUser.walletAddress
          },
          token
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    // Verificar contraseña - usar el método del modelo si existe
    let validPassword = false;
    if (typeof user.comparePassword === 'function') {
      validPassword = await user.comparePassword(password);
    } else {
      validPassword = await bcrypt.compare(password, user.password);
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Si SKIP_DB está activo, simular registro exitoso
    if (process.env.SKIP_DB === 'true') {
      const token = jwt.sign(
        { userId: '123', role: role || 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        user: {
          id: '123',
          name,
          email,
          role: role || 'user',
          walletAddress: null
        },
        token
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    // NOTA: El modelo User tiene un hook pre('save') que ya se encarga de hashear la contraseña.
    // Por eso aquí guardamos la contraseña tal cual y dejamos que el hook la transforme.
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generar token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    // Si SKIP_DB está activo, devolver usuario de prueba
    if (process.env.SKIP_DB === 'true') {
      return res.json({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        walletAddress: mockUser.walletAddress
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;