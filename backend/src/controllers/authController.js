const User = require('../models/User');
const { Op } = require('sequelize');
const { isDbConnected, sequelize } = require('../config/db');
const axios = require('axios');

/**
 * Consulta el área real de la persona en el esquema rrhh (tablas persona_area y area)
 * y asigna el scope de acceso correspondiente (HSEQ, RRHH o ADMIN)
 */
async function getUserAreaInfo(userId, email, username) {
  try {
    if (!isDbConnected()) {
      return { userScope: 'RRHH', areaName: 'Talento Humano' };
    }

    const [rows] = await sequelize.query(`
      SELECT 
        u.id_usuario,
        u.username,
        u.email,
        p.id_persona,
        p.nombre_completo,
        a.id_area,
        a.nombre AS area_nombre
      FROM master.usuario u
      LEFT JOIN rrhh.persona p ON u.id_persona = p.id_persona
      LEFT JOIN rrhh.persona_area pa ON p.id_persona = pa.id_persona
      LEFT JOIN rrhh.area a ON pa.id_area = a.id_area
      WHERE ${userId ? 'u.id_usuario = :userId' : '(LOWER(u.email) = LOWER(:email) OR u.username = :username)'}
      LIMIT 1
    `, {
      replacements: { 
        userId: userId ? Number(userId) : null, 
        email: email || null,
        username: username || null
      }
    });

    if (rows && rows.length > 0) {
      const row = rows[0];
      const areaName = (row.area_nombre || '').toUpperCase();
      const areaId = row.id_area ? Number(row.id_area) : null;
      let userScope = 'RRHH'; // Default Talento Humano / General

      if (
        areaId === 1 ||
        areaName.includes('HSEQ') ||
        areaName.includes('SST') ||
        areaName.includes('SEGURIDAD') ||
        areaName.includes('AMBIENTAL')
      ) {
        userScope = 'HSEQ';
      } else if (
        areaId === 4 ||
        areaName.includes('TALENTO') ||
        areaName.includes('HUMANA') ||
        areaName.includes('RECURSOS')
      ) {
        userScope = 'RRHH';
      } else if (
        areaId === 12 ||
        areaName.includes('SISTEMAS') ||
        areaName.includes('ADMIN')
      ) {
        userScope = 'ADMIN';
      }

      return {
        areaId: row.id_area,
        areaName: row.area_nombre || 'Talento Humano',
        personName: row.nombre_completo,
        userScope
      };
    }
  } catch (err) {
    console.warn(' [Auth] Error consultando rrhh.persona_area:', err.message);
  }

  return { userScope: 'RRHH', areaName: 'Talento Humano' };
}

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Usuario/Correo y contraseña son requeridos' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Base de datos no conectada' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ],
        password: password
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (user.status !== 'Activo') {
      return res.status(403).json({ success: false, message: 'El usuario se encuentra inactivo' });
    }

    const areaInfo = await getUserAreaInfo(user.id, user.email, user.username);

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        ...areaInfo
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Canjear One-Time Token (OTT) llamando al Backend del Portal FIA
 * y enriquecer el perfil del usuario con su área de rrhh.persona_area
 */
const redeemOtt = async (req, res) => {
  try {
    const { userId, ott } = req.body;

    if (!userId || !ott) {
      return res.status(400).json({ success: false, message: 'userId y ott son requeridos' });
    }

    const portalUrl = process.env.PORTAL_BACKEND_URL || 'https://portal-login-backend-d9hhdshme0hsagdc.brazilsouth-01.azurewebsites.net';

    // 1. Llamar al Portal FIA para canjear el OTT
    const response = await axios.post(`${portalUrl}/api/auth/ott/redeem`, {
      userId: Number(userId),
      ott
    });

    const { accessToken, refreshToken, user } = response.data;

    // 2. Consultar área en rrhh.persona_area
    const areaInfo = await getUserAreaInfo(userId, user?.email, user?.username);

    const enrichedUser = {
      ...user,
      ...areaInfo
    };

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: enrichedUser,
      message: 'Token OTT canjeado y validado exitosamente'
    });
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data?.message || error.message || 'Error validando OTT con el Portal FIA';
    return res.status(status).json({ success: false, message });
  }
};

module.exports = { login, redeemOtt, getUserAreaInfo };
