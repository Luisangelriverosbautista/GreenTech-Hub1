require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importar rutas
const routes = require('./routes');

const app = express();

// Middleware - CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
// Comprobar explícitamente si SKIP_DB está establecido a la cadena 'true'
if (process.env.SKIP_DB !== 'true') {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech-hub';
  
  // Opciones de conexión con soporte para SSL
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Timeout after 10s
    socketTimeoutMS: 45000, // Close sockets after 45s
  };
  
  // Para desarrollo local con MongoDB Atlas: deshabilitar validación SSL
  if (uri.includes('mongodb+srv://')) {
    // Si es MongoDB Atlas, agregar opciones SSL
    mongooseOptions.tls = true;
    mongooseOptions.tlsAllowInvalidCertificates = true;
    mongooseOptions.tlsAllowInvalidHostnames = true;
  }
  
  mongoose.connect(uri, mongooseOptions).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    // Mensaje más amigable para desarrolladores
    console.error('Si estás usando MongoDB Atlas, revisa que la IP esté en la lista blanca (Network Access) y que MONGODB_URI sea correcta.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
} else {
  console.log('SKIP_DB=true -> se omite la conexión a MongoDB para pruebas locales');
}

// Montar rutas
// Se monta en '/api' y en '/' para compatibilidad con el frontend que llama a '/auth/*'
app.use('/api', routes);
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Configuración de puerto
const PORT = process.env.PORT || 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.SKIP_DB === 'true') {
    console.log('SKIP_DB=true -> se omite la conexión a MongoDB para pruebas locales');
  }
});