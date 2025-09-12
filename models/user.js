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
    email_verified: DataTypes.BOOLEAN
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