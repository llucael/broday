'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../config/database').sequelize;

const User = require('./user')(sequelize, Sequelize.DataTypes);

module.exports = {
  sequelize,
  Sequelize,
  User,
};
