const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/avisoGestionHumana?schema=cartelera_rrhh';

const sequelize = new Sequelize(dbUrl, {
  logging: false,
  define: {
    schema: 'cartelera_rrhh' // Forzar a Sequelize a crear/buscar tablas en este esquema
  },
  dialectOptions: {
    prependSearchPath: true,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

let isConnected = false;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Synchronize models
    await sequelize.sync();
    isConnected = true;
    console.log(` PostgreSQL Conectado exitosamente al esquema cartelera_rrhh`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(` PostgreSQL no disponible (${error.message}). Modo simulado activado.`);
    return false;
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected, sequelize };
