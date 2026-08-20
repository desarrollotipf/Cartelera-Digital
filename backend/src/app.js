const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { connectDB, isDbConnected } = require('./config/db');
const { apiLimiter, authLimiter, uploadLimiter } = require('./middlewares/rateLimiter');
const userRoutes = require('./routes/userRoutes');
const carteleraRoutes = require('./routes/carteleraRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const cumpleanosRoutes = require('./routes/cumpleanosRoutes');
const externalRoutes = require('./routes/externalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializar conexión a la base de datos
connectDB();

// 1. Seguridad de Cabeceras HTTP con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Delegado al gateway o front para no romper assets de Azure Blob / CDNs
}));

// 2. CORS — permite peticiones desde orígenes locales y producción
const rawOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'https://carteleragh.pollo-fiesta.com',
  'https://portal.pollo-fiesta.com',
  ...rawOrigins.map(url => url.trim().replace(/\/+$/, ''))
];

app.use(cors({
  origin: function (origin, callback) {
    const cleanOrigin = origin ? origin.replace(/\/+$/, '') : origin;
    if (!cleanOrigin || allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Bloqueado por política CORS: origen ${origin} no permitido.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 3. Middlewares Generales
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 4. Rate Limiting Global
app.use('/api', apiLimiter);

// 5. Rutas de la API REST
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cartelera', carteleraRoutes);
app.use('/api/cumpleanos', cumpleanosRoutes);
app.use('/api/external', externalRoutes);

// Ruta raíz para verificación de estado en Azure
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API Cartelera Gestión Humana Pollo Fiesta en línea',
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'Aviso Gestión Humana API',
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.method} ${req.path} no encontrada.` });
});

// Manejador centralizado de errores (Evita fuga de stack traces en producción)
app.use((err, req, res, next) => {
  console.error(' [Unhandled Error]:', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(isProd ? {} : { stack: err.stack })
  });
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`API Pollo Fiesta S.A. en ejecución en puerto ${PORT}`);
});
