const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CarteleraConfig = sequelize.define('CarteleraConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1 // Usamos un id fijo (1) porque será una única fila para la configuración global
  },
  data: {
    type: DataTypes.JSONB, // Usamos JSONB para replicar la flexibilidad del anterior archivo .json pero con la robustez de Postgres
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'cartelera_config',
  timestamps: true,
});

module.exports = CarteleraConfig;
