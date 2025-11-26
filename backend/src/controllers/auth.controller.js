const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.register = async (req, res) => {
  try {
    console.log('[REGISTER] Iniciando registro con datos:', { email: req.body.email, role: req.body.role });
    const { email, password, name, role } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name || !role) {
      console.log('[REGISTER] Validación fallida - campos faltantes');
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[REGISTER] Validación fallida - email inválido');
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[REGISTER] Usuario ya existe:', email);
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Validar contraseña
    if (password.length < 6) {
      console.log('[REGISTER] Validación fallida - contraseña muy corta');
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role
    });

    await user.save();
    console.log('[REGISTER] Usuario creado:', user._id);

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('[REGISTER] ✓ Registro exitoso');
    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('[REGISTER] ✗ Error en registro:', error.message);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('[LOGIN] Iniciando login con email:', req.body.email);
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      console.log('[LOGIN] Validación fallida - email o contraseña faltante');
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[LOGIN] Validación fallida - email inválido');
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN] Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('[LOGIN] Contraseña incorrecta para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('[LOGIN] ✓ Login exitoso para:', email);
    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('[LOGIN] ✗ Error en login:', error.message);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Connect Freighter wallet - Save wallet address to user profile
 * POST /auth/connect-wallet
 * Body: { walletAddress: string }
 */
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    // Validate wallet address format (Stellar addresses start with 'G' and are 56 chars)
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address es requerida' });
    }
    
    if (!walletAddress.startsWith('G') || walletAddress.length !== 56) {
      return res.status(400).json({ message: 'Formato de dirección Stellar inválido' });
    }
    
    // Update user with wallet address
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      message: 'Wallet conectada correctamente',
      user
    });
  } catch (error) {
    console.error('Error al conectar wallet:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Link wallet to account
 * POST /auth/link-wallet
 */
exports.linkWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address es requerida' });
    }
    
    if (!walletAddress.startsWith('G') || walletAddress.length !== 56) {
      return res.status(400).json({ message: 'Formato de dirección Stellar inválido' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al vincular wallet:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Unlink wallet from account
 * POST /auth/unlink-wallet
 */
exports.unlinkWallet = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress: null },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      message: 'Wallet desvinculada correctamente',
      user
    });
  } catch (error) {
    console.error('Error al desvincular wallet:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};