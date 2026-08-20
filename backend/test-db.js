const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  await client.connect();
  
  // Tablas en rrhh
  const res1 = await client.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='rrhh' AND table_name IN ('empleado', 'area')");
  console.log("Columnas:");
  console.log(res1.rows);

  client.end();
}

test().catch(e => {
  console.log('Error:', e.message);
  client.end();
});
 