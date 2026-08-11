const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(dbUrl, {
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

async function test() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'rrhh' AND table_name = 'persona';
    `);
    console.log("COLUMNS IN rrhh.persona:");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error querying:", error.message);
  } finally {
    process.exit(0);
  }
}

test();
