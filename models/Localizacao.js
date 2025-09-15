const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Localizacao = sequelize.define('Localizacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  frete_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fretes',
      key: 'id'
    }
  },
  motorista_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  velocidade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  direcao: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  precisao: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'localizacoes',
  timestamps: true,
  indexes: [
    {
      fields: ['frete_id']
    },
    {
      fields: ['motorista_id']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = Localizacao;
