const { sequelize, isDbConnected } = require('../config/db');
const { sendBirthdayEmail } = require('../services/mailService');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ─── Constantes compartidas ─────────────────────────────────────────────────
// Lista única de áreas excluidas del módulo de cumpleaños.
// Usada en ambas funciones para garantizar consistencia entre
// lo que se muestra en pantalla y lo que recibe correo.
const AREAS_EXCLUIDAS = `'LYD','PRODUCCION','PRODUCCIÓN','TRANSPORTE','TRANSPORTES','VIGILANCIA','PUNTOS DE VENTA','LOGISTICA','LOGÍSTICA'`;

// Criterio de admin unificado: se usa el mismo campo (r.codigo) en ambas funciones.
const ADMIN_CONDITION = `r.codigo ILIKE '%ADMIN%'`;

// Zona horaria de Colombia — garantiza que "hoy" siempre sea correcto
// sin importar la zona horaria del servidor donde corre el backend.
const TZ = `'America/Bogota'`;

const EXCLUDED_CSV_AREAS = ['LYD', 'PRODUCCION', 'PRODUCCIÓN', 'TRANSPORTE', 'TRANSPORTES', 'VIGILANCIA', 'PUNTOS DE VENTA', 'LOGISTICA', 'LOGÍSTICA'];

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
        
        const areaOco = (data['Descripcion C.O.'] || data['Descripcion centro de costo'] || data['Area'] || '').trim().toUpperCase();
        const isExcluded = EXCLUDED_CSV_AREAS.some(exc => areaOco.includes(exc));
        
        if (!isExcluded) {
          seen.add(empId);
          results.push({
            id_persona: empId,
            name: data['Nombre del empleado'],
            birthDate: fechaNac,
            email: data['Email del contacto']
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

    if (process.env.USE_LOCAL_CSV === 'true') {
      const currentMonth = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", month: "numeric" });
      const allEmpleados = await readEmpleadosCSV();
      results = allEmpleados.filter(e => {
        const parts = e.birthDate.split('-');
        if (parts.length >= 2) {
           return parseInt(parts[1], 10) === parseInt(currentMonth, 10);
        }
        return false;
      });
      // Ordenar por día
      results.sort((a, b) => {
         const dayA = parseInt(a.birthDate.split('-')[2], 10) || 0;
         const dayB = parseInt(b.birthDate.split('-')[2], 10) || 0;
         return dayA - dayB;
      });
    } else {
      if (!isDbConnected()) {
        const todayIso = new Date().toISOString().split('T')[0];
        return res.json({
          success: true,
          data: [
            {
              id: 'mock-1',
              personId: '1001',
              type: 'birthday',
              name: 'Juan Perez (Simulado)',
              email: 'juan@pollofiesta.com',
              birthDate: todayIso
            }
          ]
        });
      }

      [results] = await sequelize.query(`
        SELECT
          p.id_persona,
          p.nombre_completo AS name,
          TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
          p.correo AS email
        FROM rrhh.persona p
        WHERE p.estado = 'ACTIVO'
          AND p.fecha_nacimiento IS NOT NULL
          AND EXTRACT(MONTH FROM p.fecha_nacimiento) = EXTRACT(MONTH FROM (NOW() AT TIME ZONE ${TZ}))
          AND (
            -- Incluir si tiene rol admin
            EXISTS (
              SELECT 1
              FROM master.usuario u
              JOIN master.usuario_rol ur ON u.id_usuario = ur.id_usuario
              JOIN master.rol r ON ur.id_rol = r.id_rol
              WHERE u.id_persona = p.id_persona AND (${ADMIN_CONDITION})
            )
            OR
            -- O si no pertenece a ninguna de las áreas excluidas
            NOT EXISTS (
              SELECT 1
              FROM rrhh.persona_area pa
              JOIN rrhh.area a ON pa.id_area = a.id_area
              WHERE pa.id_persona = p.id_persona
                AND UPPER(a.nombre) IN (${AREAS_EXCLUIDAS})
            )
          )
        ORDER BY EXTRACT(DAY FROM p.fecha_nacimiento) ASC;
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
    
    if (process.env.USE_LOCAL_CSV === 'true') {
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
    } else {
      if (!isDbConnected()) {
        return res.json({
          success: true,
          message: 'Proceso de felicitaciones SIMULADO (Base de datos desconectada)',
          count: 0,
          details: []
        });
      }

      [results] = await sequelize.query(`
        SELECT
          p.id_persona,
          p.nombre_completo AS name,
          TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS "birthDate",
          p.correo AS email
        FROM rrhh.persona p
        WHERE p.estado = 'ACTIVO'
          AND p.fecha_nacimiento IS NOT NULL
          AND EXTRACT(MONTH FROM p.fecha_nacimiento) = EXTRACT(MONTH FROM (NOW() AT TIME ZONE ${TZ}))
          AND EXTRACT(DAY   FROM p.fecha_nacimiento) = EXTRACT(DAY   FROM (NOW() AT TIME ZONE ${TZ}))
          AND (
            -- Incluir si tiene rol admin
            EXISTS (
              SELECT 1
              FROM master.usuario u
              JOIN master.usuario_rol ur ON u.id_usuario = ur.id_usuario
              JOIN master.rol r ON ur.id_rol = r.id_rol
              WHERE u.id_persona = p.id_persona AND (${ADMIN_CONDITION})
            )
            OR
            -- O si no pertenece a ninguna de las áreas excluidas
            NOT EXISTS (
              SELECT 1
              FROM rrhh.persona_area pa
              JOIN rrhh.area a ON pa.id_area = a.id_area
              WHERE pa.id_persona = p.id_persona
                AND UPPER(a.nombre) IN (${AREAS_EXCLUIDAS})
            )
          );
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
