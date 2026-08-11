const User = require('../models/User');
const { Op } = require('sequelize');
const { isDbConnected } = require('../config/db');

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

    // In a real app we'd use JWT, but for simplicity in this migration we just return the user object
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

module.exports = { login };
