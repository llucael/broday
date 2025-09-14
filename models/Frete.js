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
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  motorista_id: {
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
  sender_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_document: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Informações do destinatário
  recipient_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_document: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Detalhes da carga
  cargo_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargo_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cargo_weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  cargo_dimensions: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Endereço de origem
  origin_cep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin_street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin_complement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  origin_city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin_state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Endereço de destino
  destination_cep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination_street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination_complement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destination_city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination_state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Informações adicionais
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_coleta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_entrega: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'fretes',
  timestamps: true
});

module.exports = Frete;
