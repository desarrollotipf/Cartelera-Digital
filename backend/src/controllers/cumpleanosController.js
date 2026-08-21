const { sequelize, isDbConnected } = require('../config/db');
const { sendBirthdayEmail } = require('../services/mailService');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ─── Constantes compartidas ─────────────────────────────────────────────────
// Centros de Operación (C.O. / Empresa) elegibles para la cartelera de Gestión Humana
const ALLOWED_CO = ['ADMINISTRACION', 'ADMINISTRACIÓN', 'UND FUNCIONAL ASADERO', 'ADMINISTR.PARA DISTRIBUIR', 'ADMINISTRACION PARA DISTRIBUIR'];

// Zona horaria de Colombia — garantiza que "hoy" siempre sea correcto
// sin importar la zona horaria del servidor donde corre el backend.
const TZ = `'America/Bogota'`;

const readEmpleadosCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const seen = new Set();
    const csvPath = path.join(__dirname, '../data/empleados.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.warn("No se encontró el archivo CSV en", csvPath);
      return resolve([]);
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        const estado = (data['Descripcion estado'] || '').trim().toUpperCase();
        if (estado !== 'ACTIVO') return;
        
        const empId = (data['Empleado'] || '').trim();
        if (!empId || seen.has(empId)) return;
        
        const fechaNac = data['Fecha nacimiento del empleado']; 
        if (!fechaNac) return;
        
        const co = (data['Descripcion C.O.'] || '').trim().toUpperCase();
        const isAllowed = ALLOWED_CO.some(allowed => co.includes(allowed));
        
        if (isAllowed) {
          seen.add(empId);
          results.push({
            id_persona: empId,
            name: (data['Nombre del empleado'] || '').trim(),
            birthDate: fechaNac,
            email: data['Email del contacto'] || null
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
// ────────────────────────────────────────────────────────────────────────────

/**
 * Retorna todos los cumpleaños del mes actual (hora Colombia).
 * Los datos vienen en ISO 8601 para que el frontend los formatee libremente.
 */
const getCumpleanos = async (req, res) => {
  try {
    let results = [];

    const csvPath = path.join(__dirname, '../data/empleados.csv');
    const shouldUseCsv = process.env.USE_LOCAL_CSV === 'true' && fs.existsSync(csvPath);

    if (shouldUseCsv) {
      try {
        const currentMonth = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", month: "numeric" });
        const allEmpleados = await readEmpleadosCSV();
        results = allEmpleados.filter(e => {
          const parts = e.birthDate.split('-');
          if (parts.length >= 2) {
             return parseInt(parts[1], 10) === parseInt(currentMonth, 10);
          }
          return false;
        });
        results.sort((a, b) => {
           const dayA = parseInt(a.birthDate.split('-')[2], 10) || 0;
           const dayB = parseInt(b.birthDate.split('-')[2], 10) || 0;
           return dayA - dayB;
        });
      } catch (csvErr) {
        console.warn('Error leyendo CSV, pasando a consulta en base de datos:', csvErr.message);
      }
    }

    // Si no usó CSV o el CSV no arrojó registros y la base de datos está conectada:
    if (results.length === 0 && isDbConnected()) {
      [results] = await sequelize.query(`
        SELECT
          p.id_persona,
          p.nombre_completo AS name,
          TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
          p.correo AS email
        FROM (
          SELECT DISTINCT ON (p.id_persona)
            p.id_persona,
            p.nombre_completo,
            p.fecha_nacimiento,
            p.correo
          FROM rrhh.persona p
          JOIN rrhh.empleado e ON e.id_persona = p.id_persona
          JOIN rrhh.contrato c ON c.id_empleado = e.id_empleado
          JOIN operaciones.empresa emp ON c.id_empresa = emp.id_empresa
          WHERE p.estado = 'ACTIVO'
            AND p.fecha_nacimiento IS NOT NULL
            AND EXTRACT(MONTH FROM p.fecha_nacimiento) = EXTRACT(MONTH FROM (NOW() AT TIME ZONE ${TZ}))
            AND (
              UPPER(emp.nombre) LIKE '%ADMINISTRACION%'
              OR UPPER(emp.nombre) LIKE '%ADMINISTRACIÓN%'
              OR UPPER(emp.nombre) LIKE '%UND FUNCIONAL ASADERO%'
              OR UPPER(emp.nombre) LIKE '%ADMINISTR.PARA DISTRIBUIR%'
            )
          ORDER BY p.id_persona
        ) p
        ORDER BY EXTRACT(DAY FROM p.fecha_nacimiento) ASC, p.nombre_completo ASC;
      `);
    }

    // El frontend recibirá la fecha en ISO y calculará isToday por su cuenta.
    const formattedBirthdays = results.map(person => ({
      id: `db-${person.id_persona}`,
      personId: person.id_persona,
      type: 'birthday',
      name: person.name,
      email: person.email || null,
      birthDate: person.birthDate   // Ej: "1990-08-06"
    }));

    res.json({ success: true, data: formattedBirthdays });
  } catch (error) {
    console.error('Error fetching cumpleaños:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cumpleaños', error: error.message });
  }
};

/**
 * Dispara de forma controlada el envío de felicitaciones a quienes
 * celebran HOY su cumpleaños (hora Colombia).
 * El envío real está protegido por la variable ENABLE_BIRTHDAY_EMAILS=true.
 */
const sendBirthdayGreetings = async (req, res) => {
  try {
    let results = [];
    
    const csvPath = path.join(__dirname, '../data/empleados.csv');
    const shouldUseCsv = process.env.USE_LOCAL_CSV === 'true' && fs.existsSync(csvPath);

    if (shouldUseCsv) {
      try {
        const bogotaDate = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
        const currentMonth = new Date(bogotaDate).getMonth() + 1;
        const currentDay = new Date(bogotaDate).getDate();

        const allEmpleados = await readEmpleadosCSV();
        results = allEmpleados.filter(e => {
          const parts = e.birthDate.split('-');
          if (parts.length >= 3) {
             return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
          }
          return false;
        });
      } catch (csvErr) {
        console.warn('Error leyendo CSV para envíos, pasando a BD:', csvErr.message);
      }
    }

    if (results.length === 0 && isDbConnected()) {
      [results] = await sequelize.query(`
        SELECT
          p.id_persona,
          p.nombre_completo AS name,
          TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
          p.correo AS email
        FROM (
          SELECT DISTINCT ON (p.id_persona)
            p.id_persona,
            p.nombre_completo,
            p.fecha_nacimiento,
            p.correo
          FROM rrhh.persona p
          JOIN rrhh.empleado e ON e.id_persona = p.id_persona
          JOIN rrhh.contrato c ON c.id_empleado = e.id_empleado
          JOIN operaciones.empresa emp ON c.id_empresa = emp.id_empresa
          WHERE p.estado = 'ACTIVO'
            AND p.fecha_nacimiento IS NOT NULL
            AND EXTRACT(MONTH FROM p.fecha_nacimiento) = EXTRACT(MONTH FROM (NOW() AT TIME ZONE ${TZ}))
            AND EXTRACT(DAY   FROM p.fecha_nacimiento) = EXTRACT(DAY   FROM (NOW() AT TIME ZONE ${TZ}))
            AND (
              UPPER(emp.nombre) LIKE '%ADMINISTRACION%'
              OR UPPER(emp.nombre) LIKE '%ADMINISTRACIÓN%'
              OR UPPER(emp.nombre) LIKE '%UND FUNCIONAL ASADERO%'
              OR UPPER(emp.nombre) LIKE '%ADMINISTR.PARA DISTRIBUIR%'
            )
          ORDER BY p.id_persona
        ) p
        ORDER BY p.nombre_completo ASC;
      `);
    }

    const sendResults = [];
    for (const person of results) {
      // Formatear fecha para el cuerpo del correo
      const [year, month, day] = person.birthDate.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      const fechaLegible = dateObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', timeZone: 'America/Bogota' });

      const resMail = await sendBirthdayEmail({
        name: person.name,
        email: person.email,
        date: fechaLegible
      });
      sendResults.push({ person: person.name, email: person.email, result: resMail });
    }

    res.json({
      success: true,
      message: 'Proceso de felicitaciones ejecutado (Verificar modo de envío EN PAUSA)',
      count: results.length,
      details: sendResults
    });
  } catch (error) {
    console.error('Error al despachar saludos de cumpleaños:', error);
    res.status(500).json({ success: false, message: 'Error en proceso de saludos', error: error.message });
  }
};

module.exports = { getCumpleanos, sendBirthdayGreetings };
