const { Sequelize } = require('sequelize');
require('dotenv').config();

function buildSequelizeInstance() {
  const schema = process.env.DB_SCHEMA || 'cartelera_rrhh';

  // Opción 1: DATABASE_URL completa
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      logging: false,
      define: { schema },
      dialectOptions: {
        prependSearchPath: true,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  }

  // Opción 2: Variables individuales (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME || 'pf_operacional';
  const username = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const isCloudHost = host.includes('azure.com') || process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'postgres',
    logging: false,
    define: { schema },
    dialectOptions: isCloudHost ? {
      prependSearchPath: true,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {
      prependSearchPath: true
    }
  });
}

const sequelize = buildSequelizeInstance();
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
