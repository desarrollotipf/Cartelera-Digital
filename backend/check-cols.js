require('dotenv').config({path:'.env'}); 
const { sequelize } = require('./src/config/db'); 
(async () => { 
  try {
    const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_schema='rrhh' AND table_name='persona';"); 
    console.log(results.map(r => r.column_name).join(', ')); 
  } catch(e) {
    console.error(e);
  }
  process.exit(0); 
})();
