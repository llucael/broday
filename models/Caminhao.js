const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Caminhao = sequelize.define('Caminhao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  motorista_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'caminhoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true
});

module.exports = Caminhao;
