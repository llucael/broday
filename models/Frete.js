const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Frete = sequelize.define('Frete', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  motoristaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('solicitado', 'aceito', 'em_transito', 'entregue', 'cancelado'),
    allowNull: false,
    defaultValue: 'solicitado'
  },
  // Informações do remetente
  senderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderDocument: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Informações do destinatário
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipientDocument: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Detalhes da carga
  cargoType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargoValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cargoWeight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  cargoDimensions: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Endereço de origem
  originCep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originStreet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originComplement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  originCity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originState: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Endereço de destino
  destinationCep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationStreet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationComplement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destinationCity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationState: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Informações adicionais
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dataColeta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dataEntrega: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'fretes',
  timestamps: true,
  underscored: true
});

module.exports = Frete;
