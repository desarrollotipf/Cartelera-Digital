const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Colaborador'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Activo'
  },
  movement: {
    type: DataTypes.STRING,
    defaultValue: 'Ninguno'
  }
}, {
  timestamps: true
});

module.exports = User;
