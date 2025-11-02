'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database').sequelize;

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Frete = require('./Frete');
const Caminhao = require('./Caminhao');
const Localizacao = require('./Localizacao');
const Endereco = require('./Endereco')(sequelize, Sequelize.DataTypes);

// Definir associações
User.hasMany(Frete, { foreignKey: 'cliente_id', as: 'fretesCliente' });
User.hasMany(Frete, { foreignKey: 'motorista_id', as: 'fretesMotorista' });
Frete.belongsTo(User, { foreignKey: 'cliente_id', as: 'cliente' });
Frete.belongsTo(User, { foreignKey: 'motorista_id', as: 'motorista' });

// Associações para Caminhão
User.hasMany(Caminhao, { foreignKey: 'motorista_id', as: 'caminhoes' });
Caminhao.belongsTo(User, { foreignKey: 'motorista_id', as: 'motorista' });

// Associações para Localização
User.hasMany(Localizacao, { foreignKey: 'motorista_id', as: 'localizacoes' });
Frete.hasMany(Localizacao, { foreignKey: 'frete_id', as: 'localizacoes' });
Localizacao.belongsTo(User, { foreignKey: 'motorista_id', as: 'motorista' });
Localizacao.belongsTo(Frete, { foreignKey: 'frete_id', as: 'frete' });

// Associações para Endereço
User.hasMany(Endereco, { foreignKey: 'cliente_id', as: 'enderecos' });
Endereco.belongsTo(User, { foreignKey: 'cliente_id', as: 'cliente' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Frete,
  Caminhao,
  Localizacao,
  Endereco,
};
