'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database').sequelize;

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Frete = require('./Frete');

// Definir associações
User.hasMany(Frete, { foreignKey: 'cliente_id', as: 'fretesCliente' });
User.hasMany(Frete, { foreignKey: 'motorista_id', as: 'fretesMotorista' });
Frete.belongsTo(User, { foreignKey: 'cliente_id', as: 'cliente' });
Frete.belongsTo(User, { foreignKey: 'motorista_id', as: 'motorista' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Frete,
};
