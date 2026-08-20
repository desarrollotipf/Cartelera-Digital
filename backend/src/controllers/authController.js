const User = require('../models/User');
const { Op } = require('sequelize');
const { isDbConnected } = require('../config/db');
const axios = require('axios');

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

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Canjear One-Time Token (OTT) llamando al Backend del Portal FIA
 */
const redeemOtt = async (req, res) => {
  try {
    const { userId, ott } = req.body;

    if (!userId || !ott) {
      return res.status(400).json({ success: false, message: 'userId y ott son requeridos' });
    }

    const portalUrl = process.env.PORTAL_BACKEND_URL || 'https://portal-login-backend-d9hhdshme0hsagdc.brazilsouth-01.azurewebsites.net';

    // Llamar al Portal FIA para canjear el OTT
    const response = await axios.post(`${portalUrl}/api/auth/ott/redeem`, {
      userId: Number(userId),
      ott
    });

    const { accessToken, refreshToken, user } = response.data;

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user,
      message: 'Token OTT canjeado y validado exitosamente'
    });
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data?.message || error.message || 'Error validando OTT con el Portal FIA';
    return res.status(status).json({ success: false, message });
  }
};

module.exports = { login, redeemOtt };

