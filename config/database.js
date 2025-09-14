const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração para desenvolvimento local - usando SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com SQLite estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com SQLite:', error.message);
    process.exit(1);
  }
};



module.exports = { sequelize, testConnection };
