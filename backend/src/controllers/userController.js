const User = require('../models/User');
const { isDbConnected } = require('../config/db');

// Datos simulados de usuarios en memoria (con IDs únicos)
let mockUsers = [
  { id: '1', name: 'Laura Restrepo', email: 'laura.restrepo@pollofiesta.com', role: 'Administrador', status: 'Activo', movement: 'Entrada', createdAt: '2026-01-15' },
  { id: '2', name: 'Carlos Mario López', email: 'carlos.lopez@pollofiesta.com', role: 'Gestor', status: 'Activo', movement: 'Ninguno', createdAt: '2026-02-10' },
  { id: '3', name: 'Diana Marcela Gómez', email: 'diana.gomez@pollofiesta.com', role: 'Colaborador', status: 'Inactivo', movement: 'Salida', createdAt: '2026-03-05' },
  { id: '4', name: 'Jorge Iván Patiño', email: 'jorge.patino@pollofiesta.com', role: 'Colaborador', status: 'Activo', movement: 'Ninguno', createdAt: '2026-04-12' },
  { id: '5', name: 'Andrés Felipe Castro', email: 'andres.castro@pollofiesta.com', role: 'Gestor', status: 'Activo', movement: 'Entrada', createdAt: '2026-05-20' }
];

const getUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.findAll({ order: [['createdAt', 'DESC']] });
      return res.json({ success: true, data: users });
    }
    return res.json({ success: true, data: mockUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
};

  const createUser = async (req, res) => {
  try {
    const { name, email, role, status, movement } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nombre y correo son requeridos.' });
    }
    
    let newUser;
    if (isDbConnected()) {
      newUser = await User.create({ 
        name, 
        email, 
        role: role || 'Colaborador',
        status: status || 'Activo',
        movement: movement || 'Ninguno'
      });
    } else {
      newUser = {
        id: Date.now().toString(),
        name,
        email,
        role: role || 'Colaborador',
        status: status || 'Activo',
        movement: movement || 'Ninguno',
        createdAt: new Date().toISOString()
      };
      mockUsers.push(newUser);
    }
    res.status(201).json({ success: true, data: newUser, message: 'Usuario creado exitosamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await User.destroy({ where: { id } });
    } else {
      mockUsers = mockUsers.filter(u => u.id !== id && u._id !== id);
    }
    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, movement } = req.body;
    
    let updatedUser;
    if (isDbConnected()) {
      await User.update({ role, status, movement }, { where: { id } });
      updatedUser = await User.findByPk(id);
    } else {
      const idx = mockUsers.findIndex(u => u.id === id || u._id === id);
      if (idx !== -1) {
        if (role !== undefined) mockUsers[idx].role = role;
        if (status !== undefined) mockUsers[idx].status = status;
        if (movement !== undefined) mockUsers[idx].movement = movement;
        updatedUser = mockUsers[idx];
      }
    }
    res.json({ success: true, data: updatedUser, message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};
