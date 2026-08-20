const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, isDbConnected } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const carteleraRoutes = require('./routes/carteleraRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const cumpleanosRoutes = require('./routes/cumpleanosRoutes');
const externalRoutes = require('./routes/externalRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializar conexión a la base de datos
connectDB();

// CORS — permite peticiones desde el frontend Vite (puerto 5173) y cualquier origen en desarrollo
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rutas de la API REST
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cartelera', carteleraRoutes);
app.use('/api/cumpleanos', cumpleanosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/external', externalRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'Aviso Gestión Humana API',
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.method} ${req.path} no encontrada.` });
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`API Pollo Fiesta S.A. en ejecución`);
});
