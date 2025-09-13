'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database').sequelize;

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Frete = require('./Frete');

// Definir associações
User.hasMany(Frete, { foreignKey: 'clienteId', as: 'fretesCliente' });
User.hasMany(Frete, { foreignKey: 'motoristaId', as: 'fretesMotorista' });
Frete.belongsTo(User, { foreignKey: 'clienteId', as: 'cliente' });
Frete.belongsTo(User, { foreignKey: 'motoristaId', as: 'motorista' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Frete,
};
