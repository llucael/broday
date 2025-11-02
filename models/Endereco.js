const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Endereco = sequelize.define('Endereco', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome do endereço (ex: Casa, Trabalho, etc.)'
    },
    rua: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    complemento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    cep: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    is_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica se é o endereço principal do cliente'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'enderecos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Definir associações
  Endereco.associate = function(models) {
    Endereco.belongsTo(models.User, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });
  };

  return Endereco;
};