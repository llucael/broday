'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    // Método para verificar senha
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Método para retornar dados seguros do usuário
    toSafeObject() {
      const { password, ...safeUser } = this.toJSON();
      return safeUser;
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    user_type: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    email_verified: DataTypes.BOOLEAN,
    email_verification_code: DataTypes.STRING,
    email_verification_expires: DataTypes.DATE,
    nome: DataTypes.STRING,
    telefone: DataTypes.STRING,
    cpf: {
      type: DataTypes.STRING,
      unique: {
        name: 'unique_cpf',
        msg: 'CPF já está em uso'
      },
      allowNull: true
    },
    empresa: DataTypes.STRING,
    cnpj: {
      type: DataTypes.STRING,
      unique: {
        name: 'unique_cnpj',
        msg: 'CNPJ já está em uso'
      },
      allowNull: true
    },
    cnh: DataTypes.STRING,
    categoria: DataTypes.STRING(10),
    status: DataTypes.STRING(50),
    endereco: DataTypes.TEXT,
    vencimento_cnh: DataTypes.DATE,
    cnh_emissao: DataTypes.DATE,
    cnh_uf: DataTypes.STRING,
    cnh_observacoes: DataTypes.TEXT,
    cnh_validade: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users', // garante nome correto da tabela
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  return User;
};